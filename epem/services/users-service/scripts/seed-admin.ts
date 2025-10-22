import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const candidates = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) dotenv.config({ path: p });
}

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'EPEM';

  if (!email || !password) throw new Error('ADMIN_EMAIL o ADMIN_PASSWORD no definidos en .env');

  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    const data: any = { role: UserRole.ADMIN, isActive: true };
    if (process.env.ADMIN_RESET_PASSWORD === 'true') {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    await prisma.user.update({ where: { id: existing.id }, data });
    console.log(`Usuario existente asegurado como ADMIN: ${normalizedEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email: normalizedEmail, passwordHash, firstName, lastName, role: UserRole.ADMIN, isActive: true },
  });
  console.log(`Usuario administrador creado: ${normalizedEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

