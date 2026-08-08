# FR-11 Domain Testing Report - User Order History

## 1. Selected Testing Surface

| Item | Decision |
| --- | --- |
| Feature | FR-11: Xem lich su don hang (User) / View order history as user |
| SUT area | EShop Frontend Web |
| Surface | UI only |
| Main source files reviewed | `D:\CODE\eshop-sut\README.md`, `D:\CODE\eshop-sut\frontend-web\src\pages\Profile.jsx`, `D:\CODE\eshop-sut\frontend-web\src\App.jsx`, `D:\CODE\eshop-sut\frontend-web\src\context\AuthContext.jsx`, `D:\CODE\eshop-sut\backend\server.js`, `D:\CODE\eshop-sut\backend\database.js`, `D:\CODE\eshop-sut\api_specification.md` |
| Test type | Manual UI test cases using domain testing and boundary value analysis |
| Executable tests | Not produced. The frontend project has no existing UI test framework or test script in `package.json`. |

Rationale: the request explicitly says "UI test only". The cases below check user-visible navigation, authentication gate behavior, order table rendering, empty/error states, displayed order ownership, date display, money formatting, translated status labels, and visual status distinction. API status codes and database assertions are not part of the test oracle.

## 2. Feature Contract Summary

FR-11 requires a logged-in user to view only their own order history. For each visible order, the UI must display:

- order code / order id;
- order date;
- total amount;
- current status.

The status must be translated clearly into Vietnamese and visually distinguished by color. The current implementation renders this feature inside the `/profile` page, in the "Lich su don hang" section beside the user profile form.

Review checkpoint: expected behavior is based on the README requirements. Current implementation details are used to identify likely bugs and UI risks, not to weaken the expected results.

## 3. Input and Output Variables

| ID | Variable | Direction | Type/Shape | Constraints | Source |
| --- | --- | --- | --- | --- | --- |
| IN1 | Entry point | Input | Navigation action | User can reach order history from `/profile` and profile/header navigation | UI/code |
| IN2 | Authentication/session state | Input | Guest, valid user token, expired/invalid token | Only authenticated users should see order history | FR-11, auth context |
| IN3 | User identity / order ownership | Input | Current user id vs order owner id | User must see only their own orders | FR-11 |
| IN4 | Order count | Input | 0, 1, many orders | Empty history and populated history must be displayed correctly | UI/spec |
| IN5 | Order id | Input/Output | Positive integer identifier | Displayed as the order code/id | FR-11 |
| IN6 | Order date | Input/Output | `created_at` timestamp/date string | Displayed as a readable order date | FR-11 |
| IN7 | Total amount | Input/Output | Number in VND | Displayed with thousands separators and currency symbol | FR-11, FR-21 |
| IN8 | Order status | Input/Output | `pending`, `confirmed`, `shipping`, `delivered`, `canceled` | Must display clear Vietnamese label and distinct color | FR-10, FR-11 |
| IN9 | Data loading result | Input | Successful load, empty load, failed load | UI should not confuse failed loading with a true empty history | UI quality |
| OUT1 | Authentication gate | Output | Visible page state | Guest/invalid session cannot view order rows | FR-11 |
| OUT2 | Order-history heading/section | Output | Visible section | User can identify the order-history area | UI/spec |
| OUT3 | Empty state | Output | Visible message | User with no orders sees a clear no-orders message | UI/spec |
| OUT4 | History table | Output | Table/list rows and columns | Displays order id, date, total amount, status | FR-11 |
| OUT5 | Ownership filtering | Output | Visible rows | No order belonging to another user is visible | FR-11 |
| OUT6 | Status label and color | Output | Text + visual style | Status is Vietnamese and color-distinguished | FR-11 |
| OUT7 | Error state | Output | Visible message | Loading failure is distinguishable from zero orders | UI quality |

## 4. Equivalence Classes

| EC ID | Variable | Class | Validity | Rationale |
| --- | --- | --- | --- | --- |
| EC-IN1-DIRECT | Entry point | User opens `/profile` directly | Valid | Direct route should expose profile/order-history area when logged in |
| EC-IN1-HEADER | Entry point | User opens profile via header greeting/profile link | Valid | Main app navigation path |
| EC-IN2-AUTH-USER | Session | Logged-in normal user with valid token | Valid | Required actor for FR-11 |
| EC-IN2-GUEST | Session | Not logged in | Invalid | Guest must not see user orders |
| EC-IN2-EXPIRED | Session | Expired/invalid token or cleared local storage | Invalid | Stale sessions must not expose prior user's orders |
| EC-IN3-OWN-ONLY | Ownership | All returned visible orders belong to current user | Valid | Core privacy requirement |
| EC-IN3-MIXED-DATA | Ownership | Test data contains both current user's and another user's orders | Valid input state | UI must show only current user's orders |
| EC-IN3-OTHER-VISIBLE | Ownership | Another user's order is visible to current user | Invalid output | Violates FR-11 |
| EC-IN4-ZERO | Order count | Current user has 0 orders | Valid | Empty state partition |
| EC-IN4-ONE | Order count | Current user has exactly 1 order | Valid | Lower populated boundary |
| EC-IN4-MANY | Order count | Current user has 2 or more orders | Valid | Multi-row table behavior |
| EC-IN5-ID-POSITIVE | Order id | Positive integer id, e.g. `1` | Valid | Normal generated order id |
| EC-IN5-ID-LOW | Order id | Zero or negative id | Invalid/Needs review | UI should avoid presenting impossible order codes as normal orders |
| EC-IN5-ID-MISSING | Order id | Missing/null id in displayed order data | Invalid/Needs review | UI should avoid blank or misleading order code |
| EC-IN6-DATE-VALID | Order date | Valid `created_at` timestamp | Valid | Normal order date display |
| EC-IN6-DATE-MISSING | Order date | Missing/null date | Invalid/Needs review | UI should show a safe placeholder, not an invalid date artifact |
| EC-IN6-DATE-INVALID | Order date | Unparseable date string | Invalid/Needs review | UI should not show raw "Invalid Date" |
| EC-IN7-TOTAL-ZERO | Total amount | `0` VND | Valid/Boundary | Possible after full discount or test data; should display as 0 VND |
| EC-IN7-TOTAL-POSITIVE | Total amount | Positive integer amount | Valid | Normal order amount |
| EC-IN7-TOTAL-LARGE | Total amount | Large amount requiring separators | Valid | Currency formatting partition |
| EC-IN7-TOTAL-NEGATIVE | Total amount | Negative amount | Invalid/Needs review | Invalid order total should not be presented as normal money |
| EC-IN7-TOTAL-MISSING | Total amount | Missing/null amount | Invalid/Needs review | UI should not silently turn missing data into a valid-looking total |
| EC-IN8-PENDING | Status | `pending` | Valid | State machine status |
| EC-IN8-CONFIRMED | Status | `confirmed` | Valid | State machine status |
| EC-IN8-SHIPPING | Status | `shipping` | Valid | State machine status |
| EC-IN8-DELIVERED | Status | `delivered` | Valid | Final state |
| EC-IN8-CANCELED | Status | `canceled` | Valid | Final state |
| EC-IN8-UNKNOWN | Status | Unsupported status, e.g. `returned` | Invalid/Needs review | UI should not expose raw untranslated status |
| EC-IN8-MISSING | Status | Missing/null status | Invalid/Needs review | UI should show safe fallback |
| EC-IN9-LOAD-OK | Data load | Order fetch succeeds | Valid | Normal rendering |
| EC-IN9-LOAD-ERROR | Data load | Order fetch fails after authentication | Invalid/Needs review | Error should be visible, not mistaken for no orders |
| EC-OUT1-PROMPT | Auth gate | Login-required message or redirect is shown | Valid output | Protects private order data |
| EC-OUT2-SECTION | History section | Clear order-history section title is visible | Valid output | User can locate the feature |
| EC-OUT3-EMPTY | Empty state | No-orders message is visible | Valid output | Handles zero orders |
| EC-OUT4-COLUMNS | Table | Columns include order id, date, total, status | Valid output | Required fields |
| EC-OUT4-ROWS | Table | One row per visible owned order | Valid output | Core display behavior |
| EC-OUT5-NO-OTHER | Ownership | Other users' order ids/details absent | Valid output | Core privacy behavior |
| EC-OUT6-VIETNAMESE | Status output | Status labels are clear Vietnamese text | Valid output | FR-11 translation requirement |
| EC-OUT6-COLOR | Status output | Status labels have visually distinct colors | Valid output | FR-11 color requirement |
| EC-OUT7-MONEY | Money output | Total uses thousands separators and VND symbol | Valid output | FR-11/FR-21 amount display |
| EC-OUT8-DATE | Date output | Date is readable and not `Invalid Date` | Valid output | FR-11 date display |
| EC-OUT9-ERROR | Error output | Data-load failure is visible | Valid output | Prevents false empty-state interpretation |

## 5. Minimum Domain Test Set

| TC ID | Surface | Covered ECs | Preconditions | Inputs / Actions | Expected UI Output | Notes / Result |
| --- | --- | --- | --- | --- | --- | --- |
| DT-FR11-001 | UI | EC-IN2-GUEST, EC-IN1-DIRECT, EC-OUT1-PROMPT | Browser has no token | Open `/profile` | Login-required message or redirect is shown; no order rows are visible | Auth gate |
| DT-FR11-002 | UI | EC-IN2-EXPIRED, EC-OUT1-PROMPT | Browser has expired/invalid token | Open `/profile` | App clears invalid session or blocks order history; no stale orders are visible | Session privacy |
| DT-FR11-003 | UI | EC-IN2-AUTH-USER, EC-IN1-HEADER, EC-OUT2-SECTION | User `test@eshop.com` is logged in | Click profile/header greeting link | `/profile` opens and order-history section is visible | Main navigation |
| DT-FR11-004 | UI | EC-IN4-ZERO, EC-IN9-LOAD-OK, EC-OUT3-EMPTY | Logged-in user has no orders | Open `/profile` | Empty message says the user has no orders; no table rows are shown | Empty state |
| DT-FR11-005 | UI | EC-IN4-ONE, EC-IN5-ID-POSITIVE, EC-IN6-DATE-VALID, EC-IN7-TOTAL-POSITIVE, EC-IN8-PENDING, EC-OUT4-COLUMNS, EC-OUT4-ROWS, EC-OUT7-MONEY, EC-OUT8-DATE | Logged-in user has one pending order | Open `/profile` | Table shows one row with order id, readable date, formatted total, and translated pending status | Single-row representative |
| DT-FR11-006 | UI | EC-IN4-MANY, EC-OUT4-ROWS | Logged-in user has at least two own orders | Open `/profile` | One row is visible for each own order; rows remain readable | Multi-row representative |
| DT-FR11-007 | UI | EC-IN3-MIXED-DATA, EC-IN3-OWN-ONLY, EC-OUT5-NO-OTHER | Test data has current user's orders and another user's distinct order | Log in as current user and open `/profile` | Only current user's order ids/details are visible; other user's order is absent | Core FR-11 privacy case |
| DT-FR11-008 | UI | EC-IN3-OTHER-VISIBLE | Same mixed data as above | Look for the other user's known order id/amount/date | Other user's order must not be visible | Isolates invalid output |
| DT-FR11-009 | UI | EC-IN8-PENDING, EC-OUT6-VIETNAMESE, EC-OUT6-COLOR | User has a pending order | View order row | Status is shown as clear Vietnamese for pending and has a distinct pending color | Status partition |
| DT-FR11-010 | UI | EC-IN8-CONFIRMED, EC-OUT6-VIETNAMESE, EC-OUT6-COLOR | User has a confirmed order | View order row | Status is shown as clear Vietnamese for confirmed and has a distinct confirmed color | Status partition |
| DT-FR11-011 | UI | EC-IN8-SHIPPING, EC-OUT6-VIETNAMESE, EC-OUT6-COLOR | User has a shipping order | View order row | Status is shown as clear Vietnamese for shipping, has a distinct shipping color, and does not show a cancel action because FR-10 allows cancellation only for `pending` or `confirmed` | FAIL. Web UI shows cancel for every status except `delivered` and `canceled`, including `shipping`. |
| DT-FR11-012 | UI | EC-IN8-DELIVERED, EC-OUT6-VIETNAMESE, EC-OUT6-COLOR | User has a delivered order | View order row | Status is shown as clear Vietnamese for delivered and has a distinct delivered color | Status partition |
| DT-FR11-013 | UI | EC-IN8-CANCELED, EC-OUT6-VIETNAMESE, EC-OUT6-COLOR | User has a canceled order | View order row | Status is shown as clear Vietnamese for canceled and has a distinct canceled color | Status partition |
| DT-FR11-014 | UI | EC-IN8-PENDING, EC-IN8-CONFIRMED, EC-IN8-SHIPPING, EC-IN8-DELIVERED, EC-IN8-CANCELED, EC-OUT6-COLOR | User has five orders covering all valid statuses | Compare all status badges | All five statuses are distinguishable by text and color | Combined visual check |
| DT-FR11-015 | UI | EC-IN8-UNKNOWN, EC-OUT6-VIETNAMESE | User has an order with unsupported status `returned` in test data | Open `/profile` | UI shows a safe Vietnamese fallback such as "Trang thai khong xac dinh", not raw `RETURNED` | Needs seeded invalid data |
| DT-FR11-016 | UI | EC-IN8-MISSING, EC-OUT6-VIETNAMESE | User has an order with missing status in test data | Open `/profile` | UI shows a safe fallback and does not crash | FAIL. `statusLabel(null)` can reach `status.toUpperCase()` and crash. |
| DT-FR11-017 | UI | EC-IN7-TOTAL-POSITIVE, EC-OUT7-MONEY | User has order total `300000` | Open `/profile` | Total is displayed with a thousands separator and VND currency symbol, e.g. `300,000 ₫` or locale-equivalent `300.000 ₫` | PASS. Code uses `toLocaleString()` and appends VND symbol. |
| DT-FR11-018 | UI | EC-IN7-TOTAL-ZERO, EC-OUT7-MONEY | User has order total `0` | Open `/profile` | Total is displayed as `0` with VND currency symbol, not blank or NaN | Lower boundary |
| DT-FR11-019 | UI | EC-IN7-TOTAL-LARGE, EC-OUT7-MONEY | User has order total `1234567890` | Open `/profile` | Total is displayed with thousands separators and VND currency symbol | Large amount |
| DT-FR11-020 | UI | EC-IN7-TOTAL-NEGATIVE | User has order total `-1` in invalid test data | Open `/profile` | UI flags invalid amount or shows safe placeholder; it should not look like a normal order total | Needs seeded invalid data |
| DT-FR11-021 | UI | EC-IN7-TOTAL-MISSING | User has order with missing/null total in invalid test data | Open `/profile` | UI shows safe placeholder; it should not silently convert missing total to `0` | Needs seeded invalid data |
| DT-FR11-022 | UI | EC-IN6-DATE-VALID, EC-OUT8-DATE | User has order date `2026-07-06T10:30:00Z` | Open `/profile` | Date column shows a readable local date and no raw timestamp clutter | Date format |
| DT-FR11-023 | UI | EC-IN6-DATE-MISSING, EC-OUT8-DATE | User has order with missing/null date in invalid test data | Open `/profile` | UI shows safe placeholder and does not display `Invalid Date` | Needs seeded invalid data |
| DT-FR11-024 | UI | EC-IN6-DATE-INVALID, EC-OUT8-DATE | User has order date `not-a-date` in invalid test data | Open `/profile` | UI shows safe placeholder and does not display `Invalid Date` | Needs seeded invalid data |
| DT-FR11-025 | UI | EC-IN9-LOAD-ERROR, EC-OUT9-ERROR | User is logged in; backend order endpoint fails or network is blocked | Open `/profile` | A visible load-error message is shown; UI does not claim the user has no orders | Error-state partition |
| DT-FR11-026 | UI | EC-IN5-ID-MISSING | User has order with missing id in invalid test data | Open `/profile` | UI shows safe placeholder or hides invalid row; no blank/misleading order code | Needs seeded invalid data |
| DT-FR11-027 | UI | EC-IN8-SHIPPING | Logged-in user has an order with `status = "shipping"` | Open `/profile` and inspect the shipping order row | Shipping order shows status only; no cancel button is visible | FAIL. Cancel button is shown for `shipping` in `Profile.jsx`. |
| DT-FR11-028 | UI/API-observable | EC-IN8-SHIPPING | Logged-in user owns a `shipping` order | Trigger cancel on the shipping order | Cancel is rejected and order remains `shipping` | FAIL. Backend only blocks `delivered` and `canceled`; `shipping` is updated to `canceled`. |
| DT-FR11-029 | UI | EC-OUT2-SECTION | Logged-in user opens `/profile` | Inspect page heading structure | Page has exactly one `<h1>` representing the page title | FAIL. `Profile.jsx` renders `<h2>` headings and no `<h1>`. |
| DT-FR11-030 | UI | EC-IN2-AUTH-USER | Logged-in user opens `/profile` | Enter valid Vietnamese phone `0912345678` and submit profile update | Phone is accepted because it starts with `0` and has 10 digits | FAIL. Regex requires first digit `1-9`, so valid Vietnamese phone is rejected. |
| DT-FR11-031 | UI | EC-IN2-AUTH-USER | Logged-in user opens `/profile` | Enter invalid phone `123456789` and submit profile update | Phone is rejected because it does not start with `0` and has only 9 digits | FAIL. Regex accepts one nonzero digit plus 8 digits. |

## 6. Boundary Value Test Set

| TC ID | Surface | Boundary Target | Preconditions | Inputs / Actions | Expected UI Output | Covered ECs |
| --- | --- | --- | --- | --- | --- | --- |
| BVA-FR11-001 | UI | Order count LB | User has 0 orders | Open `/profile` | Empty no-orders message is visible | EC-IN4-ZERO |
| BVA-FR11-002 | UI | Order count LB+1 | User has 1 order | Open `/profile` | Exactly one order row is visible | EC-IN4-ONE |
| BVA-FR11-003 | UI | Order count LB+2 | User has 2 orders | Open `/profile` | Exactly two order rows are visible and both are readable | EC-IN4-MANY |
| BVA-FR11-004 | UI | Order id invalid low | User has invalid order id `0` in test data | Open `/profile` | UI does not present `#0` as a normal valid order code | EC-IN5-ID-LOW |
| BVA-FR11-005 | UI | Order id lower valid | User has order id `1` | Open `/profile` | Order code is displayed as `#1` or equivalent | EC-IN5-ID-POSITIVE |
| BVA-FR11-006 | UI | Total LB-1 | User has invalid total `-1` | Open `/profile` | UI flags invalid amount or safe placeholder | EC-IN7-TOTAL-NEGATIVE |
| BVA-FR11-007 | UI | Total LB | User has total `0` | Open `/profile` | Displays `0` with VND currency symbol | EC-IN7-TOTAL-ZERO |
| BVA-FR11-008 | UI | Total LB+1 | User has total `1` | Open `/profile` | Displays `1` with VND currency symbol | EC-IN7-TOTAL-POSITIVE |
| BVA-FR11-009 | UI | Thousands separator UB-1 | User has total `999` | Open `/profile` | Displays `999` with VND currency symbol | EC-IN7-TOTAL-POSITIVE |
| BVA-FR11-010 | UI | Thousands separator UB | User has total `1000` | Open `/profile` | Displays `1,000` or locale-equivalent separator with VND symbol | EC-IN7-TOTAL-POSITIVE |
| BVA-FR11-011 | UI | Date valid boundary: leap day | User has date `2024-02-29T00:00:00Z` | Open `/profile` | Date renders as a readable valid date | EC-IN6-DATE-VALID |
| BVA-FR11-012 | UI | Date invalid boundary: non-leap day | User has date `2023-02-29T00:00:00Z` or invalid test fixture | Open `/profile` | UI shows safe placeholder, not `Invalid Date` | EC-IN6-DATE-INVALID |
| BVA-FR11-013 | UI | Status enum first value | User has `pending` order | Open `/profile` | Pending status translated and colored | EC-IN8-PENDING |
| BVA-FR11-014 | UI | Status enum final value | User has `canceled` order | Open `/profile` | Canceled status translated and colored | EC-IN8-CANCELED |
| BVA-FR11-015 | UI | Status enum unsupported | User has `returned` order in invalid fixture | Open `/profile` | Safe Vietnamese fallback, not raw code | EC-IN8-UNKNOWN |

Notes:

- Some BVA cases require seeded or manually edited database records. They are still useful because FR-11 is a rendering/privacy feature whose boundaries are driven by visible data shape.
- No maximum order count or maximum total amount is specified, so the report tests small count boundaries and representative large money formatting rather than inventing a hard upper limit.

## 7. Suggested Manual Execution Data

| Data Item | Value |
| --- | --- |
| Normal user | `test@eshop.com` / `Test1234!` |
| Other user | Create `other@example.com` / `Other123!` |
| Own pending order | `user_id = test user`, `status = pending`, `total_amount = 300000` |
| Other user's distinctive order | `user_id = other user`, `status = delivered`, `total_amount = 987654321` |
| Valid statuses | `pending`, `confirmed`, `shipping`, `delivered`, `canceled` |
| Invalid status fixture | `returned` or null |
| Valid date fixture | `2026-07-06T10:30:00Z` |
| Leap-day date fixture | `2024-02-29T00:00:00Z` |
| Invalid date fixture | `not-a-date` |
| Money boundary fixtures | `-1`, `0`, `1`, `999`, `1000`, `1234567890` |

## 8. Current Implementation Risks / Likely Bugs

These are observations from the current SUT files and should be verified during UI execution.

| Bug ID | Observation | Evidence | Related tests |
| --- | --- | --- | --- |
| BUG-FR11-001 | Order fetch failure is silently rendered like an empty history | `Profile.jsx` catches fetch errors, logs to console, and calls `setOrders([])` | DT-FR11-025 |
| BUG-FR11-002 | Unsupported status is rendered as raw uppercase text instead of clear Vietnamese text | `statusLabel(status)` returns `status.toUpperCase()` for unknown values | DT-FR11-015, BVA-FR11-015 |
| BUG-FR11-003 | Missing or invalid date can render as `Invalid Date` | `new Date(o.created_at).toLocaleDateString()` has no guard | DT-FR11-023, DT-FR11-024 |
| BUG-FR11-004 | Missing total amount is silently displayed as `0` | `Number(o.total_amount || 0).toLocaleString()` converts null/undefined to 0 | DT-FR11-021 |
| BUG-FR11-005 | The profile/order-history page uses `<h2>` headings rather than the general one-`<h1>` page-title requirement | `Profile.jsx` renders `<h2>` for profile and order history sections | DT-FR11-003 |
| BUG-FR11-006 | A cancel button is displayed for `shipping` orders, although FR-10 says users cannot cancel shipping orders | `Profile.jsx` shows cancel button for every status except `delivered` and `canceled` | Follow-up FR-10/UI interaction test |

## 9. Assumptions and Open Questions

| ID | Assumption / Question | Impact |
| --- | --- | --- |
| A1 | The README is treated as the intended contract when it conflicts with the implementation. | Tests may fail against the current SUT, exposing bugs. |
| A2 | "Only own orders" can be verified through UI by logging in as one user and checking that another user's distinctive order does not appear. | No direct API/database assertion is needed in the test result. |
| A3 | `0` VND is treated as a display boundary rather than automatically invalid because coupons or test fixtures might create it. | If business rules forbid zero-total orders, move `EC-IN7-TOTAL-ZERO` to invalid. |
| A4 | Unsupported/missing status and malformed dates require seeded invalid data. | These tests may be documented if database setup is not available during manual execution. |
| A5 | Date format is locale-dependent, so tests should assert readability and absence of `Invalid Date`, not a single exact day/month string unless the browser locale is fixed. | Avoids brittle UI expectations. |

## 10. Coverage Check

| Coverage Item | Status |
| --- | --- |
| UI-only surface respected | Covered |
| Authentication/session classes | Covered |
| Direct and header navigation to history | Covered |
| Zero, one, and many order counts | Covered |
| Own-order privacy and non-owner exclusion | Covered |
| Required displayed fields: id, date, total, status | Covered |
| All five valid order statuses | Covered |
| Vietnamese status label and color distinction | Covered |
| Money formatting boundaries | Covered |
| Date rendering boundaries | Covered |
| Loading/error-state risk | Covered |
| Executable UI tests | Deferred because no UI test framework exists in the reviewed frontend project |
