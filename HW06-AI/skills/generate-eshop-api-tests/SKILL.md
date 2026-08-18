---
name: generate-eshop-api-tests
description: Generate, audit, extend, validate, and convert EShop API test catalogs into Postman collections for HW06. Use when Codex receives the EShop requirements/API specification plus student-selected Pool A, B, and C endpoints and must produce at least 35 AI-origin cases and 5 student-origin cases per API covering domains, boundaries, state, SEC-01 through SEC-07, response schemas, Newman execution, and traceable human-review verdicts. Never use this skill to choose the student's three APIs automatically.
---

# Generate EShop API Tests

Produce an auditable API-only suite from endpoints the student has already selected. Keep specification-derived expected behavior separate from observed SUT behavior.

## Preconditions

1. Read the assignment, EShop `README.md`, `api_specification.md`, selected endpoint implementation, database schema, middleware, and seed data.
2. Require one student-selected API or cohesive API operation from each Pool A, B, and C. Do not choose for the student. Stop at this gate if the selection is missing.
3. Record the SUT repository URL, commit SHA, base URL, student ID, selected FRs, selected methods/paths, and applicable SEC requirements.
4. Treat the specification as the expected contract. Treat source and execution as evidence of implementation behavior, not as the oracle.

## Workflow

1. Create `test-cases.json` from [assets/catalog-template.json](assets/catalog-template.json).
2. Follow [references/eshop-api-test-pipeline.md](references/eshop-api-test-pipeline.md) in separate passes: contract/variables, equivalence classes/boundaries, state, security, schema/persistence, minimum representatives, human audit, and student extension.
3. Generate at least 35 cases per selected API with `origin: "AI"`. Do not label these VALID by default. Review each against the specification and source, then set `audit.verdict` to `VALID`, `INVALID`, or `INCOMPLETE`, explain why, and record the correction.
4. Add at least five genuinely new cases per API with `origin: "STUDENT"`. Explain `missed_by_ai` with a concrete cause such as a prompt gap, model limitation, cross-request state, security context, or implementation-specific edge.
5. Keep one invalid partition per negative test where feasible. Use neutral valid values for non-target inputs.
6. Cover every declared equivalence-class ID in at least one case. Cover both sides of every ordered boundary.
7. Cover `domain`, `state`, `security`, and `schema` for every selected API. Cover SEC-01 through SEC-07 across the complete suite, using explicit not-applicable reasoning only where the selected endpoints cannot exercise a requirement.
8. Generate and validate the Postman collection:

```powershell
python <skill-path>/scripts/validate_catalog.py test-cases.json
python <skill-path>/scripts/build_postman_collection.py test-cases.json postman/23127272_HW06.postman_collection.json
python <skill-path>/scripts/build_postman_collection.py test-cases.json postman/23127272_HW06.postman_collection.json --check
```

9. Run Newman with an environment and explicit reporters. Keep the real console/HTML/JSON outputs. Never fabricate evidence or screenshots.
10. Compare expected and actual results. Record genuine specification deviations as bugs; do not call invalid test data or test-script defects SUT bugs.

## Postman Rules

- Add `X-Student-Id` in a collection-level pre-request script using `pm.request.headers.upsert` and log its value for the required console screenshot.
- Keep `base_url`, JWTs, entity IDs, and mutable test data in collection/environment/data variables.
- Assert status, JSON content type, exact stable fields, response schema, and persistence/state effects where applicable.
- Use data files for repeated partitions and boundaries. Keep stateful cases ordered and give every case a deterministic prerequisite/reset note.
- Never commit live credentials or tokens. Seeded demo credentials may be referenced through local environment values.
- Keep a deliberately failing CI sample on a separate branch or opt-in workflow input; do not weaken the normal test oracle.

## Human Review Gates

Pause for the student at these points:

- API selection, because group duplication is prohibited.
- Business/security expected behavior that is not explicit in the requirements.
- Final VALID/INVALID/INCOMPLETE verdicts and student fixes.
- Bug publication, screenshots, GitHub issue creation, CI run links, and the self-drawn generator diagram.

Codex may scaffold placeholders, but must not claim these human-owned evidence items are complete.

## Output

Return the catalog, Postman collection/environment/data files, validator output, Newman commands and genuine reports, Markdown/Excel traceability, audit rows, and unresolved human-review items. State generated, student-added, executed, passed, failed, and bug counts per API.
