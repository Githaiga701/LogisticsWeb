import { PrismaClient, UserRole, DriverStatus, UnitType, BodyType, UnitStatus, JobPriority, JobStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  const passwordHash = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@logistics.com' },
    update: {},
    create: {
      email: 'admin@logistics.com',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  console.log('Created admin user:', admin.email)

  const dispatch = await prisma.user.upsert({
    where: { email: 'dispatch@logistics.com' },
    update: {},
    create: {
      email: 'dispatch@logistics.com',
      passwordHash,
      role: UserRole.DISPATCH,
      isActive: true,
    },
  })

  console.log('Created dispatch user:', dispatch.email)

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@logistics.com' },
    update: {},
    create: {
      email: 'driver@logistics.com',
      passwordHash,
      role: UserRole.DRIVER,
      isActive: true,
    },
  })

  console.log('Created driver user:', driverUser.email)

  const driver = await prisma.driver.upsert({
    where: { id: 'seed-driver-1' },
    update: {},
    create: {
      id: 'seed-driver-1',
      userId: driverUser.id,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      licenseNumber: 'DL123456',
      licenseClass: 'A',
      licenseExpiry: new Date('2025-12-31'),
      status: DriverStatus.AVAILABLE,
    },
  })

  console.log('Created driver:', driver.firstName, driver.lastName)

  const unit = await prisma.unit.upsert({
    where: { id: 'seed-unit-1' },
    update: {},
    create: {
      id: 'seed-unit-1',
      plateNumber: 'ABC-1234',
      capacityTons: 10.5,
      unitType: UnitType.TRUCK,
      bodyType: BodyType.CLOSED,
      insuranceProvider: 'Safe Insurance Co.',
      insurancePolicy: 'POL-123456',
      insuranceExpiry: new Date('2025-06-30'),
      registrationExpiry: new Date('2025-12-31'),
      status: UnitStatus.AVAILABLE,
    },
  })

  console.log('Created unit:', unit.plateNumber)

  const client = await prisma.client.upsert({
    where: { id: 'seed-client-1' },
    update: {},
    create: {
      id: 'seed-client-1',
      companyName: 'Acme Corporation',
      billingAddress: '123 Business St, City, Country',
      billingEmail: 'billing@acme.com',
      notes: 'Priority client',
      isActive: true,
    },
  })

  console.log('Created client:', client.companyName)

  const contact = await prisma.clientContact.create({
    data: {
      clientId: client.id,
      name: 'Jane Smith',
      phone: '+0987654321',
      email: 'jane@acme.com',
      isPrimary: true,
    },
  })

  console.log('Created contact:', contact.name)

  const pickupLocation = await prisma.location.create({
    data: {
      name: 'Main Warehouse',
      address: '456 Warehouse Ave',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      country: 'Country',
      locationType: 'WAREHOUSE',
    },
  })

  console.log('Created pickup location:', pickupLocation.name)

  const dropoffLocation = await prisma.location.create({
    data: {
      name: 'Client Depot',
      address: '789 Depot St',
      city: 'ClientCity',
      state: 'ClientState',
      postalCode: '54321',
      country: 'Country',
      locationType: 'CLIENT_SITE',
      clientId: client.id,
    },
  })

  console.log('Created dropoff location:', dropoffLocation.name)

  console.log('Seed completed successfully!')
  console.log('\nTest Credentials:')
  console.log('Admin: admin@logistics.com / Admin123!')
  console.log('Dispatch: dispatch@logistics.com / Admin123!')
  console.log('Driver: driver@logistics.com / Admin123!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
