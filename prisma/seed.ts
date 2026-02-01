import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bloodbank.com' },
    update: {},
    create: {
      email: 'admin@bloodbank.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create a blood bank organization
  const bloodBank = await prisma.organization.upsert({
    where: { licenseNo: 'BB-001' },
    update: {},
    create: {
      name: 'Central Blood Bank',
      type: 'BLOOD_BANK',
      address: '123 Medical Center Drive',
      contactInfo: '+1-555-0100',
      licenseNo: 'BB-001',
    },
  });
  console.log('Created blood bank:', bloodBank.name);

  // Create a hospital organization
  const hospital = await prisma.organization.upsert({
    where: { licenseNo: 'H-001' },
    update: {},
    create: {
      name: 'City General Hospital',
      type: 'HOSPITAL',
      address: '456 Healthcare Avenue',
      contactInfo: '+1-555-0200',
      licenseNo: 'H-001',
    },
  });
  console.log('Created hospital:', hospital.name);

  // Create blood bank staff
  const staffPassword = await bcrypt.hash('staff123', 12);
  const bloodBankStaff = await prisma.user.upsert({
    where: { email: 'staff@bloodbank.com' },
    update: {},
    create: {
      email: 'staff@bloodbank.com',
      passwordHash: staffPassword,
      role: Role.BLOOD_BANK_STAFF,
      organizationId: bloodBank.id,
    },
  });
  console.log('Created blood bank staff:', bloodBankStaff.email);

  // Create hospital staff
  const hospitalStaff = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      email: 'doctor@hospital.com',
      passwordHash: staffPassword,
      role: Role.HOSPITAL_STAFF,
      organizationId: hospital.id,
    },
  });
  console.log('Created hospital staff:', hospitalStaff.email);

  // Create regulator
  const regulatorPassword = await bcrypt.hash('regulator123', 12);
  const regulator = await prisma.user.upsert({
    where: { email: 'regulator@health.gov' },
    update: {},
    create: {
      email: 'regulator@health.gov',
      passwordHash: regulatorPassword,
      role: Role.REGULATOR,
    },
  });
  console.log('Created regulator:', regulator.email);

  // Create a donor user
  const donorPassword = await bcrypt.hash('donor123', 12);
  const donorUser = await prisma.user.upsert({
    where: { email: 'donor@example.com' },
    update: {},
    create: {
      email: 'donor@example.com',
      passwordHash: donorPassword,
      role: Role.DONOR,
    },
  });
  console.log('Created donor user:', donorUser.email);

  console.log('\n--- Seed Complete ---');
  console.log('\nTest accounts:');
  console.log('Admin: admin@bloodbank.com / admin123');
  console.log('Blood Bank Staff: staff@bloodbank.com / staff123');
  console.log('Hospital Staff: doctor@hospital.com / staff123');
  console.log('Regulator: regulator@health.gov / regulator123');
  console.log('Donor: donor@example.com / donor123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
