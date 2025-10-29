#!/usr/bin/env node
/*
 Quick QA for dashboard API endpoints from the browser perspective.
 1) Login via gateway
 2) GET /analytics/metrics
 3) GET /billing/authorizations?status=PENDING
 Writes docs/qa/dashboard-report.md and returns 0 on PASS, 1 on FAIL.
*/

const fs = require('fs');
const path = require('path');

function env(k, d) { return process.env[k] ?? d; }

const API_GATEWAY_URL = env('API_GATEWAY_URL', 'http://localhost:4000');
const ADMIN_EMAIL = env('ADMIN_EMAIL', 'admin@epem.local');
const ADMIN_PASSWORD = env('ADMIN_PASSWORD', 'admin123');

const results = [];
const push = (name, pass, expected, actual) => results.push({ name, pass: !!pass, expected, actual });

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
}
async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text };
}

function save() {
  const outDir = path.resolve(__dirname, '../..', 'docs/qa');
  fs.mkdirSync(outDir, { recursive: true });
  const ok = results.every(r => r.pass);
  const md = ['# QA Dashboard', `Resultado: "${ok ? 'PASS' : 'FAIL'}"`, ''];
  for (const r of results) md.push(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.name} - expected: ${r.expected} actual: ${r.actual}`);
  fs.writeFileSync(path.join(outDir, 'dashboard-report.md'), md.join('\n'), 'utf8');
  return ok;
}

async function main() {
  // 1) login
  const login = await postJson(`${API_GATEWAY_URL}/auth/login`, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = login.json?.accessToken;
  push('Login devuelve accessToken', !!token, true, token ? 'token' : `status=${login.status}`);
  if (!token) { const ok = save(); process.exit(ok ? 0 : 1); }
  const auth = { Authorization: `Bearer ${token}` };

  // 2) analytics metrics
  const met = await getJson(`${API_GATEWAY_URL}/analytics/metrics`, auth);
  push('GET /analytics/metrics responde 200', met.status === 200, 200, met.status);

  // 3) billing authorizations (PENDING)
  const authz = await getJson(`${API_GATEWAY_URL}/billing/authorizations?status=PENDING`, auth);
  push('GET /billing/authorizations?status=PENDING responde 200', authz.status === 200, 200, authz.status);

  const ok = save();
  process.exit(ok ? 0 : 1);
}

main().catch(e => { console.error(e); push('Error no controlado', false, true, e.message); const ok = save(); process.exit(ok ? 0 : 1); });

