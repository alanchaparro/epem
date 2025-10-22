param(
  [switch]$SkipFront
)

function Get-Result {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $null }
  $content = Get-Content -Raw -Encoding UTF8 $Path
  if ($content -match 'Resultado:\s*"(PASS|FAIL)"') {
    return ($matches[1] -eq 'PASS')
  }
  return $null
}

$root = Resolve-Path "$PSScriptRoot/../.." | ForEach-Object { $_.Path }
$back = Get-Result -Path (Join-Path $root 'docs/qa/back-report.md')
$front = Get-Result -Path (Join-Path $root 'docs/qa/front-report.md')
$db = Get-Result -Path (Join-Path $root 'docs/qa/db-report.md')

$ok = $true
if ($back -ne $true) { Write-Host 'BACKEND QA: FAIL o sin reporte' -ForegroundColor Red; $ok = $false }
if (-not $SkipFront -and $front -ne $true) { Write-Host 'FRONTEND QA: FAIL o sin reporte' -ForegroundColor Red; $ok = $false }
if ($db -ne $true) { Write-Host 'DB QA: FAIL o sin reporte' -ForegroundColor Red; $ok = $false }

if ($ok) { Write-Host 'QA Gate: PASS' -ForegroundColor Green; exit 0 }
else { Write-Host 'QA Gate: FAIL' -ForegroundColor Red; exit 1 }

