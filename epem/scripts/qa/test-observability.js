#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
try { require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); } catch {}

const results = [];
const push = (name, pass, expected, actual) => results.push({ name, pass: !!pass, expected, actual });

async function ok(url, timeoutSec = 10) {
  const deadline = Date.now() + timeoutSec * 1000;
  while (Date.now() < deadline) {
    try { const r = await fetch(url); if (r.ok) return { ok: true, status: r.status, text: await r.text() }; } catch {}
    await new Promise(r => setTimeout(r, 400));
  }
  return { ok: false, status: 'timeout' };
}

function save(reportName = 'observability-report.md') {
  const outDir = path.resolve(__dirname, '../../docs/qa');
  fs.mkdirSync(outDir, { recursive: true });
  const lines = ['# QA Report', 'Resultado: "' + (results.every(r => r.pass) ? 'PASS' : 'FAIL') + '"', ''];
  for (const r of results) lines.push(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.name} - expected: ${r.expected} actual: ${r.actual}`);
  fs.writeFileSync(path.join(outDir, reportName), lines.join('\n'), 'utf8');
}

(async () => {
  const skipPromReady = process.env.SKIP_PROMETHEUS_READY === 'true' || process.env.EPEM_SKIP_PROMETHEUS === 'true';
  const endpoints = [
    { name: 'Gateway agregador /analytics/prometheus', url: 'http://localhost:4000/analytics/prometheus', requires: '# HELP' },
    { name: 'Users /api/metrics/prometheus', url: 'http://localhost:3020/api/metrics/prometheus', requires: '# HELP' },
    { name: 'Patients /metrics/prometheus', url: 'http://localhost:3010/metrics/prometheus', requires: '# HELP' },
    { name: 'Catalog /metrics/prometheus', url: 'http://localhost:3030/metrics/prometheus', requires: '# HELP' },
    { name: 'Billing /metrics/prometheus', url: 'http://localhost:3040/metrics/prometheus', requires: '# HELP' },
  ];
  for (const ep of endpoints) {
    const r = await ok(ep.url, 10);
    const pass = r.ok && (!ep.requires || (r.text && r.text.includes(ep.requires)));
    push(ep.name, pass, true, r.ok ? r.status : r.status);
  }

  // Prometheus (si corre)
  try {
    if (skipPromReady) {
      push('Prometheus ready', true, true, 'skipped');
    } else {
      const p = await ok('http://localhost:9090/-/ready', 5);
      push('Prometheus ready', p.ok, true, p.ok ? p.status : p.status);
    }
  } catch { push('Prometheus ready', false, true, 'error'); }

  save('observability-report.md');
})().catch(e => { push('Observability test crashed', false, true, e.message); save('observability-report.md'); process.exit(2); });
