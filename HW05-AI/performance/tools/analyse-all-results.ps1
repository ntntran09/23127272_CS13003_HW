$ErrorActionPreference = 'Stop'
$Workspace = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$StatsTool = Join-Path $Workspace 'skills\analyse-performance-result-log\scripts\jtl-stats.js'
$ResultsRoot = Join-Path $Workspace 'performance\results'

if (-not (Test-Path -LiteralPath $ResultsRoot)) { throw 'No performance/results directory exists.' }
$Logs = Get-ChildItem -LiteralPath $ResultsRoot -Recurse -Filter '*.jtl'
if (-not $Logs) { throw 'No JTL logs found. Run the measured scenarios first.' }

foreach ($Log in $Logs) {
    $Out = [System.IO.Path]::ChangeExtension($Log.FullName, '.stats.json')
    node $StatsTool $Log.FullName --json --bucket 1000 --out $Out
    if ($LASTEXITCODE -ne 0) { throw "Analysis failed for $($Log.FullName)" }
    Write-Host "Wrote $Out"
}
