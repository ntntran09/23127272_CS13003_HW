# Log analysis checklist

## Claim format

A claim file is a JSON array. Each entry turns one sentence of prose into something the log can contradict.

```json
[
  {
    "id": "C1",
    "source": "AI analysis, paragraph 2",
    "claim": "Checkout stayed under 800 ms at the ninety-fifth percentile.",
    "label": "POST /api/checkout",
    "metric": "p95",
    "op": "<=",
    "value": 800
  },
  {
    "id": "C2",
    "source": "AI analysis, conclusion",
    "claim": "The service sustained 120 requests per second.",
    "label": "ALL",
    "metric": "maxStableRps",
    "op": ">=",
    "value": 120
  }
]
```

- `label` — a sampler label exactly as it appears in the log, or `ALL` for the whole run. A label that is not present is reported as `UNCHECKABLE` with the available labels listed, which is itself a finding: the analysis described a step the run did not contain.
- `metric` — one of `count`, `errors`, `errorRatePct`, `min`, `max`, `mean`, `stddev`, `p50`, `p90`, `p95`, `p99`, `latencyMean`, `latencyP95`, `throughputPerSecond`, `spanSeconds`, plus the run-level `maxStableRps` and `peakRps`. Aliases `median`, `avg`, `average`, `rps`, `throughput`, and `errorRate` are accepted.
- `op` — `<`, `<=`, `>`, `>=`, `==`, `!=`.
- `value` — the number the prose asserts.
- `claim` and `source` are carried through to the output so the finding can be quoted back at the sentence it came from.

The verdicts are `SUPPORTED`, `CONTRADICTED`, and `UNCHECKABLE`. Each carries the observed value and a citation naming the file, the label, and the metric, which is the form a misinterpretation table needs.

Write the claims **before** running the check, straight from the prose. Writing them afterwards, from the numbers, only confirms what you already computed.

## What the checker catches

**Wrong statistic.** A claim written as `mean <= 500` passes while `p95 <= 500` fails on the same log. If the prose says "response times were under half a second" and only the mean supports it, the prose is describing a service that fails one request in twenty at more than twice the quoted figure.

**Peak sold as capacity.** `peakRps` is the busiest single bucket. `maxStableRps` is the highest mean rate held across `--stable-window` consecutive buckets without the error rate exceeding `--stable-error`. They can differ by a factor of two on a run that collapsed. A capacity claim checked against `peakRps` will pass and still be wrong; check it against `maxStableRps`.

**Whole-run averaging over a concentrated failure.** An overall `errorRatePct` of 2 can be a run that was clean for eight minutes and at 40% for ninety seconds. Claims about error rate should be checked per label, and the bucketed time series read for where the errors sat. The failure histograms group errors by label, code, and message so a single window with one cause is visible.

**Ramp-up counted as steady state.** Re-run with `--warmup <seconds>` covering the ramp and compare. The tool notes when the steady-state p95 differs from the whole-run p95 by more than 10%, which means the ramp is doing the flattering.

**A step the run never executed.** An `UNCHECKABLE` verdict on a label means the analysis invented, renamed, or misattributed a step.

**Success confused with status.** The error rate comes from the `success` column, so a 200 that failed an assertion counts as a failure and a claim of "no errors" fails against a log full of wrong responses. The response-code histogram is printed separately; when the code histogram is all 200 and the error rate is non-zero, the difference is entirely assertion failures.

## Reading the derived sections

**Saturation.** The tool locates the bucket with the highest rate and asks whether later buckets applied more threads without gaining throughput. When they did, that offset is the saturation point and the note says so. When they did not, the run never reached the ceiling — and then the peak rate is a floor on capacity, not a measurement of it. Reporting an unreached ceiling as a limit is the most common overreach in a stress writeup.

**Drift.** First tenth versus last tenth for latency, rate, and error rate. This is how a soak is read. A rising p95 with a flat rate is degradation under constant load; pair it with the resource trace's memory ceiling before naming a cause. A leak and a cache warming up both raise memory — only one of them keeps rising.

**Latency versus elapsed.** When p95 elapsed substantially exceeds p95 latency, the cost is in transferring the response rather than producing it. Optimising the query is then aimed at the wrong half of the number.

**Malformed lines.** A response body containing a newline splits a sample across lines in a CSV log. The tool counts and skips them. More than a handful means the counts are understated and the plan should stop saving response data.

## Before writing the analysis up

- Every quoted figure traced to a metric the tool printed, not to a dashboard panel.
- Every non-zero error bucket classified: service failure, exhausted test data, authentication or lockout side effect, or deliberate overload response.
- Thresholds tied to a measured single-user baseline or a stated requirement, never to a round number that sounds reasonable.
- Bottleneck claims supported by either the per-label table or the resource trace, and stated as the specific resource that saturated.
- Conclusions separated into what the log shows, what it permits, and what needs another run.
