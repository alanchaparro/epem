import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { PrismaClient, Prisma } from '../generated/client';

const candidates = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '.env'),
];
for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
  }
}

const prisma = new PrismaClient();

const items: Array<[string, string, number]> = [
  ['GUA01', 'Consulta de guardia', 3000],
  ['LAB01', 'Laboratorio basico', 5500],
  ['LAB02', 'Laboratorio avanzado', 9000],
  ['RX01', 'Radiografia simple', 4500],
  ['RX02', 'Radiografia contrastada', 8000],
  ['ECG01', 'Electrocardiograma', 3500],
  ['ECO01', 'Ecografia abdominal', 12000],
  ['ECO02', 'Ecografia doppler', 16000],
  ['FAR01', 'Medicamentos kit emergencia', 2000],
  ['ENF01', 'Curaciones y enfermeria', 2500],
  ['AMB01', 'Traslado ambulatorio', 20000],
  ['AMB02', 'Traslado urgente', 40000],
  ['OXI01', 'Oxigenoterapia', 3000],
  ['TER01', 'Terapia respiratoria', 5000],
  ['VAC01', 'Vacunacion', 3500],
];

async function main() {
  for (const [code, name, price] of items) {
    await prisma.serviceItem.upsert({
      where: { code },
      update: {
        name,
        basePrice: new Prisma.Decimal(price),
        active: true,
      },
      create: {
        code,
        name,
        basePrice: new Prisma.Decimal(price),
        active: true,
      },
    });
  }

  console.log('Seed de catalogo sincronizado (15 prestaciones).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
