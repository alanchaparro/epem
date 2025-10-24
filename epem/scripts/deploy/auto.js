#!/usr/bin/env node
/*
  Cross‑platform deploy helper
  - Prompts minimal info
  - Writes env file (.env.prod by default)
  - Runs bootstrap (optional) + docker compose up
  - Waits for /health and /login
  - Runs QA backend + frontend
*/

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
process.chdir(repoRoot);

const rl = require('readline').createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    const setKV = (k, v, consumeNext = true) => {
      args[k] = v;
      if (consumeNext) i++;
    };
    switch (a) {
      case '--env-file': setKV('envFile', next); break;
      case '--use-staging': args.useStaging = true; break;
      case '--web-url': setKV('webUrl', next); break;
      case '--api-url': setKV('apiUrl', next); break;
      case '--db-pass': setKV('dbPass', next); break;
      case '--jwt-secret': setKV('jwtSecret', next); break;
      case '--jwt-refresh': setKV('jwtRefresh', next); break;
      case '--no-bootstrap': args.noBootstrap = true; break;
      case '-y':
      case '--yes': args.yes = true; break;
      default:
        // ignore unknown for simplicity
        break;
    }
  }
  return args;
}

function which(cmd) {
  return new Promise((resolve) => {
    const p = spawn(process.platform === 'win32' ? 'where' : 'which', [cmd]);
    p.on('exit', (code) => resolve(code === 0));
  });
}

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} -> ${code}`))));
  });
}

async function httpOk(url, timeoutSec = 60) {
  const deadline = Date.now() + timeoutSec * 1000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function writeEnvFile(envFile, templatePath, answers) {
  let tpl = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';
  const lines = tpl ? tpl.split(/\r?\n/) : [];
  const map = new Map(lines.filter((l) => l.includes('=')).map((l) => [l.split('=')[0], l.split('=').slice(1).join('=')]));
  const set = (k, v) => map.set(k, String(v));

  if (answers.databasePassword) set('DATABASE_PASSWORD', answers.databasePassword);
  if (answers.apiGatewayUrl) set('API_GATEWAY_URL', answers.apiGatewayUrl);
  if (answers.webUrl) {
    set('CORS_ORIGIN', answers.webUrl);
    set('DEFAULT_ORIGIN', answers.webUrl);
    set('NEXT_PUBLIC_API_URL', answers.webUrl);
  }
  if (answers.jwtSecret) set('JWT_SECRET', answers.jwtSecret);
  if (answers.jwtRefresh) set('JWT_REFRESH_SECRET', answers.jwtRefresh);

  const out = Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.writeFileSync(envFile, out, 'utf8');
}

async function main() {
  console.log('[deploy] Auto deploy (Compose)');
  if (!(await which('docker'))) {
    console.error('[deploy] Docker no está instalado o no está en PATH');
    process.exit(1);
  }

  const argv = parseArgs(process.argv);
  const nonInteractive = !!argv.yes;

  const useStaging = argv.useStaging || false;
  const envFile = argv.envFile || '.env.prod';
  const webUrl = argv.webUrl || (nonInteractive ? 'http://localhost:8080' : (await ask('URL pública Web [http://localhost:8080]: ')) || 'http://localhost:8080');
  const apiUrl = argv.apiUrl || (nonInteractive ? 'http://localhost:4000' : (await ask('URL pública API Gateway [http://localhost:4000]: ')) || 'http://localhost:4000');
  const dbPass = argv.dbPass || (nonInteractive ? 'changeme' : (await ask('Password MySQL (para URLs por defecto) [changeme]: ')) || 'changeme');
  const jwtSecret = argv.jwtSecret || (nonInteractive ? `access-${Math.random().toString(36).slice(2)}` : (await ask('JWT_SECRET [auto]: ')) || `access-${Math.random().toString(36).slice(2)}`);
  const jwtRefresh = argv.jwtRefresh || (nonInteractive ? `refresh-${Math.random().toString(36).slice(2)}` : (await ask('JWT_REFRESH_SECRET [auto]: ')) || `refresh-${Math.random().toString(36).slice(2)}`);
  const skipBootstrap = argv.noBootstrap || (nonInteractive ? false : (/^y(es)?$/i).test((await ask('¿Saltar bootstrap de BDs/seeds? [y/N]: ')) || 'n'));

  const tpl = useStaging ? '.env.staging.example' : '.env.prod.example';
  const tplPath = path.join(repoRoot, tpl);
  writeEnvFile(envFile, tplPath, {
    databasePassword: dbPass,
    apiGatewayUrl: apiUrl,
    webUrl,
    jwtSecret,
    jwtRefresh,
  });
  console.log(`[deploy] Escribí ${envFile} desde ${tpl}`);

  if (!skipBootstrap) {
    console.log('[deploy] Bootstrap de BDs y seeds...');
    if (process.platform === 'win32') {
      await run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'ops/docker/bootstrap.ps1']);
    } else {
      await run('bash', ['ops/docker/bootstrap.sh']);
    }
  }

  console.log('[deploy] Levantando stack con Compose...');
  await run('docker', ['compose', '--env-file', envFile, 'up', '-d']);

  console.log('[deploy] Esperando servicios ...');
  const okApi = await httpOk(`${apiUrl.replace(/\/$/, '')}/health`, 90);
  const okWeb = await httpOk(`${webUrl.replace(/\/$/, '')}/login`, 90);
  if (!okApi) console.error('[deploy] Gateway no respondió 200 en /health');
  if (!okWeb) console.error('[deploy] Web no respondió 200 en /login');

  console.log('[deploy] Ejecutando QA de smoke ...');
  process.env.WEB_URL = webUrl;
  try { await run(process.execPath, ['scripts/qa/test-back.js']); } catch {}
  try { await run(process.execPath, ['scripts/qa/test-front.js']); } catch {}

  const back = fs.readFileSync(path.join('docs', 'qa', 'back-report.md'), 'utf8');
  const front = fs.readFileSync(path.join('docs', 'qa', 'front-report.md'), 'utf8');
  const pass = back.includes('Resultado: "PASS"') && front.includes('Resultado: "PASS"');
  if (pass) {
    console.log(`[deploy] PASS. Web: ${webUrl}  API: ${apiUrl}`);
    process.exit(0);
  } else {
    console.error('[deploy] FAIL. Revisa docs/qa/back-report.md y docs/qa/front-report.md');
    process.exit(2);
  }
}

main().finally(() => rl.close());
