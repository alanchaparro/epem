#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', 'generated']);
const PATTERNS = [
  /AWS_ACCESS_KEY_ID|AKIA[0-9A-Z]{16}/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
  /password\s*=/i,
  /passwd\s*=/i,
  /JWT_SECRET\s*=/i,
  /JWT_REFRESH_SECRET\s*=/i,
  /(SERVICE_)?DATABASE_URL\s*=/i,
  /GOOGLE_PRIVATE_KEY|client_secret/i,
];

function scanFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  for (const re of PATTERNS) {
    if (re.test(text)) {
      return re.toString();
    }
  }
  return null;
}

function* walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      yield* walk(p);
    } else {
      yield p;
    }
  }
}

let leaks = [];
for (const file of walk(process.cwd())) {
  // skip binary-ish
  if (/\.(png|jpg|jpeg|webp|gif|ico|lock|gz|zip|pack)$/i.test(file)) continue;
  if (/\.env(\..*)?$/.test(file) && !file.endsWith('.example')) {
    leaks.push({ file, match: 'env-file' });
    continue;
  }
  const m = scanFile(file);
  if (m) leaks.push({ file, match: m });
}

if (leaks.length) {
  console.error('[secrets-scan] Posibles secretos encontrados:');
  for (const l of leaks) console.error(` - ${l.file} :: ${l.match}`);
  process.exit(2);
} else {
  console.log('[secrets-scan] OK: no se detectaron patrones sensibles.');
}

