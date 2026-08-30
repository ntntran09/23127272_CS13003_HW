# Prompt 01 — Scaffold the reusable generator skill

| Field | Value |
| --- | --- |
| Tool | Codex |
| Date | 2026-08-18 |
| Stage | Scaffold / reusable skill |
| Source | ../AI docs/evidence/current-selection-session/codex-interaction-log.md#interaction-1 |

## Prompt

```text
Read the HW06 assignment specification (2026.HW06.API Testing_En.md) and build a
reusable Agent Skill that drives the API-testing pipeline step by step. Set up the
supporting scaffolding, then begin the work — but pause for my API selection
rather than choosing the three APIs yourself.
```

## AI output (summary)

Created the reusable `generate-eshop-api-tests` skill (skill instructions, catalog
validator, Postman builder, unit tests, catalog template) together with the
report, catalog, and Postman-environment scaffolds and the CI workflow stub. The
run stopped at the API-selection gate and requested the three Pool A/B/C choices
instead of inventing them, preserving the student's responsibility for group
uniqueness.

Evidence: `skills/generate-eshop-api-tests/`, `api-selection.md`, commit `c860a0e`.
