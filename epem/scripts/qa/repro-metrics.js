#!/usr/bin/env node
(async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@epem.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const login = await fetch('http://localhost:4000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await login.json();
  const t = j.accessToken;
  const h = { Authorization: `Bearer ${t}` };
  const endpoints = [
    ['gateway analytics', 'http://localhost:4000/analytics/metrics'],
    ['billing authorizations', 'http://localhost:4000/billing/authorizations?status=PENDING'],
    ['billing health', 'http://localhost:3040/health'],
    ['billing metrics', 'http://localhost:3040/metrics'],
  ];
  for (const [name, url] of endpoints) {
    const res = await fetch(url, { headers: url.includes('localhost:3040') ? h : h });
    console.log(name, res.status);
  }
})().catch(e => { console.error(e); process.exit(1); });

