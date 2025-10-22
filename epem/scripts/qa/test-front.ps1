param()

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

New-Item -Force -ItemType Directory -Path "$PSScriptRoot/../../docs/qa" | Out-Null
$results | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 "$PSScriptRoot/../../docs/qa/front-results.json"
($results | ForEach-Object { "- [{0}] {1} - expected: {2} actual: {3}" -f (if ($_.pass) { 'PASS' } else { 'FAIL' }), $_.name, $_.expected, $_.actual }) | Out-File -Encoding utf8 "$PSScriptRoot/../../docs/qa/front-report.md"
Write-Host "Front QA terminado. Ver docs/qa/front-report.md" -ForegroundColor Green

