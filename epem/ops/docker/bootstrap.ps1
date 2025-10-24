param(
  [string]$EnvFile = ".env.prod",
  [string]$ComposeBin = "docker compose"
)

function Invoke-Compose {
  param([string[]]$Args)
  & $ComposeBin --env-file $EnvFile @Args
}

Write-Host ">>> Building containers" -ForegroundColor Cyan
Invoke-Compose @("build")

Write-Host ">>> Starting MySQL" -ForegroundColor Cyan
Invoke-Compose @("up", "-d", "mysql")

Write-Host ">>> Waiting for MySQL to accept connections..." -ForegroundColor Cyan
Invoke-Compose @("exec", "mysql", "sh", "-c", "until mysqladmin ping -h localhost --silent; do sleep 1; done") | Out-Null

function Invoke-Service {
  param(
    [string]$Service,
    [string]$Command
  )
  Write-Host ">>> Running on $Service: $Command" -ForegroundColor Green
  Invoke-Compose @("run", "--rm", $Service, "sh", "-lc", $Command)
}

Invoke-Service "users-service" "pnpm --filter @epem/users-service prisma:push"
Invoke-Service "patients-service" "pnpm --filter @epem/patients-service prisma:push"
Invoke-Service "catalog-service" "pnpm --filter @epem/catalog-service prisma:push"
Invoke-Service "billing-service" "pnpm --filter @epem/billing-service prisma:push"

Invoke-Service "users-service" "pnpm --filter @epem/users-service seed:admin"
Invoke-Service "patients-service" "pnpm --filter @epem/patients-service seed:patients"
Invoke-Service "catalog-service" "pnpm --filter @epem/catalog-service seed:items"
Invoke-Service "billing-service" "pnpm --filter @epem/billing-service seed:insurers"

Write-Host ">>> Bootstrapping complete. Launch the full stack with:" -ForegroundColor Cyan
Write-Host "    $ComposeBin --env-file $EnvFile up -d" -ForegroundColor Yellow
