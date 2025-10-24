import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/client';

const candidates = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const p of candidates) { if (fs.existsSync(p)) dotenv.config({ path: p }); }

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.patient.count();
  if (existing > 0) {
    console.log(`Patients already exist (${existing}). Skipping seed.`);
    return;
  }

  const today = new Date();
  const sample = [
    ['Juan', 'Pérez', '20333444'],
    ['María', 'Gómez', '28444555'],
    ['Luis', 'Rodríguez', '30111222'],
    ['Ana', 'Fernández', '27555111'],
    ['Carlos', 'López', '26123456'],
    ['Lucía', 'Martínez', '33999888'],
    ['Sofía', 'Sánchez', '40222333'],
    ['Diego', 'Torres', '23888999'],
    ['Julieta', 'Romero', '35666777'],
    ['Pedro', 'Silva', '29888777'],
  ];

  await prisma.patient.createMany({
    data: sample.map(([first, last, dni], i) => ({
      firstName: first,
      lastName: last,
      dni,
      birthDate: new Date(today.getFullYear() - (25 + i), 0, 15),
      phone: `11-5555-55${(10 + i).toString().slice(-2)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@mail.com`,
      address: `Calle ${i + 1} #123`,
    }))
  });

  console.log('Seeded 10 patients.');
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });

