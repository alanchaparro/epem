#!/usr/bin/env node
/*
  Initialize env files from templates without committing secrets.
  Usage:
    node scripts/env-init.js                 -> copies .env.example to .env if missing
    node scripts/env-init.js --from .env.prod.example --to .env.prod
*/
const fs = require('fs');
const path = require('path');

function parseArgs(argv){
  const args = {};
  for(let i=2;i<argv.length;i++){
    const a = argv[i];
    const n = argv[i+1];
    switch(a){
      case '--from': args.from = n; i++; break;
      case '--to': args.to = n; i++; break;
      default: break;
    }
  }
  return args;
}

const { from, to } = parseArgs(process.argv);
const tpl = path.resolve(process.cwd(), from || '.env.example');
const out = path.resolve(process.cwd(), to || '.env');

if(!fs.existsSync(tpl)){
  console.error(`[env-init] No existe la plantilla: ${tpl}`);
  process.exit(1);
}
if(fs.existsSync(out)){
  console.log(`[env-init] ${path.basename(out)} ya existe — nada que hacer.`);
  process.exit(0);
}

fs.copyFileSync(tpl, out);
console.log(`[env-init] Creado ${path.basename(out)} desde ${path.basename(tpl)}`);

