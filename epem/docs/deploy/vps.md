# Despliegue en VPS (Linux)

Objetivo: migrar desde XAMPP local a un VPS Linux (Ubuntu/Debian) con servicios estables, TLS y QA PASS.

## Requisitos
- SO: Ubuntu 22.04/24.04 o Debian 12
- Node.js 20.x (LTS) y pnpm 8.x
- MySQL 8.x (o MariaDB 10.6+)
- Nginx + Certbot (TLS)

## Preparación del servidor
- Actualizar sistema: `sudo apt update && sudo apt -y upgrade`
- Instalar Node 20 y pnpm:
  - Node (nvm recomendado) o repositorio oficial
  - pnpm: `corepack enable && corepack prepare pnpm@8 --activate`
- Instalar MySQL/MariaDB y crear usuario/app:
  - Crear BDs: `epem`, `epem_users`, `epem_catalog`
  - Crear usuario app con permisos mínimos sobre esas BDs

Ejemplo SQL (ajustar password):
```
CREATE DATABASE IF NOT EXISTS epem CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS epem_users CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS epem_catalog CHARACTER SET utf8mb4;
CREATE USER 'epem_app'@'%' IDENTIFIED BY 'StrongPass!';
GRANT ALL PRIVILEGES ON epem.* TO 'epem_app'@'%';
GRANT ALL PRIVILEGES ON epem_users.* TO 'epem_app'@'%';
GRANT ALL PRIVILEGES ON epem_catalog.* TO 'epem_app'@'%';
FLUSH PRIVILEGES;
```

## Código y configuración
- Ruta sugerida: `/opt/epem`
- Clonar repo y crear `.env` desde `.env.example` (ajustar URLs/credenciales productivas)
- Importante: Prisma soporta Linux y Windows (ya configurado `binaryTargets`)

Variables clave del `.env` en VPS:
- `USERS_SERVICE_DATABASE_URL`, `PATIENTS_SERVICE_DATABASE_URL`, `CATALOG_SERVICE_DATABASE_URL` apuntando al MySQL del VPS
- `API_GATEWAY_PORT=4000`, `NEXT_PUBLIC_API_URL=https://tu-dominio` (o http en staging)
- JWT secretos fuertes

## Build y migraciones
```
cd /opt/epem
pnpm install
pnpm -r run build
# Migraciones (deploy en prod)
pnpm --filter @epem/users-service prisma:migrate
pnpm --filter @epem/patients-service prisma:migrate
pnpm --filter @epem/catalog-service prisma:migrate
# Seeds opcionales
pnpm --filter @epem/users-service seed:admin
pnpm --filter @epem/patients-service seed:patients
pnpm --filter @epem/catalog-service seed:items
```

## Systemd (servicios)
Crear archivos de unidad en `/etc/systemd/system/`.

`/etc/systemd/system/epem-gateway.service`:
```
[Unit]
Description=EPEM API Gateway
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/epem/services/api-gateway
EnvironmentFile=/opt/epem/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=3
User=www-data

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/epem-users.service` (similar para patients y catalog):
```
[Unit]
Description=EPEM Users Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/epem/services/users-service
EnvironmentFile=/opt/epem/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=3
User=www-data

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/epem-patients.service`
`/etc/systemd/system/epem-catalog.service` â†’ copiar y cambiar WorkingDirectory/Descripción.

`/etc/systemd/system/epem-web.service` (Next.js en modo start):
```
[Unit]
Description=EPEM Web (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/epem/apps/web
EnvironmentFile=/opt/epem/.env
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=3
User=www-data

[Install]
WantedBy=multi-user.target
```

Activar y arrancar:
```
sudo systemctl daemon-reload
sudo systemctl enable epem-gateway epem-users epem-patients epem-catalog epem-web
sudo systemctl start epem-gateway epem-users epem-patients epem-catalog epem-web
```

## Nginx (reverse proxy + TLS)
Servidor para la Web (3000) y API (4000). Con Certbot para certificados.

`/etc/nginx/sites-available/epem`:
```
server {
  listen 80;
  server_name tu-dominio;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 80;
  server_name api.tu-dominio;
  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Activar y TLS:
```
sudo ln -s /etc/nginx/sites-available/epem /etc/nginx/sites-enabled/epem
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio -d api.tu-dominio
```

## QA en VPS
- Backend: `node scripts/qa/test-back.js`
- Front: `node scripts/qa/test-front.js`
- DB: `powershell scripts/qa/check-db.ps1` (o revisar BDs/tablas manualmente)
- Gate: `powershell scripts/qa/require-pass.ps1`

Criterio: reportes `docs/qa/*-report.md` en PASS y `docs/qa/sign-off.md` completado.

## Operación
- Logs: `journalctl -u epem-*.service -e -f`
- Restart: `sudo systemctl restart epem-<servicio>.service`
- Actualizaciones: pull, build, migrate deploy, restart.

## Notas de seguridad
- Configurar CORS y cookies de sesión por dominio
- JWT secretos fuertes en `.env` (no commitear)
- UFW: permitir 22/80/443
- Fail2ban recomendado


