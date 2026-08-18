# Prompt 17

| Field | Value |
| --- | --- |
| Tool | Codex |
| Time | 2026-08-17T19:24:46.489Z |
| Source group | finalization-session |
| Source | ../AI docs/evidence/finalization-session/codex-chat-logs/codex-chat-log.md#interaction-8 |

## Prompt

```text
- [ ] Capture tool + Task Manager in the same frame at peak for every required run.
- [ ] Capture `dxdiag`/hardware screen showing hostname `TRAN`.
whats this now
```

## AI Output

~~~~text
These are screenshot-evidence tasks, separate from the video.

1. Tool + Task Manager screenshots

For each Load, Stress, Spike, and preferably Endurance run:

- Show JMeter/terminal running the scenario.
- Show Task Manager with the EShop `node.exe` process CPU and memory.
- Both must appear in the same screenshot.
- Capture near peak load.

Suggested files:

```text
performance/evidence/load-peak.png
performance/evidence/stress-peak.png
performance/evidence/spike-peak.png
performance/evidence/endurance-peak.png
```

2. Hardware screenshot

- Run `dxdiag`.
- Open the System tab.
- Capture a screenshot showing computer name `TRAN`, CPU, RAM, and Windows version.
- Save as `performance/evidence/hardware-dxdiag.png`.

The existing `dxdiag.txt` is insufficient—the assignment explicitly requires visible screenshot evidence.
~~~~
