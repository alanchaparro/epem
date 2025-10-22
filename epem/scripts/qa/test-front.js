#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

try { require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); } catch {}

const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';
const results = [];
const push = (name, pass, expected, actual) => results.push({ name, pass: !!pass, expected, actual });

async function check200(url) {
  try {
    const res = await fetch(url);
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

function saveReport() {
  const outDir = path.resolve(__dirname, '../../docs/qa');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'front-results.json'), JSON.stringify(results, null, 2), 'utf8');
  const ok = results.every(r => r.pass);
  const lines = [];
  lines.push('# QA Report');
  lines.push(`Resultado: "${ok ? 'PASS' : 'FAIL'}"`);
  lines.push('');
  for (const r of results) {
    lines.push(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.name} - expected: ${r.expected} actual: ${r.actual}`);
  }
  fs.writeFileSync(path.join(outDir, 'front-report.md'), lines.join('\n'), 'utf8');
}

async function main() {
  const loginOk = await check200(`${WEB_URL}/login`);
  push('Página /login responde 200', loginOk, 200, loginOk ? 200 : 'no-conecta');
  const patientsOk = await check200(`${WEB_URL}/patients`);
  push('Página /patients responde 200 (HTML)', patientsOk, 200, patientsOk ? 200 : 'no-conecta');
  saveReport();
}

main().catch(err => {
  push('Error no controlado en QA front', false, true, err.message);
  saveReport();
  process.exit(1);
});

