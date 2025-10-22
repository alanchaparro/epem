param()

function Wait-HttpOk {
  param([string]$Url, [int]$TimeoutSec = 20)
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  do {
    try {
      $res = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3
      if ($res.StatusCode -ge 200 -and $res.StatusCode -lt 300) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $deadline)
  return $false
}

function Assert-Equal {
  param($Expected, $Actual, [string]$Name)
  return [pscustomobject]@{
    name = $Name
    expected = $Expected
    actual = $Actual
    pass = ($Expected -eq $Actual)
  }
}

function Assert-True {
  param([bool]$Condition, [string]$Name, $Actual = $null)
  return [pscustomobject]@{
    name = $Name
    expected = $true
    actual = $Actual
    pass = [bool]$Condition
  }
}

function Save-Report {
  param($Results, [string]$JsonPath, [string]$MarkdownPath)
  $Results | ConvertTo-Json -Depth 6 | Out-File -Encoding utf8 $JsonPath
  $ok = ($Results | Where-Object { -not $_.pass }).Count -eq 0
  $md = @()
  $md += "# QA Report"
  $statusAll = if ($ok) { 'PASS' } else { 'FAIL' }
  $md += "Resultado: `"$statusAll`""
  $md += ""
  foreach ($r in $Results) {
    $status = if ($r.pass) { 'PASS' } else { 'FAIL' }
    $md += "- [$status] $($r.name) - expected: $($r.expected) actual: $($r.actual)"
  }
  ($md -join "`n") | Out-File -Encoding utf8 $MarkdownPath
}
