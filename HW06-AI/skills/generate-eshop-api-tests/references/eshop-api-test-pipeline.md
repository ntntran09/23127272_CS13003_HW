# EShop API Test-Generation Pipeline

Use this reference only after the student has selected the three APIs.

## 1. Contract inventory

For each API, record:

| Field | Required content |
| --- | --- |
| Identity | Pool, FR, method, path, actor |
| Preconditions | auth/role, seeded records, current state, cart/order/coupon state |
| Inputs | path, query, headers, body, database preconditions |
| Outputs | status, content type, exact JSON schema, stable values, state/persistence effects |
| Oracle source | requirement line, API specification section, source location |
| Ambiguity | question or labeled assumption; never a silent guess |

Create stable IDs: `A-EC-*`, `B-EC-*`, `C-EC-*`; `A-AI-001`; `A-STU-001`.

## 2. Domain and boundary pass

Partition every input. Include missing, null, wrong type, empty, whitespace-only, minimum, just-inside, nominal, just-outside, maximum, too long, encoding, duplicate, and cross-field relationships when applicable.

For ordered domains use `LB-1`, `LB`, `LB+1`, `UB-1`, `UB`, `UB+1`. For strings, use length and format boundaries. For IDs, include existing owned, existing non-owned, nonexistent positive, zero, negative, decimal, nonnumeric, overflow-like, and encoded path forms.

## 3. State pass

Model states and transitions before writing cases. Cover every permitted and forbidden transition, repeat/idempotency behavior, stale/conflicting state, owner/non-owner, missing entities, state unchanged after rejection, and persistence after success.

Login lockout, OTP lifecycle, cart accumulation, coupon usage, and order status are state machines even when the endpoint is not FR-10.

## 4. Security pass

Trace all SEC requirements across the suite:

| ID | Required test intent |
| --- | --- |
| SEC-01 | Verify no API response leaks passwords; inspect stored password evidence only through an authorized local database check. |
| SEC-02 | Missing, malformed, expired/invalid, wrong-scheme, and valid JWT behavior on protected APIs. |
| SEC-03 | Valid non-admin JWT cannot call admin APIs; admin JWT can. |
| SEC-04 | Stored/reflected HTML or script payload remains inert/escaped at the consuming UI; at API surface, preserve JSON safely and flag UI verification separately. |
| SEC-05 | SQL metacharacters/injection payloads do not alter query meaning or leak database errors. |
| SEC-06 | Profile/body mass assignment cannot change `role` or other server-controlled fields. |
| SEC-07 | OTP is six digits or stronger, bound to the email, expires, and is single-use. |

Also consider IDOR, excessive data exposure, mass assignment, role escalation, replay, brute force/rate behavior, and error-message leakage. Do not run destructive security cases against production.

## 5. Schema pass

Write JSON Schema for every stable success/error response family. Check root shape, required properties, exact types, enums, nullability, permitted extra properties, secret absence, and consistent error content type.

Do not infer an exact schema from one observed response alone. Reconcile the API specification, requirements, and implementation.

## 6. Generation and audit pass

Generate in multiple prompts/passes. Keep raw AI-origin cases unchanged as evidence before human correction. Audit every AI case:

| Verdict | Meaning | Required fix field |
| --- | --- | --- |
| VALID | Correct and complete for its intent | `None` allowed |
| INVALID | Wrong oracle, unsafe setup, unsupported requirement, duplicate, or impossible request | Concrete replacement/removal |
| INCOMPLETE | Useful but missing input, prerequisite, assertion, schema, cleanup, or traceability | Concrete completion |

After audit, add at least five student-origin cases per API. A renamed duplicate is not a student extension.

## 7. Coverage checklist

- Exactly one selected API from Pool A, B, and C.
- At least 35 AI-origin and 5 student-origin cases per API.
- Every EC ID covered.
- `domain`, `state`, `security`, and `schema` represented per API.
- SEC-01 through SEC-07 represented across the suite or explicitly deferred with human-approved rationale.
- At least one JSON Schema assertion per API.
- Expected state unchanged after invalid transitions.
- Each negative case isolates one invalid class where feasible.
- Every case has reproducible prerequisites and cleanup/reset guidance.
- Every expected result cites its oracle source.

## 8. Evidence and reporting

Save the source specification and SUT SHA; prompts and final AI outputs; pre-review and corrected catalogs; validator output; Postman collection/environment/data; genuine Newman reports; student screenshots; published issue and CI URLs; test summary; and AI audit.

Never generate screenshots, run URLs, issue URLs, execution counts, timestamps, or pass/fail evidence that did not occur.
