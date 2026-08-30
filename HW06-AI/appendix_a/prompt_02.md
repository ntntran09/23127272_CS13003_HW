# Prompt 02 — Select member 1's APIs and regenerate the catalog

| Field | Value |
| --- | --- |
| Tool | Codex |
| Date | 2026-08-18 |
| Stage | Selection + generate / audit / extend |
| Source | ../AI docs/evidence/current-selection-session/codex-interaction-log.md#interaction-2 |

## Prompt

```text
New task split: I am taking member 1's API allocation. Switch the whole HW06 set
to those three APIs and regenerate the catalog, Postman collection, reports, and
bug drafts accordingly. Keep the oracle aligned to the README/specification — do
not weaken expected results to match buggy behaviour in the code.
```

## AI output (summary)

Switched the selection to member 1's row and regenerated every dependent artifact:

- Pool A: FR-02 — `POST /api/login`
- Pool B: FR-07 — `POST /api/cart`
- Pool C: FR-15 — `POST /api/products`

Produced 120 designed cases (40 per API): 105 AI-generated cases plus 15
student-origin extensions, with 119 automated and 1 manual 30-second
lockout-expiry case. The generator validator passed and unit tests were 3/3. AI
verdicts were marked as preliminary, pending student confirmation, and the 15
extension candidates were flagged for the student to adopt or edit.

Evidence: `test-design/test-cases.json`, `test-design/test-cases.md`,
`postman/23127272_HW06.postman_collection.json`, `main-report.md`,
`bug-reports.md`, `README.md`.
