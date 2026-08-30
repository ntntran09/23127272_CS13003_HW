# HW06 Test Case Catalog and Execution Results

The reviewed catalog contains 40 cases per selected API: 35 AI-generated cases and 5 student-origin extensions, all reviewed and confirmed by the student. `Actual` is the HTTP status returned by the SUT for the case's primary request; `Failure reason` lists the failed assertions (empty when the case passed). `NOT RUN` is reserved for the 30-second lockout-expiry case that needs a controllable clock or a timed fixture.

## Pool A - FR-02 - Login and account lockout

Contract: JWT login plus three-failure/30-second lockout

| ID | Origin | Title | Coverage | Expected | Actual | Result | Failure reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-AI-001 | AI | Valid user login returns JWT without secrets | domain, schema, security | 200 | 200 | FAILED | secrets absent |
| A-AI-002 | AI | Valid admin login returns JWT | domain, schema | 200 | 200 | PASSED |  |
| A-AI-003 | AI | Missing email | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-004 | AI | Null email | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-005 | AI | Empty email | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-006 | AI | Whitespace email | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-007 | AI | Email lacks at sign | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-008 | AI | Email lacks local part | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-009 | AI | Email lacks domain | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-010 | AI | Email contains spaces | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-011 | AI | Numeric email | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-012 | AI | Array email | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-013 | AI | Missing password | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-014 | AI | Null password | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-015 | AI | Empty password | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-016 | AI | Whitespace password | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-017 | AI | Numeric password | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-018 | AI | Object password | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-019 | AI | Unknown email | domain, schema, security | 401 | 401 | PASSED |  |
| A-AI-020 | AI | Wrong password | domain, schema, security | 401 | 401 | PASSED |  |
| A-AI-021 | AI | Empty JSON object | domain, schema | 400/422 | 401 | FAILED | status is allowed |
| A-AI-022 | AI | Malformed JSON | domain, schema | 400 | 400 | FAILED | content type; response schema |
| A-AI-023 | AI | Role field cannot select admin | security, schema | 200 | 200 | PASSED |  |
| A-AI-024 | AI | SQL injection in email | security, schema | 401 | 401 | PASSED |  |
| A-AI-025 | AI | SQL injection in password | security, schema | 401 | 401 | PASSED |  |
| A-AI-026 | AI | Failure response is JSON | schema | 401 | 401 | PASSED |  |
| A-AI-027 | AI | Long email rejected without 5xx | domain, security, schema | 400/401/422 | 401 | PASSED |  |
| A-AI-028 | AI | Correct password after 1 consecutive failure(s) | state, schema, security | 200 | 200 | PASSED |  |
| A-AI-029 | AI | Correct password after 2 consecutive failure(s) | state, schema, security | 200 | 403 | FAILED | status is allowed; response schema |
| A-AI-030 | AI | Correct password after 3 consecutive failure(s) | state, schema, security | 403 | 403 | PASSED |  |
| A-AI-031 | AI | Correct password after 4 consecutive failure(s) | state, schema, security | 403 | 403 | PASSED |  |
| A-AI-032 | AI | Success resets failed-attempt counter | state, schema | 200 | 200 | PASSED |  |
| A-AI-033 | AI | Locked response leaks no secrets | state, security, schema | 403 | 403 | PASSED |  |
| A-AI-034 | AI | Email case variation has stable behavior | domain, schema | 200/401 | 401 | PASSED |  |
| A-AI-035 | AI | Lock expires at 30-second boundary | state, security | 200 | 403 | FAILED | Manually executed with a 30-second wait; the account was still locked (HTTP 403). The SUT locks for 180s, not the 30s the spec requires. |
| A-STU-036 | STUDENT | JWT role claim matches the persisted user role | security, schema | 200 | 200 | PASSED |  |
| A-STU-037 | STUDENT | Login does not leak whether an email exists (uniform failure) | security | 401 | 401 | PASSED |  |
| A-STU-038 | STUDENT | Unknown extra nested object is ignored | security, schema | 200 | 200 | PASSED |  |
| A-STU-039 | STUDENT | Unicode email fails generically | domain, security, schema | 400/401/422 | 401 | PASSED |  |
| A-STU-040 | STUDENT | Oversized password fails without 5xx | domain, security, schema | 400/401/413/422 | 401 | PASSED |  |

## Pool B - FR-07 - Add product to cart

Contract: Authenticated validated cart mutation with merge and isolation

| ID | Origin | Title | Coverage | Expected | Actual | Result | Failure reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B-AI-001 | AI | Add existing product quantity one | domain, state, schema | 200 | 200 | PASSED |  |
| B-AI-002 | AI | Missing JWT | security, schema | 401 | 401 | PASSED |  |
| B-AI-003 | AI | Empty bearer | security, schema | 401 | 401 | PASSED |  |
| B-AI-004 | AI | Malformed JWT | security, schema | 403 | 403 | PASSED |  |
| B-AI-005 | AI | Wrong scheme | security, schema | 403 | 403 | PASSED |  |
| B-AI-006 | AI | Tampered JWT | security, schema | 403 | 403 | PASSED |  |
| B-AI-007 | AI | Missing id | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-008 | AI | Null id | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-009 | AI | Zero id | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-010 | AI | Negative id | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-011 | AI | Decimal id | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-012 | AI | String id | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-013 | AI | Nonexistent id | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-014 | AI | Missing quantity | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-015 | AI | Null quantity | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-016 | AI | Zero quantity | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-017 | AI | Negative quantity | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-018 | AI | Decimal quantity | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-019 | AI | String quantity | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-020 | AI | Boolean quantity | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-021 | AI | Missing name | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-022 | AI | Empty name | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-023 | AI | Missing price | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-024 | AI | Zero price | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-025 | AI | Negative price | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-026 | AI | Valid quantity 1 | domain, schema | 200 | 200 | PASSED |  |
| B-AI-027 | AI | Valid quantity 2 | domain, schema | 200 | 200 | PASSED |  |
| B-AI-028 | AI | Same product merges and sums quantity | state, schema | 200 | 200 | FAILED | merge |
| B-AI-029 | AI | Different product creates second line | state, schema | 200 | 200 | PASSED |  |
| B-AI-030 | AI | Malformed JSON | domain, schema | 400 | 400 | FAILED | content type; response schema |
| B-AI-031 | AI | Empty object | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-032 | AI | SQL text remains data | security, schema | 200 | 200 | PASSED |  |
| B-AI-033 | AI | HTML text remains inert | security, schema | 200 | 200 | PASSED |  |
| B-AI-034 | AI | Forged price rejected | security, state, schema | 400/409/422 | 200 | FAILED | status is allowed; response schema |
| B-AI-035 | AI | Forged name rejected | security, state, schema | 400/409/422 | 200 | FAILED | status is allowed; response schema |
| B-STU-036 | STUDENT | Repeated quantities sum arithmetically (2 then 3 = 5) | security, state, schema | 200 | 200 | FAILED | quantities 2+3 sum to 5 in one row |
| B-STU-037 | STUDENT | Two authenticated users have isolated carts | security, state, schema | 200 | 200 | PASSED |  |
| B-STU-038 | STUDENT | Body user_id cannot redirect cart ownership | security, state, schema | 200 | 200 | PASSED |  |
| B-STU-039 | STUDENT | Overflow-like quantity rejected | security, state, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| B-STU-040 | STUDENT | Prototype-looking property ignored | security, state, schema | 200 | 200 | PASSED |  |

## Pool C - FR-15 - Create product

Contract: Admin-only validated product creation and persistence

| ID | Origin | Title | Coverage | Expected | Actual | Result | Failure reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C-AI-001 | AI | Admin creates valid product | domain, state, schema | 200 | 200 | PASSED |  |
| C-AI-002 | AI | Missing JWT | security, schema | 401 | 200 | FAILED | status is allowed; response schema |
| C-AI-003 | AI | Malformed JWT | security, schema | 403 | 200 | FAILED | status is allowed; response schema |
| C-AI-004 | AI | Wrong scheme | security, schema | 403 | 200 | FAILED | status is allowed; response schema |
| C-AI-005 | AI | Normal user JWT | security, schema | 403 | 200 | FAILED | status is allowed; response schema |
| C-AI-006 | AI | Missing name | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-007 | AI | Null name | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-008 | AI | Empty name | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-009 | AI | Whitespace name | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-010 | AI | Numeric name | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-011 | AI | Name length one | domain, schema | 200 | 200 | PASSED |  |
| C-AI-012 | AI | Name length 254 | domain, schema | 200 | 200 | PASSED |  |
| C-AI-013 | AI | Name length 255 | domain, schema | 200 | 200 | PASSED |  |
| C-AI-014 | AI | Name length 256 | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-015 | AI | Missing price | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-016 | AI | Null price | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-017 | AI | Negative price | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-018 | AI | Zero price | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-019 | AI | Price one | domain, schema | 200 | 200 | PASSED |  |
| C-AI-020 | AI | Positive decimal price | domain, schema | 200 | 200 | PASSED |  |
| C-AI-021 | AI | String price | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-022 | AI | Boolean price | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-023 | AI | Array price | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-024 | AI | Missing category | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-025 | AI | Null category | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-026 | AI | Category zero | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-027 | AI | Negative category | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-028 | AI | Nonexistent category | domain, schema | 400/404/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-029 | AI | String category | domain, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-AI-030 | AI | Existing category three | domain, schema | 200 | 200 | PASSED |  |
| C-AI-031 | AI | Optional description and image omitted | domain, schema | 200 | 200 | PASSED |  |
| C-AI-032 | AI | Malformed JSON | domain, schema | 400 | 400 | FAILED | content type; response schema |
| C-AI-033 | AI | SQL text remains data | security, schema | 200 | 200 | PASSED |  |
| C-AI-034 | AI | HTML text remains inert | security, schema | 200 | 200 | PASSED |  |
| C-AI-035 | AI | Role field cannot affect authorization | security, schema | 200 | 200 | PASSED |  |
| C-STU-036 | STUDENT | Created product persists exact stable fields | state, schema | 200 | 200 | PASSED |  |
| C-STU-037 | STUDENT | User JWT plus forged role still forbidden | security, state, schema | 403 | 200 | FAILED | status is allowed; response schema |
| C-STU-038 | STUDENT | Client-supplied id cannot override the server-assigned product id | security, state, schema | 200/201 | 200 | PASSED |  |
| C-STU-039 | STUDENT | Unsafe-integer price rejected | domain, security, schema | 400/422 | 200 | FAILED | status is allowed; response schema |
| C-STU-040 | STUDENT | Server-controlled id and owner fields ignored | security, state, schema | 200 | 200 | PASSED |  |

