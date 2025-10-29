#!/usr/bin/env node
(async () => {
  const res = await fetch('http://localhost:4000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@epem.local', password: 'admin123' }),
  });
  const j = await res.json();
  const t = j.accessToken;
  const r = await fetch('http://localhost:3040/metrics', { headers: { Authorization: `Bearer ${t}` } });
  console.log('status', r.status);
  console.log(await r.text());
})();

