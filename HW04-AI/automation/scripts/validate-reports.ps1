$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression

$root = Split-Path -Parent $PSScriptRoot
$studentId = if ($env:STUDENT_ID) { $env:STUDENT_ID } else { '23127272' }
$features = @('fr03', 'fr11', 'fr14')
$browsers = @('chromium', 'chrome', 'edge')
$summary = @()

foreach ($feature in $features) {
    foreach ($browser in $browsers) {
        $reportPath = Join-Path $root "reports\$feature\$browser\index.html"
        if (-not (Test-Path -LiteralPath $reportPath)) {
            throw "Missing report: $reportPath"
        }

        $html = [IO.File]::ReadAllText($reportPath)
        $match = [regex]::Match(
            $html,
            '<template id="playwrightReportBase64">data:application/zip;base64,(.*?)</template>'
        )
        if (-not $match.Success) {
            throw "Missing embedded Playwright report in $reportPath"
        }

        $bytes = [Convert]::FromBase64String($match.Groups[1].Value)
        $memory = [IO.MemoryStream]::new($bytes)
        $archive = [IO.Compression.ZipArchive]::new(
            $memory,
            [IO.Compression.ZipArchiveMode]::Read
        )
        try {
            $entry = $archive.GetEntry('report.json')
            if (-not $entry) { throw "Missing report.json in $reportPath" }
            $reader = [IO.StreamReader]::new($entry.Open())
            try {
                $report = $reader.ReadToEnd() | ConvertFrom-Json
            } finally {
                $reader.Dispose()
            }
        } finally {
            $archive.Dispose()
            $memory.Dispose()
        }

        $timestamp = [DateTimeOffset]::MinValue
        $validTimestamp = [DateTimeOffset]::TryParse(
            $report.metadata.'Run timestamp',
            [ref]$timestamp
        )
        $titlePrefix = "Run by: $studentId |"

        if ($report.metadata.'Run by' -ne $studentId) {
            throw "Invalid student id in $reportPath"
        }
        if (-not $validTimestamp) {
            throw "Invalid ISO timestamp in $reportPath"
        }
        if ($report.metadata.Feature -ne $feature -or $report.metadata.Browser -ne $browser) {
            throw "Feature/browser metadata mismatch in $reportPath"
        }
        if (-not $report.options.title.StartsWith($titlePrefix)) {
            throw "Visible report title does not identify the runner in $reportPath"
        }

        $summary += [PSCustomObject]@{
            feature = $feature
            browser = $browser
            timestamp = $report.metadata.'Run timestamp'
            total = [int]$report.stats.total
            passed = [int]$report.stats.expected
            failed = [int]$report.stats.unexpected
            flaky = [int]$report.stats.flaky
            skipped = [int]$report.stats.skipped
            title = $report.options.title
        }
    }
}

$summaryPath = Join-Path $root 'reports\run-summary.json'
$summary | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $summaryPath -Encoding utf8
$totals = $summary | Measure-Object -Property total,passed,failed,flaky,skipped -Sum

Write-Output "Validated $($summary.Count) reports for Run by: $studentId"
Write-Output "Executed: $($totals[0].Sum); Passed: $($totals[1].Sum); Failed: $($totals[2].Sum); Flaky: $($totals[3].Sum); Skipped: $($totals[4].Sum)"
Write-Output "Summary: $summaryPath"
