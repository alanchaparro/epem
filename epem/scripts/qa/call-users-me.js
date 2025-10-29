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
  const res = await fetch('http://localhost:4000/users/me', { headers: { Authorization: `Bearer ${t}` } });
  console.log('status', res.status);
  console.log(await res.text());
})().catch(e => { console.error(e); process.exit(1); });

