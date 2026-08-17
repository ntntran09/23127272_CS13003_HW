# Evidence contract

Each scenario run produces a fixed set of artefacts sharing one naming stem, so plan, log, report, and resource trace can be matched without opening them.

```text
<stem>.jmx                 the plan that was executed
<stem>.jtl                 raw per-sample log, unmodified
<stem>-report/index.html   generated report
<stem>.resources.csv       CPU and memory of the service process over the run
<stem>.run.json            command, exit code, wall-clock window, host, trace summary
<stem>.jmeter.log          tool log — where startup and data-file errors surface
```

## The raw log is the record

The report is a rendering. The raw log is the evidence, and every number quoted anywhere must be re-derivable from it. Never hand-edit a log, never delete rows, and never present a regenerated report as if it came from a different run than its log.

If a run must be repeated, keep both logs and say which one the report describes.

## Raw log format

The dashboard generator consumes CSV-format output. A plan configured to save XML produces a raw log the generator cannot read, and the failure appears only in the tool log. The default CSV column set is:

```text
timeStamp,elapsed,label,responseCode,responseMessage,threadName,dataType,
success,failureMessage,bytes,sentBytes,grpThreads,allThreads,URL,Latency,IdleTime,Connect
```

- `timeStamp` — epoch milliseconds at the **start** of the sample.
- `elapsed` — total time for the sample in milliseconds; this is the response time.
- `Latency` — time to the first byte of the response. `elapsed - Latency` is download time.
- `Connect` — connection establishment time, included in `Latency`.
- `success` — the tool's verdict after assertions, not the HTTP status. A 200 that failed an assertion is `false`; this is the column an error rate must be computed from.
- `allThreads` — active threads at that moment across the plan; this is how a spike shows up in the log itself.

## Resource trace format

```text
iso,epochMs,cpuSeconds,cpuPercent,workingSetBytes,privateBytes
```

`cpuSeconds` is cumulative processor time for the process; `cpuPercent` is derived from its delta divided by the sampling interval and the core count, so the first row has no percentage. Memory is the process working set, which is what a task manager displays.

Align the trace to the log by `epochMs` against `timeStamp`. A peak in one that has no counterpart in the other means the wrong process was watched, or the sampler and the load did not overlap.

## Screenshots

Screenshots corroborate the files; they do not replace them.

- The load tool and the resource monitor must be **in the same frame**. Two separate screenshots prove nothing about simultaneity.
- Capture at peak, not after the run drains. A memory reading taken once the load has stopped understates the ceiling.
- The resource monitor must show the **service** process, identified by pid, with the pid readable in the image.
- Capture the hardware report once, and check its hostname equals `environment.hostname` in the run metadata. A report from a different machine invalidates the comparison across runs.

## Between-run reset

Record the reset procedure once and follow it identically before every run. At minimum, decide and document:

- whether the datastore is re-created on service start, and therefore whether restarting between runs discards accumulated data;
- whether in-memory state accumulated by the previous run persists into this one;
- how authentication lockout counters are cleared, and what the lockout threshold and duration actually are in the implementation — not what the specification claims. A counter that increments by more than one per failure, or a lock longer than documented, will change how many virtual users survive the run.

A run whose reset differed from the others is not comparable with them. Say so rather than quietly including it.
