import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Carga .env raíz
const candidates = [path.resolve(__dirname, '../../../.env'), path.resolve(process.cwd(), '../../.env'), path.resolve(process.cwd(), '.env')];
for (const p of candidates) { if (fs.existsSync(p)) dotenv.config({ path: p }); }

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.serviceItem.count();
  if (count > 0) { console.log(`ServiceItem ya tiene ${count} registros. Omitiendo seed.`); return; }
  const items = [
    ['GUA01','Consulta de guardia',3000],
    ['LAB01','Laboratorio básico',5500],
    ['LAB02','Laboratorio avanzado',9000],
    ['RX01','Radiografía simple',4500],
    ['RX02','Radiografía contrastada',8000],
    ['ECG01','Electrocardiograma',3500],
    ['ECO01','Ecografía abdominal',12000],
    ['ECO02','Ecografía doppler',16000],
    ['FAR01','Medicamentos (kit emergencia)',2000],
    ['ENF01','Curaciones y enfermería',2500],
    ['AMB01','Traslado ambulatorio',20000],
    ['AMB02','Traslado urgente',40000],
    ['OXI01','Oxigenoterapia',3000],
    ['TER01','Terapia respiratoria',5000],
    ['VAC01','Vacunación',3500],
  ];
  await prisma.serviceItem.createMany({ data: items.map(([code,name,price]) => ({ code: code as string, name: name as string, basePrice: price as number })) });
  console.log('Seed de catálogo (15 prestaciones) completado.');
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });

