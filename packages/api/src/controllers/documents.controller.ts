import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../plugins/prisma'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

export async function uploadDocument(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user.userId
  
  const data = await request.file()
  
  if (!data) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'NO_FILE',
        message: 'No file uploaded',
      },
    })
  }

  const { assignmentId, documentType } = request.query as {
    assignmentId: string
    documentType: string
  }

  if (!assignmentId || !documentType) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'MISSING_PARAMS',
        message: 'Assignment ID and document type are required',
      },
    })
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  })

  if (!assignment) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'ASSIGNMENT_NOT_FOUND',
        message: 'Assignment not found',
      },
    })
  }

  const allowedTypes = ['POD_SIGNATURE', 'POD_PHOTO', 'CONTRACT', 'OTHER']
  if (!allowedTypes.includes(documentType)) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'INVALID_DOCUMENT_TYPE',
        message: 'Invalid document type',
      },
    })
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedMimeTypes.includes(data.mimetype)) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Only images and PDFs are allowed',
      },
    })
  }

  const maxFileSize = 10 * 1024 * 1024 // 10MB
  const buffer = await data.toBuffer()
  if (buffer.length > maxFileSize) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 10MB limit',
      },
    })
  }

  const fileExt = path.extname(data.filename || 'file.jpg')
  const fileName = `${uuidv4()}${fileExt}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.writeFile(filePath, buffer)

  const document = await prisma.document.create({
    data: {
      assignmentId,
      documentType: documentType as any,
      filePath,
      fileName: data.filename || fileName,
      fileSize: buffer.length,
      mimeType: data.mimetype,
      uploadedById: userId,
    },
  })

  return reply.status(201).send({
    success: true,
    data: document,
  })
}

export async function getDocument(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      },
    })
  }

  try {
    const fileBuffer = await fs.readFile(document.filePath)
    
    reply.header('Content-Type', document.mimeType)
    reply.header('Content-Disposition', `inline; filename="${document.fileName}"`)
    
    return reply.send(fileBuffer)
  } catch {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: 'File not found on server',
      },
    })
  }
}

export async function deleteDocument(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string }
  
  const document = await prisma.document.findUnique({
    where: { id },
  })

  if (!document) {
    return reply.status(404).send({
      success: false,
      error: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found',
      },
    })
  }

  try {
    await fs.unlink(document.filePath)
  } catch {
    // File might not exist, continue
  }

  await prisma.document.delete({
    where: { id },
  })

  return reply.send({
    success: true,
    data: { message: 'Document deleted successfully' },
  })
}
