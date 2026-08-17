---
name: analyse-performance-result-log
description: Compute ground-truth statistics from a raw performance result log and use them to fact-check narrative claims, proposed thresholds, and suggested optimisations before any of them reach a report. Use when an analysis must be defended against the log it came from — percentiles, error rates, saturation points, and per-label breakdowns recomputed from the samples rather than repeated from a summary table.
---

# Analyse Performance Result Log

Every claim in a performance report is a claim about a file. Recompute before repeating. Do not quote a number that the raw log does not yield, and do not soften a finding because the log is inconvenient.

## Workflow

1. **Recompute first, read prose second.** Run the bundled statistics tool over the raw log and keep its output open while reading any summary, dashboard, or AI-written analysis. The order matters: reading the narrative first anchors you to its numbers.

   ```text
   node <skill-path>/scripts/jtl-stats.js <run.jtl> [--json] [--bucket 1000] [--out stats.json]
   ```

2. **Read per label, not only overall.** An overall p95 is a weighted blend across steps with different costs. A fast, frequent read hides a slow, rare write. The bottleneck lives in the per-label table.

3. **Compute the error rate from the tool's verdict column, not from the HTTP status.** A response that returned 200 and failed an assertion is a failure; a response that returned 401 because the plan's own token expired is a test defect, not a service defect. Classify every non-zero error bucket into one of: service failure, test-data exhaustion, authentication or lockout side effect, or deliberate overload response. An unclassified error rate is not a finding.

4. **Find the saturation point from the time series, not the summary.** Bucketed throughput and latency over the run show where added concurrency stopped buying throughput and started buying latency. The summary row averages across that boundary and hides it. For a stress run this is the whole answer.

5. **Separate latency from response time.** `elapsed` is total sample time; `Latency` is time to first byte. When they diverge, the cost is in transferring the response, not producing it — a different optimisation entirely.

6. **Read a soak as a trend.** Compare the first and last tenth of the run directly for both latency and the service's memory trace. Equal means with a rising tail is a leak, and the mean conceals it. State the memory ceiling and whether it plateaued.

7. **Check every claim explicitly** rather than by eye. Write the claims down as machine-checkable statements and run them:

   ```text
   node <skill-path>/scripts/jtl-stats.js <run.jtl> --check claims.json
   ```

   Each claim names a label, a metric, a comparison, and a value; the tool reports the observed value beside the claimed one. See [references/log-analysis-checklist.md](references/log-analysis-checklist.md) for the claim format and the misreadings this catches.

## Reviewing a generated analysis

Treat an AI-written analysis as a set of assertions to falsify, not a draft to polish. For each statement, record the claim, the value it asserts, the value the raw log gives, and why the difference matters. The recurring misreadings:

- **Average quoted where a percentile decides.** A mean under the threshold with a p95 over it is a failing service described as passing.
- **Peak instantaneous rate presented as sustained capacity.** The maximum one-second bucket is not the rate the service holds without degrading.
- **Error rate computed over the whole run** when the errors are concentrated in one window; the run averaged 2% and was at 40% for ninety seconds.
- **Ramp-up counted as steady state**, deflating percentiles with the low-concurrency start of the run.
- **Throughput credited while assertions were failing.** Requests per second is meaningless if the responses were wrong; check the success column before quoting the rate.
- **A threshold asserted with no baseline.** "Under 500 ms is good" is a preference until it is tied to a measured single-user baseline or a stated requirement.
- **Test-side failures attributed to the service** — exhausted data files, locked accounts, expired tokens.
- **A bottleneck named without evidence.** A claim that the database is the constraint requires the per-label table to show the write path slowing while reads stay flat, or the resource trace to show the saturated resource. Otherwise it is a guess.

## Classifying proposed optimisations

For each suggested optimisation, decide **feasible** or **unfounded**, and give the reason in terms of this system and this log:

- **Feasible** — the log or the source shows the cost it would remove, and the change is possible in the codebase as it exists. Name the evidence and the expected direction of the effect.
- **Unfounded** — the proposal targets a cost this log does not show, assumes a component, index, cache, or configuration option the system does not have, or would be measured away by a bottleneck elsewhere. Name what it assumed and what is actually there.

Verify the system's shape against the source before accepting either verdict. A suggestion to tune a connection pool is unfounded if the service opens one connection; a suggestion to add an index is feasible only if the query it targets is the one the slow label issues.

## Output

Return the recomputed statistics, the claim-check results, the misinterpretation table with the correct value cited from the raw log for each entry, and the optimisation classification with its reasoning. State which conclusions the log supports, which it merely permits, and which would need a further run to settle. Never embed assignment names, student identifiers, credentials, or feature-specific data in this skill.
