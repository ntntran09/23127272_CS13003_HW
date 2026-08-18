# Prompt 19

| Field | Value |
| --- | --- |
| Tool | Codex |
| Time | 2026-08-17T19:28:30.868Z |
| Source group | finalization-session |
| Source | ../AI docs/evidence/finalization-session/codex-chat-logs/codex-chat-log.md#interaction-10 |

## Prompt

```text
These are screenshot-evidence tasks, separate from the video.
Tool + Task Manager screenshots
For each Load, Stress, Spike, and preferably Endurance run:
Show JMeter/terminal running the scenario.
Show Task Manager with the EShop node.exe process CPU and memory.
Both must appear in the same screenshot.
Capture near peak load.
Suggested files:
performance/evidence/load-peak.png
performance/evidence/stress-peak.png
performance/evidence/spike-peak.png
performance/evidence/endurance-peak.png

step by step
```

## AI Output

~~~~text
Use the existing runner. It already runs JMeter in recommended non-GUI mode and records JTL, HTML reports, and backend resources.

Important: existing results must be preserved because the runner refuses to overwrite them.

## 1. Prepare the screen

1. Open PowerShell in:

```powershell
cd D:\CODE\23127272_CS13003_HW\HW05-AI
```

2. Open Task Manager.

3. Select **Details**.

4. Right-click a column header → **Select columns** → enable:

   - PID
   - CPU
   - Memory
   - Command line

5. Find `node.exe` whose command line contains `server.js`.

6. Place PowerShell on the left and Task Manager on the right. Both must be visible simultaneously.

## 2. Run Load

Preserve the original result:

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Load_20260817' `
  -NewName '23127272_Load_20260817-original'
```

Start Load:

```powershell
.\performance\tools\run-scenario.ps1 -Scenario Load
```

During the run:

1. Wait until approximately 120–160 seconds.
2. Ensure the terminal shows active JMeter summary output.
3. Ensure Task Manager shows the `node.exe` CPU and memory values.
4. Press `Win + Shift + S`.
5. Capture both windows in one image.
6. Save as:

```text
performance/evidence/load-peak.png
```

After completion, preserve the screenshot rerun and restore the original evidence:

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Load_20260817' `
  -NewName '23127272_Load_20260817-screenshot-rerun'

Rename-Item `
  -LiteralPath '.\performance\results\23127272_Load_20260817-original' `
  -NewName '23127272_Load_20260817'
```

## 3. Run Stress

Use the same procedure with:

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Stress_20260817' `
  -NewName '23127272_Stress_20260817-original'

.\performance\tools\run-scenario.ps1 -Scenario Stress
```

Capture around 210–270 seconds, during the 100-VU stage.

Save as:

```text
performance/evidence/stress-peak.png
```

Then restore:

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Stress_20260817' `
  -NewName '23127272_Stress_20260817-screenshot-rerun'

Rename-Item `
  -LiteralPath '.\performance\results\23127272_Stress_20260817-original' `
  -NewName '23127272_Stress_20260817'
```

## 4. Run Spike

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Spike_20260817' `
  -NewName '23127272_Spike_20260817-original'

.\performance\tools\run-scenario.ps1 -Scenario Spike
```

Capture around 100–140 seconds, while the spike cohort is active.

Save as:

```text
performance/evidence/spike-peak.png
```

Restore:

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Spike_20260817' `
  -NewName '23127272_Spike_20260817-screenshot-rerun'

Rename-Item `
  -LiteralPath '.\performance\results\23127272_Spike_20260817-original' `
  -NewName '23127272_Spike_20260817'
```

## 5. Run Endurance

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Endurance_20260817' `
  -NewName '23127272_Endurance_20260817-original'

.\performance\tools\run-scenario.ps1 -Scenario Endurance
```

Capture around minute 10–14, when load and memory have stabilized.

Save as:

```text
performance/evidence/endurance-peak.png
```

Restore:

```powershell
Rename-Item `
  -LiteralPath '.\performance\results\23127272_Endurance_20260817' `
  -NewName '23127272_Endurance_20260817-screenshot-rerun'

Rename-Item `
  -LiteralPath '.\performance\results\23127272_Endurance_20260817-original' `
  -NewName '23127272_Endurance_20260817'
```

If a run fails, rename its newly created result folder with `-failed`, then restore the `-original` folder. Never delete the original evidence.
~~~~
