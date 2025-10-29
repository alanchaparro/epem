#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load .env from repo root
try { require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); } catch {}

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3020';
const PATIENTS_SERVICE_URL = process.env.PATIENTS_SERVICE_URL || 'http://localhost:3010';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3030';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epem.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const results = [];
const push = (name, pass, expected, actual) => results.push({ name, pass: !!pass, expected, actual });

async function waitHttpOk(url, timeoutSec = 15) {
  const deadline = Date.now() + timeoutSec * 1000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status >= 200 && res.status < 300) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(globalThis.__qaAuthHeader || {}), ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, json, text };
}

async function patchJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(globalThis.__qaAuthHeader || {}), ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, json, text };
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { ...(globalThis.__qaAuthHeader || {}), ...headers } });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: res.status, json, text };
}

function saveReport() {
  const outDir = path.resolve(__dirname, '../../docs/qa');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'back-results.json'), JSON.stringify(results, null, 2), 'utf8');
  const ok = results.every(r => r.pass);
  const lines = [];
  lines.push('# QA Report');
  lines.push(`Resultado: "${ok ? 'PASS' : 'FAIL'}"`);
  lines.push('');
  for (const r of results) {
    lines.push(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.name} - expected: ${r.expected} actual: ${r.actual}`);
  }
  fs.writeFileSync(path.join(outDir, 'back-report.md'), lines.join('\n'), 'utf8');
}

async function main() {
  // 1) Health checks
  const gOk = await waitHttpOk(`${API_GATEWAY_URL}/health`, 30);
  push('Gateway /health responde', gOk, true, `${API_GATEWAY_URL}/health`);
  const uOk = await waitHttpOk(`${USERS_SERVICE_URL}/api/health`, 30);
  push('Users-service /api/health responde', uOk, true, `${USERS_SERVICE_URL}/api/health`);
  const pOk = await waitHttpOk(`${PATIENTS_SERVICE_URL}/health`, 30);
  push('Patients-service /health responde', pOk, true, `${PATIENTS_SERVICE_URL}/health`);

  // 2) Login
  let token = null;
  try {
    const { status, json, text } = await postJson(`${API_GATEWAY_URL}/auth/login`, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    token = json && json.accessToken ? json.accessToken : null;
    if (token) {
      globalThis.__qaAuthHeader = { Authorization: `Bearer ${token}` };
    }
    push('Login devuelve accessToken', !!token, true, token || `status=${status}`);
  } catch (e) {
    push('Login devuelve accessToken', false, true, e.message);
  }

  // 3) Perfil /users/me
  try {
    const { status, json, text } = await getJson(`${API_GATEWAY_URL}/users/me`, token ? { Authorization: `Bearer ${token}` } : {});
    const ok = json && json.email === ADMIN_EMAIL;
    push('Perfil /users/me email coincide', ok, ADMIN_EMAIL, json && json.email ? json.email : `status=${status}`);
  } catch (e) {
    push('Perfil /users/me accesible', false, true, e.message);
  }

  // 4) Patients list
  try {
    const { status, json } = await getJson(`${API_GATEWAY_URL}/patients?q=perez&skip=0&take=5`);
    const ok = json && json.items != null;
    push('Listado de pacientes devuelve items', ok, true, json && json.items ? json.items.length : `status=${status}`);
  } catch (e) {
    push('Listado de pacientes', false, true, e.message);
  }

  // 5) Create + Patch patient
  try {
    const dni = String(Date.now()).slice(-10);
    const create = await postJson(`${API_GATEWAY_URL}/patients`, { dni, firstName: 'QA', lastName: 'Tester', birthDate: '1999-01-01' });
    const id = create.json && create.json.id;
    push('Crear paciente devuelve id', !!id, true, id || `status=${create.status}`);
    if (id) {
      const patch = await patchJson(`${API_GATEWAY_URL}/patients/${id}`, { phone: '11-0000-0000' });
      const ok = patch.json && patch.json.phone === '11-0000-0000';
      push('Patch de paciente actualiza phone', ok, '11-0000-0000', patch.json && patch.json.phone);
    }
    // duplicate
    const dup = await postJson(`${API_GATEWAY_URL}/patients`, { dni, firstName: 'QA', lastName: 'Tester', birthDate: '1999-01-01' });
    push('Crear paciente duplicado devuelve 409', dup.status === 409, 409, dup.status);
  } catch (e) {
    push('Crear/Patch de paciente', false, true, e.message);
  }

  // 6) Catalog-service (optional)
  try {
    const okCat = await waitHttpOk(`${CATALOG_SERVICE_URL}/health`, 5);
    push('Catalog-service /health responde', okCat, true, okCat);
    if (okCat) {
      const code = 'QA' + String(Date.now()).slice(-6);
      const createItem = await postJson(`${API_GATEWAY_URL}/catalog/items`, { code, name: 'Prestación QA', basePrice: 123.45 });
      const id = createItem.json && createItem.json.id;
      push('Crear prestación devuelve id', !!id, true, id || `status=${createItem.status}`);
      if (id) {
        const patchItem = await patchJson(`${API_GATEWAY_URL}/catalog/items/${id}`, { name: 'Prestación QA Edit', active: false });
        const ok = patchItem.json && patchItem.json.name === 'Prestación QA Edit';
        push('Editar prestación actualiza nombre', ok, 'Prestación QA Edit', patchItem.json && patchItem.json.name);
      }
      const dup = await postJson(`${API_GATEWAY_URL}/catalog/items`, { code, name: 'Prestación QA', basePrice: 123.45 });
      push('Crear prestación duplicada devuelve 409', dup.status === 409, 409, dup.status);
    }
  } catch (e) {
    push('Catálogo CRUD', false, true, e.message);
  }

  saveReport();
}

main().catch(err => {
  push('Error no controlado en QA backend', false, true, err.message);
  saveReport();
  process.exit(1);
});
