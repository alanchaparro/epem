#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main() {
  const root = path.resolve(__dirname, '../../');
  // Load .env from repo root
  try {
    require('dotenv').config({ path: path.join(root, '.env') });
  } catch (e) {
    // dotenv may not be installed hoisted; ignore if missing
  }

  const results = [];

  // Helper to push a standardized result
  const push = (name, pass, expected, actual) => {
    results.push({ name, pass: !!pass, expected, actual });
  };

  // Users-service check (uses generated client committed to repo)
  try {
    const usersClientPath = path.join(root, 'services/users-service/generated/client');
    const { PrismaClient: UsersPrismaClient } = require(usersClientPath);
    const users = new UsersPrismaClient();
    try {
      await users.$connect();
      // Verify table by performing a count
      const c = await users.user.count();
      push('Users DB conectado', true, true, true);
      push('Tabla User existe', true, 'User table present', `count=${c}`);
    } catch (err) {
      push('Users DB conectado', false, true, err && (err.code || err.message));
      push('Tabla User existe', false, 'User table present', err && (err.code || err.message));
    } finally {
      try { await users.$disconnect(); } catch {}
    }
  } catch (e) {
    push('Cargar cliente Prisma Users', false, 'generated client available', e && e.message);
  }

  // Patients-service check (load client from service path to avoid root resolution issues)
  try {
    const patientsClientPath = path.join(root, 'services/patients-service/node_modules/@prisma/client');
    const { PrismaClient: PatientsPrismaClient } = require(patientsClientPath);
    const patients = new PatientsPrismaClient();
    try {
      await patients.$connect();
      const c = await patients.patient.count();
      push('Patients DB conectado', true, true, true);
      push('Tabla Patient existe', true, 'Patient table present', `count=${c}`);
    } catch (err) {
      push('Patients DB conectado', false, true, err && (err.code || err.message));
      push('Tabla Patient existe', false, 'Patient table present', err && (err.code || err.message));
    } finally {
      try { await patients.$disconnect(); } catch {}
    }
  } catch (e) {
    push('Cargar cliente Prisma Patients (@prisma/client)', false, 'generated client available', e && e.message);
  }

  // Write reports
  const outDir = path.join(root, 'docs/qa');
  try { fs.mkdirSync(outDir, { recursive: true }); } catch {}

  const jsonPath = path.join(outDir, 'db-results.json');
  const mdPath = path.join(outDir, 'db-report.md');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');

  const ok = results.every(r => r.pass);
  const lines = [];
  lines.push('# DB QA Report');
  lines.push(`Resultado: "${ok ? 'PASS' : 'FAIL'}"`);
  lines.push('');
  for (const r of results) {
    lines.push(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.name} - expected: ${r.expected} actual: ${r.actual}`);
  }
  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');

  // Also print a concise summary to stdout
  console.log(JSON.stringify({ ok, results }, null, 2));
}

main().catch(err => {
  console.error('Unexpected error in DB check:', err);
  process.exit(1);
});
