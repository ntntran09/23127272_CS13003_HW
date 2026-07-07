# Domain Testing Pipeline for One Function

Use this reference after identifying the target function, feature, UI flow, or API endpoint. The goal is to generate test cases using domain testing and boundary value analysis, then optionally encode them in the project's test framework for the requested testing surface.

## 1. Context Discovery

Read enough project context to understand the function's real contract:

- function implementation;
- type/interface definitions;
- constants, validation helpers, regexes, schemas, and enum declarations;
- API routes/controllers, request schemas, middleware, auth guards, and serializers when testing APIs;
- UI pages/components, form controls, routing, client validators, state stores, and existing UI tests when testing UI;
- direct callers and existing tests;
- README/API docs/comments when present.

Record assumptions when the intended behavior is not explicit. Prefer the specification over implementation when they conflict; flag the conflict as a potential bug or open question.

## 1.1 Testing Surface Selection

First determine what surface the user wants. Respect explicit wording such as "UI only", "API only", "UI and API", "unit tests only", "manual test cases", or "executable tests".

| Surface | Read | Inputs | Outputs | Deliverables |
| --- | --- | --- | --- | --- |
| Unit/function | implementation, types, helpers, nearby unit tests | function args, config, injected dependencies | return values, thrown errors, mutations, side effects | unit test cases and/or unit test file |
| API only | routes, controllers, schemas, middleware, serializers, API tests | method, path params, query, body, headers, auth/session/role | status, response body, headers, database/state changes | API test cases and/or request-level tests |
| UI only | pages, components, forms, routing, state, UI tests | user role, page state, controls, form fields, browser/session state | visible text, validation messages, navigation, enabled/disabled state, persisted UI outcome | UI test cases and/or browser tests |
| UI and API | both UI and API layers plus shared validation/business logic | shared data domains plus surface-specific controls/requests | API contract outcomes and user-visible outcomes | shared EC table plus separate UI/API case tables |
| Manual/report only | docs and implementation needed to infer behavior | same as requested surface | expected observable results | Markdown tables, no code unless requested |

If no surface is specified:

- infer from the target artifact when obvious, such as an API route implying API tests or a component implying UI tests;
- ask for confirmation when both UI and API are plausible and the choice changes the test design;
- if autonomous progress is requested, choose the smallest relevant surface and label it as an assumption.

When a user role or account state is part of the request, model it as an input variable. Examples: guest, authenticated user, admin, locked user, verified user, cart owner, non-owner, expired session, missing token, malformed token.

For combined UI and API testing:

- build one shared equivalence-class table for business/data rules;
- add surface-specific ECs for UI controls, browser state, API headers, status codes, and serialization;
- use API tests for broad partition coverage;
- use UI tests for representative journeys, client-side validation, rendering, navigation, and integration checks;
- avoid duplicating every API partition through the UI unless the UI itself can handle those values differently.

## 1.2 Human Review Gates

Keep a human reviewer in the process. Domain testing depends on the intended contract, and code alone may only show the current implementation.

Ask for confirmation or create an explicit review checkpoint when:

- the testing surface is ambiguous or the user mentions multiple possible surfaces;
- the function contract is inferred from implementation rather than stated in docs or tests;
- a rule affects money, authentication, authorization, privacy, inventory, irreversible state changes, or legal/compliance behavior;
- a boundary is ambiguous, such as inclusive vs exclusive limits, precision, rounding, timezone, or maximum accepted length;
- expected output is not explicit and different reasonable behaviors are possible;
- generated executable tests would freeze a behavior that might actually be a bug.

If the user wants autonomous progress, continue with labeled assumptions and keep uncertain cases in a "Needs human review" section instead of silently deciding them.

## 2. Identify Variables

Create a table:

| ID | Variable | Direction | Type/Shape | Constraints | Source |
| --- | --- | --- | --- | --- | --- |
| IN1 |  | Input |  |  | code/spec |
| OUT1 |  | Output |  |  | code/spec |

Include non-obvious outputs: thrown exceptions, error messages, mutation, database writes, emitted events, HTTP status codes, logs only if they are contractual, and async rejection behavior.

For API testing, include method, URL/path params, query params, body fields, headers, cookies/session, auth state, user role, database preconditions, status code, response body, response headers, and persistence effects.

For UI testing, include page/route, user role/session, visible controls, form fields, user actions, viewport/device only if relevant, browser storage/cookies, loading/error states, displayed messages, navigation, disabled/enabled controls, and persisted user-visible outcomes.

## 3. Derive Equivalence Classes

Create IDs like `EC-IN1-VALID-RANGE`, `EC-IN1-LOW`, or `EC-OUT1-ERROR`. Use stable IDs that can be referenced in tests.

| EC ID | Variable | Class | Validity | Rationale |
| --- | --- | --- | --- | --- |
| EC-IN1-VALID | count is 1..999 | Valid | Range allowed by spec |
| EC-IN1-LOW | count < 1 | Invalid | Below lower bound |
| EC-IN1-HIGH | count > 999 | Invalid | Above upper bound |

Heuristics:

- Range condition: identify one valid class and two invalid classes.
- Set or enum condition: identify one valid class for each value that may be handled differently, plus at least one unsupported value.
- Must-be condition: identify one valid class and one invalid class.
- String format: split by length, charset, required prefix/suffix, case, whitespace, encoding, and empty/null rules.
- Structured object/array: split by required fields, extra fields, missing fields, element type, length, duplicate keys/items, ordering, and nested constraints.
- Numeric domains: consider integer vs decimal, negative/zero/positive, precision, overflow, NaN/Infinity when the language permits them.
- Date/time domains: consider invalid dates, timezone, boundary dates, start/end ordering, leap day, DST if relevant.
- Cross-field constraints: add classes for relationships such as `start <= end`, subtotal plus tax equals total, unique IDs, mutually exclusive options, or dependent required fields.
- Output classes matter too: normal result, transformed result, no-op result, validation error, thrown exception, permission error, not-found result, etc.

If elements inside one class are not handled identically by the code, split the class.

## 4. Select Domain Representatives

Minimum domain test-set rules:

- Choose at least one test case for each equivalence class.
- For valid classes, combine multiple valid classes in the same test when their combination is meaningful.
- For invalid classes, isolate one invalid class per test whenever feasible. Keep all other inputs valid and neutral.
- For cross-field invalid classes, change only the fields needed to trigger that relationship failure.
- Prefer realistic representative values from fixtures or docs when available.

Test-case table:

| TC ID | Surface | Covered ECs | Inputs/Actions | Expected Output | Notes |
| --- | --- | --- | --- | --- | --- |
| DT-001 | API | EC-IN1-VALID, EC-OUT1-OK |  |  | Valid representative |
| DT-002 | UI | EC-IN1-LOW, EC-OUT1-ERROR |  |  | Isolates lower invalid class |

## 5. Add Boundary Value Analysis

For ordered classes, add boundary cases around each lower and upper bound.

Use this pattern where the domain is discrete:

- lower invalid: `LB - 1`
- lower boundary: `LB`
- just above lower: `LB + 1`
- just below upper: `UB - 1`
- upper boundary: `UB`
- upper invalid: `UB + 1`

For continuous or non-integer domains, use the smallest meaningful step for the project: currency cent, millisecond, smallest accepted precision, next representable floating value, or a documented precision unit.

Boundary table:

| TC ID | Surface | Boundary Target | Inputs/Actions | Expected Output | Covered ECs |
| --- | --- | --- | --- | --- | --- |
| BVA-001 | API | IN1 LB-1 |  |  | invalid low |
| BVA-002 | UI | IN1 LB |  |  | valid |

Also consider:

- empty string, length 1, min length, min+1, max-1, max, max+1;
- empty array, one item, min items, max items, max+1;
- null/undefined/missing separately if the language distinguishes them;
- smallest/largest type values if overflow or parsing matters;
- inclusive vs exclusive inequality mistakes.

## 6. Convert to Executable Tests

Follow the repository's existing test style for the selected surface. Inspect package/config files and nearby tests before adding new tests.

When writing tests:

- name each test with the TC ID and behavior;
- assert exact return values and error behavior where stable;
- use existing fixtures/builders/mocks;
- avoid brittle implementation-detail assertions unless side effects are the contract;
- keep invalid-case tests independent;
- include comments only when the EC mapping is not obvious from the test name.

For API tests, prefer existing request helpers, route factories, auth helpers, seeded fixtures, and database cleanup patterns. Assert status, stable response shape, important headers, and state changes.

For UI tests, prefer existing browser/component test tools. Assert visible outcomes, validation messages, navigation, enabled/disabled states, and persisted user-observable effects. Avoid checking internal implementation state unless the local test style already does.

For UI and API tests together, avoid creating two exhaustive suites with identical data partitions. Keep a traceability table that shows which ECs are covered at each surface and why.

If expected behavior is ambiguous, do not hard-code guesses as tests unless the user approves the assumption. Put ambiguous cases in the report as review items.

## 7. Coverage and Quality Checks

Before finalizing, verify:

- the selected testing surface matches the user's request;
- every EC ID appears in at least one test case or is explicitly deferred;
- each invalid representative targets only one invalid class unless impossible;
- boundary cases cover both sides of every ordered limit;
- outputs include both normal and error paths;
- role/session/account-state partitions are covered when relevant;
- generated executable tests compile or run if practical;
- report distinguishes domain tests from boundary-value tests;
- assumptions and potential bugs are called out clearly.

## 8. Final Response Shape

Summarize:

- files changed or created;
- selected testing surface;
- number of equivalence classes and test cases;
- commands run and results;
- unresolved assumptions or cases needing human confirmation.
