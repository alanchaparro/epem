param()
. "$PSScriptRoot/utils.ps1"

$results = @()

function Check-200($url, $name){
  try {
    $res = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 10
    $results += [pscustomobject]@{ name=$name; expected=200; actual=$res.StatusCode; pass=($res.StatusCode -eq 200) }
  } catch {
    $results += [pscustomobject]@{ name=$name; expected=200; actual=$_.Exception.Message; pass=$false }
  }
}

Check-200 'http://localhost:3000/login' 'Página /login responde 200'
Check-200 'http://localhost:3000/patients' 'Página /patients responde 200 (HTML)'
Check-200 'http://localhost:3000/insurers' 'Página /insurers responde 200 (HTML)'
Check-200 'http://localhost:3000/orders' 'Página /orders responde 200 (HTML)'
Check-200 'http://localhost:3000/authorizations' 'Página /authorizations responde 200 (HTML)'

New-Item -Force -ItemType Directory -Path "$PSScriptRoot/../../docs/qa" | Out-Null
$jsonPath = "$PSScriptRoot/../../docs/qa/front-results.json"
$mdPath = "$PSScriptRoot/../../docs/qa/front-report.md"
$results | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 $jsonPath
Save-Report -Results $results -JsonPath $jsonPath -MarkdownPath $mdPath
Write-Host "Front QA terminado. Ver docs/qa/front-report.md" -ForegroundColor Green
