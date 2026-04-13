export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt')
  return bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'))
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcrypt')
  return bcrypt.compare(password, hash)
}

export async function validateCredentials(email: string, password: string) {
  const { prisma } = await import('./db')
  const { verifyPassword } = await import('./auth')

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user || !user.isActive) {
    return null
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return null
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })

  return user
}

export function generateTokenPayload(user: { id: string; role: string }) {
  return { userId: user.id, role: user.role }
}
