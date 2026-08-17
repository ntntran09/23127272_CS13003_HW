# Initial AI Performance Analysis - Deliberately Pending Human Review

Tool: Codex

Date: 2026-08-17

Input evidence: Load, Stress, and Spike JMeter summaries available at the time of drafting.

## Preliminary claims

1. The Stress test shows a capacity of **175 requests/second**, because that is the maximum one-second throughput bucket.
2. The Spike test did not recover, because its overall p95 is **1,915 ms**, much higher than Load p95.
3. The Load run proves a memory leak because backend memory rose from **66.4 MiB** in the first tenth to **151.1 MiB** in the final tenth.
4. Stress p95 is **622 ms for every endpoint**, so no per-endpoint analysis is needed.
5. CPU is the main bottleneck during Stress because performance degraded at higher concurrency.

## Suggested optimizations

- Paginate `GET /api/admin/orders` and return only the fields required by the admin table.
- Add an index on `orders.status`.
- Increase the database connection-pool size.
- Enable SQLite WAL mode and measure again.
- Add role-based authorization middleware to every `/api/admin/*` route.

This file intentionally preserves the first-pass AI reading. It is not the final conclusion. The human-review table in `main-report.md` checks every claim against the raw JTL, resource trace, and backend source.
