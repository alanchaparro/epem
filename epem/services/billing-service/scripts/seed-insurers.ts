import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { PrismaClient } from '../generated/client';

const candidates = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

const prisma = new PrismaClient();

async function main() {
  const insurers = [
    { name: 'Salud Total', planCode: 'PLAN-STD', active: true },
    { name: 'Coberturas Plus', planCode: 'PLAN-PLUS', active: true },
    { name: 'Mutual Emergencias', planCode: 'PLAN-EMG', active: true },
  ];

  const coverageSeed = [
    { planCode: 'PLAN-STD', serviceItemId: 'LAB01', copay: 500, requiresAuth: false },
    { planCode: 'PLAN-STD', serviceItemId: 'RX01', copay: 800, requiresAuth: false },
    { planCode: 'PLAN-PLUS', serviceItemId: 'ECO01', copay: 1200, requiresAuth: true },
    { planCode: 'PLAN-PLUS', serviceItemId: 'AMB02', copay: 5000, requiresAuth: true },
    { planCode: 'PLAN-EMG', serviceItemId: 'GUA01', copay: 300, requiresAuth: false },
  ];

  const insurerMap: Record<string, string> = {};
  for (const data of insurers) {
    const record = await prisma.insurer.upsert({
      where: { planCode: data.planCode },
      update: data,
      create: data,
    });
    insurerMap[data.planCode] = record.id;
  }

  for (const entry of coverageSeed) {
    const insurerId = insurerMap[entry.planCode];
    if (!insurerId) continue;
    const existing = await prisma.coverage.findFirst({
      where: { insurerId, serviceItemId: entry.serviceItemId },
    });
    if (existing) {
      await prisma.coverage.update({
        where: { id: existing.id },
        data: {
          copay: entry.copay,
          requiresAuth: entry.requiresAuth,
        },
      });
    } else {
      await prisma.coverage.create({
        data: {
          insurerId,
          serviceItemId: entry.serviceItemId,
          copay: entry.copay,
          requiresAuth: entry.requiresAuth,
        },
      });
    }
  }

  console.log('Seed de aseguradoras y coberturas completado.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

