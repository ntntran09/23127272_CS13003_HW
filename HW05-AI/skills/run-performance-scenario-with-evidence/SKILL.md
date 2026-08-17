---
name: run-performance-scenario-with-evidence
description: Execute a performance test plan headlessly while sampling the system-under-test process for CPU and memory, producing a raw result log, an HTML report, and a machine-readable resource trace that can be cross-checked against screenshots. Use when a run must be reproducible and defensible — the load tool and the resource monitor must agree, and every reported number must be traceable to a file on disk.
---

# Run Performance Scenario With Evidence

A performance run is only evidence if someone else can re-derive its numbers. Do not edit result logs, do not re-run a scenario and describe it as the same run, and do not report a figure the raw log does not contain.

## Preconditions

1. **Fix the environment before the first run and do not change it between runs in a family.** Record the machine's CPU, RAM, and OS, the runtime version of the service, and whether the load generator and the service share a host. When they share a host, say so: the generator competes with the service for CPU, and the measured ceiling is the pair's ceiling, not the service's.
2. **Establish the baseline.** One user, one iteration, no concurrency. Every later claim of degradation is relative to this.
3. **Know what resets between runs.** Databases that are re-seeded on start, caches that warm, accumulated in-memory state, and authentication lockout counters all mean run 2 does not start where run 1 started. Write down the reset procedure and follow it identically every time.
4. **Silence the noise you can control.** Close other load, note anything you could not close. An unexplained latency spike that turns out to be a background updater discredits the whole run.

## Execute

Run the load tool headlessly — a GUI run distorts the measurement because rendering the live view costs the same machine the CPU the service needs.

```text
node <skill-path>/scripts/run-with-resource-trace.js \
  --label   <owner>_<ScenarioType>_<YYYYMMDD> \
  --out     <results-dir> \
  --watch   <process-name-or-pid> \
  --interval 1000 \
  -- <load-tool-command and its arguments>
```

The wrapper starts the resource sampler, runs the load tool to completion, stops the sampler, and writes:

```text
<results-dir>/<label>.resources.csv   timestamped CPU% and memory per sample
<results-dir>/<label>.run.json        command, exit code, wall-clock window, environment
```

The load tool writes its own artefacts. For JMeter the conventional invocation inside the wrapper is:

```text
jmeter -n -t <label>.jmx -l <label>.jtl -e -o <label>-report -j <label>.jmeter.log
```

`-n` is non-GUI, `-l` writes the raw log, and `-e -o` generates the HTML dashboard from that log into a directory that must not already exist. The dashboard is generated from CSV-format raw output; if the plan is configured to save XML, the dashboard generation fails and only the raw log survives.

See [references/evidence-contract.md](references/evidence-contract.md) for what each artefact must contain and how the screenshots relate to it.

## Verify

Do not accept a run until all of these hold. Each is a reason to discard the run and repeat it, not a caveat to mention later:

1. The load tool exited zero **and** the raw log contains more than a header line.
2. The number of samples in the raw log is consistent with the plan's threads, duration, and think time. An order-of-magnitude shortfall means threads died early — commonly an exhausted data file with recycling disabled, or an account lockout.
3. The raw log's first and last timestamps span the intended duration. A run that stopped at 40% of its scheduled window did not execute the scenario.
4. The resource trace covers the same wall-clock window as the raw log. A trace that starts after the load or ends before it proves nothing about the peak.
5. The watched process is the service, not the load tool and not a wrapper shell. Verify by PID, not by name — a runtime that spawns children will show several processes with the same name and the one holding the port is the one that matters.
6. The HTML report directory exists and contains an index page. If dashboard generation failed, the run still has its raw log; regenerate the report from the log rather than re-running the scenario.
7. Errors present in the raw log are explained. A 4xx storm halfway through a run is usually the test's own fault — expired token, locked account, exhausted data — and reporting it as a service failure is a misread.

## Evidence capture

Screenshots are required alongside the machine-readable files, and they must be capturable as one image:

- The load tool's live progress or completion output **and** the resource monitor showing the service process must appear **in the same frame**, so the resource figures cannot have come from a different moment.
- Capture at the point of peak load, not after the run has drained.
- Capture the machine's hardware report once per submission and confirm its hostname matches the host named in the run metadata. A hardware report from a different machine than the one that ran the test invalidates the comparison.
- Keep the resource trace CSV as the primary record and the screenshot as corroboration. The screenshot shows one instant; the CSV shows the curve, including the ceiling.

## Endurance runs

A soak is not a long load run with the same reporting. Report the **trend**, not the mean:

- plot memory across the whole soak and state the ceiling reached, whether it plateaued, and when;
- state the maximum stable request rate — the highest rate sustained while neither error rate nor latency drifted upward — rather than the peak instantaneous rate;
- compare the first and last tenth of the run directly. Equal averages with a rising tail is a leak that a summary row hides.

## Output

Return the raw log, the report directory, the resource trace, the run metadata, the screenshots, and a short statement for each run of what the environment was, what was reset beforehand, and any anomaly seen during execution. State explicitly if any run was discarded and why. Never embed assignment names, student identifiers, credentials, or feature-specific data in this skill.
