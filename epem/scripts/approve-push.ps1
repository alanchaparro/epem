param()
# Crea un token de aprobación de un solo uso para permitir el próximo git push.
$path = Join-Path (git rev-parse --show-toplevel) '.allow-push'
Set-Content -Path $path -Value (Get-Date).ToString('s') -Encoding UTF8
Write-Host "Aprobación creada en $path. El próximo 'git push' será permitido y consumirá este permiso." -ForegroundColor Green

