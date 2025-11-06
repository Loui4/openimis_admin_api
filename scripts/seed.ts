import { PrismaClient } from '@prisma/client';
import { randomUUID, randomBytes, pbkdf2Sync } from 'crypto';

const prisma = new PrismaClient();

/**
 * Hash password in OpenIMIS-compatible PBKDF2 SHA256 format
 */
function hashPassword(password: string, salt?: string) {
  const iterations = 600000;
  const keylen = 32;
  const digest = 'sha256';
  const saltToUse = salt ?? randomBytes(12).toString('base64');

  const hash = pbkdf2Sync(password, saltToUse, iterations, keylen, digest).toString('base64');
  return `pbkdf2_sha256$${iterations}$${saltToUse}$${hash}`;
}

async function main() {
  const adminUsername = process.env.ADMIN_SEED_USERNAME || 'admin';
  const adminEmail = 'admin@example.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin@123';

  const passwordHash = hashPassword(adminPassword);

  // Check if user already exists
  const existing = await prisma.core_TechnicalUser.findUnique({
    where: { username: adminUsername },
  });

  if (existing) {
    console.log(`✅ Admin user already exists: ${adminUsername}`);
    await prisma.$disconnect();
    return;
  }

  await prisma.core_TechnicalUser.create({
    data: {
      id: randomUUID(),
      username: adminUsername,
      email: adminEmail,
      password: passwordHash,
      is_staff: true,
      is_superuser: true,
      validity_from: new Date(),
    },
  });

  console.log('✅ Admin user seeded successfully');
  console.log(`Username: ${adminUsername}`);
  console.log(`Password: ${adminPassword}`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
