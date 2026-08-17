param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Load', 'Stress', 'Spike', 'Endurance')]
    [string]$Scenario
)

$ErrorActionPreference = 'Stop'

# Prevent only this runner process from allowing system sleep. The flag ends
# with the PowerShell process and does not alter the user's persistent power plan.
Add-Type -TypeDefinition @'
using System.Runtime.InteropServices;
public static class PerformanceRunPowerState {
    [DllImport("kernel32.dll")]
    public static extern uint SetThreadExecutionState(uint flags);
}
'@
[void][PerformanceRunPowerState]::SetThreadExecutionState([uint32]2147483649)
$StudentId = '23127272'
$RunDate = '20260817'
$Workspace = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Stem = "${StudentId}_${Scenario}_${RunDate}"
$Plan = Join-Path $Workspace "performance\plans\$Stem.jmx"
$Results = Join-Path $Workspace "performance\results\$Stem"
$Backend = 'D:\CODE\eshop-sut\backend'
$JMeter = 'D:\CODE\tools\apache-jmeter-5.6.3\bin\jmeter.bat'
$Wrapper = Join-Path $Workspace 'skills\run-performance-scenario-with-evidence\scripts\run-with-resource-trace.js'
$Seed = Join-Path $Workspace 'performance\tools\seed-admin-orders.js'
$Preflight = Join-Path $Workspace 'performance\tools\preflight-admin-orders.js'

foreach ($Required in @($Plan, $Backend, $JMeter, $Wrapper, $Seed, $Preflight)) {
    if (-not (Test-Path -LiteralPath $Required)) { throw "Missing required path: $Required" }
}
if (Test-Path -LiteralPath $Results) {
    throw "Refusing to overwrite evidence directory: $Results. Rename it if the run was discarded."
}
New-Item -ItemType Directory -Path $Results | Out-Null

# A restart is the documented reset: database.js recreates the SQLite schema and
# clears lockout/order/in-memory state every time server.js starts.
$Connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$OwningPids = @($Connections | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($OwningPid in $OwningPids) {
    $Process = Get-CimInstance Win32_Process -Filter "ProcessId=$OwningPid"
    if (-not $Process -or $Process.Name -ne 'node.exe' -or $Process.CommandLine -notmatch 'server\.js') {
        throw "Port 3000 is owned by an unverified process. Refusing to stop PID $OwningPid."
    }
    Stop-Process -Id $OwningPid
    Wait-Process -Id $OwningPid -ErrorAction SilentlyContinue
}

$ServerOut = Join-Path $Results "$Stem.server.stdout.log"
$ServerErr = Join-Path $Results "$Stem.server.stderr.log"
$Server = Start-Process -FilePath 'node.exe' -ArgumentList 'server.js' -WorkingDirectory $Backend -RedirectStandardOutput $ServerOut -RedirectStandardError $ServerErr -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2
if ($Server.HasExited) { throw "EShop backend exited during startup. Read $ServerErr" }

$SeedCount = if ($Scenario -eq 'Endurance') { 7500 } else { 6000 }
node $Seed --count $SeedCount --concurrency 24
if ($LASTEXITCODE -ne 0) { throw 'Seed failed.' }
node $Preflight
if ($LASTEXITCODE -ne 0) { throw 'Preflight failed.' }

$Jtl = Join-Path $Results "$Stem.jtl"
$Report = Join-Path $Results "$Stem-report"
$JMeterLog = Join-Path $Results "$Stem.jmeter.log"

Write-Host "Starting $Scenario. Keep Task Manager and this terminal in the same frame; capture peak load."
node $Wrapper --label $Stem --out $Results --port 3000 --interval 1000 `
    --note "Backend restarted and seeded with $SeedCount unique pending orders immediately before this run." `
    --note 'JMeter and SUT ran on the same Windows host.' `
    -- $JMeter -n -t $Plan -l $Jtl -e -o $Report -j $JMeterLog `
    '-Jjmeter.save.saveservice.output_format=csv' `
    '-Jjmeter.save.saveservice.print_field_names=true' `
    '-Jjmeter.save.saveservice.assertion_results_failure_message=true' `
    '-Jjmeter.save.saveservice.thread_counts=true' `
    '-Jjmeter.save.saveservice.url=true' `
    '-Jjmeter.save.saveservice.connect_time=true'
if ($LASTEXITCODE -ne 0) { throw "$Scenario run failed with exit code $LASTEXITCODE. Preserve the directory as discarded evidence." }

$Index = Join-Path $Report 'index.html'
if (-not (Test-Path -LiteralPath $Jtl) -or (Get-Item $Jtl).Length -eq 0 -or -not (Test-Path -LiteralPath $Index)) {
    throw 'Run ended but required JTL/HTML evidence is incomplete.'
}
Write-Host "PASS: evidence written to $Results"
