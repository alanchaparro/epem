(async () => {
  const res = await fetch('http://localhost:4000/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@epem.local', password: 'admin123' }) });
  const j = await res.json();
  console.log(j);
})();
