---
name: convert-domain-cases-to-playwright
description: Convert requirement-based manual, domain, equivalence-partition, or boundary-value test cases into maintainable data-driven Playwright UI tests. Use when test cases already exist and Codex needs to map them to external JSON data, browser setup, fixtures, stable locators, assertion patterns, and reviewed Playwright specs without changing the system under test.
---

# Convert Domain Cases to Playwright

Create automation that preserves the test oracle from the requirements. Do not change expected results to match current product defects.

## Workflow

1. Read the requirements, manual test-case source, relevant UI code, and API contract.
2. Build a traceability list containing requirement ID, original case ID, precondition, action, expected result, automation strategy, and limitation.
3. Classify each case as:
   - live end-to-end;
   - UI with API setup;
   - UI with deterministic network fixture;
   - not automatable, with a concrete reason.
4. Select the minimum representative set requested by the user. Preserve positive, negative, edge, authorization, and state-transition coverage.
5. Store variable test inputs in external JSON or CSV. For JSON, follow [references/case-data-schema.md](references/case-data-schema.md).
6. Create shared helpers or Page Objects for repeated navigation, authentication, and setup. Keep business expected values in the data file.
7. Generate one named Playwright test per data row. Put the original case or requirement IDs in test annotations.
8. Use resilient locators in this order: role/name, label, placeholder, test ID, then narrowly scoped CSS. Avoid layout-dependent selectors.
9. Use at least three assertion patterns across the feature, including a business-result assertion. Prefer web-first assertions.
10. Isolate state. Use unique disposable records and cleanup, or deterministic network fixtures for states unavailable through public setup APIs.
11. Run the bundled validator, list the tests, and execute a single-browser smoke run.
12. Review failures before classifying them. Distinguish test-code errors, flaky synchronization, environment problems, requirement gaps, and product defects.

## Validation

Run:

```text
node scripts/validate-case-data.js <data-file.json> [more-data-files.json]
npx playwright test --list
```

## Human-review gates

- Reject inline arrays/objects used as variable test data.
- Replace fixed sleeps with waits for observable state.
- Confirm each negative case proves that the forbidden outcome did not occur.
- Confirm mocks do not replace the behavior being evaluated.
- Reproduce a failing requirement assertion before writing a bug report.
- Record every substantive correction from the first generated script to the final script.

## Output

Return the external data files, specs, helpers/fixtures, traceability notes, validation output, and a concise AI-versus-human review log. Never embed assignment names, student identifiers, credentials, or feature-specific data in this skill.
