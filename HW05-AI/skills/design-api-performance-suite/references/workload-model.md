# Workload model contract

## Scenario shapes

| Scenario | Question it answers | Shape | Stopping condition |
| --- | --- | --- | --- |
| Load | Does it meet its criteria under the anticipated workload? | Flat concurrency, gradual ramp-up, steady state long enough for several full iterations per thread | Fixed duration |
| Stress | Where does it break, and how? | Concurrency raised in steps beyond the anticipated workload | Error rate or latency crosses the degradation threshold, or the planned ceiling is reached |
| Spike | Does it survive a surge and recover? | Steady baseline + a large cohort arriving over seconds + baseline continuing after the cohort leaves | Baseline must continue past the spike long enough to observe recovery |
| Endurance | Does it stay steady over time? | Load-level concurrency held for a long soak | Fixed long duration; watch the trend, not the average |

An endurance soak is the only scenario where the *trend* matters more than the summary. Report the memory ceiling and the maximum stable request rate — the highest rate sustained without the error rate or latency drifting upward — not just the mean.

## Data file columns

Each CSV is read by a data set element with a header row. Keep one concern per file.

```text
users.csv       email,password
products.csv    productId,searchTerm
orders.csv      quantity,shippingAddress,couponCode
```

Settings that decide whether threads collide:

- **Recycle on EOF** — `true` lets a run outlast the file; `false` stops threads when rows run out. Use `false` when each row must be consumed once (one-shot accounts, single-use coupons) and accept that the run ends early if the pool is too small.
- **Stop thread on EOF** — must agree with the recycle setting, or threads silently reuse the final row.
- **Sharing mode** — "all threads" hands each thread the next row; "current thread group" or "current thread" gives each thread its own cursor and therefore repeats rows across threads. Choose deliberately: repeated rows across threads is exactly what causes accidental single-account contention.

Size the pool against concurrency. With recycle off, rows must be at least `threads x iterations`. With recycle on and sharing across all threads, a small pool means many threads act as the same user, which measures per-user locking rather than endpoint capacity.

## Correlation

Every value produced by one step and consumed by a later step must be extracted at run time:

- authentication token from the login response, sent as a header on every authenticated call;
- entity identifier from a list or search response, used by the detail and cart calls;
- order total or cart contents, used by the checkout call.

An extractor with no default value that silently yields an empty string turns the next request into a malformed call that may still return 2xx. Set a recognisable default and assert that the variable does not equal it.

## Naming

Plans and their artefacts share one stem so plan, raw log, and report folder line up:

```text
<owner>_<ScenarioType>_<YYYYMMDD>.jmx
<owner>_<ScenarioType>_<YYYYMMDD>.jtl
<owner>_<ScenarioType>_<YYYYMMDD>/index.html
```

The stem is also the test-plan name inside the file, not only the filename, so a plan opened in a GUI identifies itself.

## Result views

Use a different view per scenario in a family so the family shows more than one way of reading the same data. Typical pairings:

- **Load** — an aggregate/summary view giving percentiles and error rate per label, which is what a pass/fail criterion is stated against.
- **Stress** — a per-sample or over-time view where the moment of degradation is visible, since the answer is *when* it broke, not the average across the whole run.
- **Spike** — a time-series view plotting active threads against latency, so surge and recovery are both readable.

The raw log is written for every scenario regardless of the view. The view is how a human reads the run; the raw log is the evidence, and any number quoted in a report must be reproducible from it.

## Assertion strength

For each sampler, name the change to the service that would make the assertion fail. If no such change exists, the assertion is decorative. Concretely:

- a status assertion alone passes when the service returns 200 with an empty object;
- a token step must assert the token is present and non-empty, not merely that login returned 200;
- a checkout step must assert an order identifier came back, otherwise a silently rejected order counts as a success and inflates the throughput figure.
