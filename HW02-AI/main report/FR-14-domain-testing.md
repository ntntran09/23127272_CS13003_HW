# FR-14 Domain Testing Report - Category Management

## 1. Selected Testing Surface

| Item | Decision |
| --- | --- |
| Feature | FR-14: Quan ly Danh muc (Category CRUD) |
| SUT area | EShop Web Admin |
| Surface | UI only |
| Main source files reviewed | `D:\CODE\eshop-sut\README.md`, `D:\CODE\eshop-sut\frontend-admin\src\App.jsx`, `D:\CODE\eshop-sut\frontend-admin\package.json`, `D:\CODE\eshop-sut\backend\server.js`, `D:\CODE\eshop-sut\backend\database.js`, `D:\CODE\eshop-sut\api_specification.md` |
| Test type | Manual UI test cases using domain testing and boundary value analysis |
| Executable tests | Not produced. The admin frontend has no existing UI test framework or test script in `package.json`. |

Rationale: the request explicitly says "UI test only". The cases below check only browser-visible behavior: admin login gate, category tab navigation, list rendering, add form validation, delete action, visible feedback, and UI protection from non-admin/invalid sessions. API status codes and database assertions are not used as direct test oracles.

## 2. Feature Contract Summary

FR-14 requires an admin to manage categories in the Web Admin system. The README says:

- Admin can add categories.
- Admin can view categories.
- Admin can delete categories.
- Category name is required and must not be empty.

The feature is labeled "Category CRUD", but the detailed FR-14 bullets mention only add/view/delete. The current admin UI also exposes only add, view, and delete for categories; there is no edit/update control. This report treats edit as an open requirement question rather than silently adding update tests.

Review checkpoint: expected behavior follows the README requirement and general admin access-control expectations from FR-12. Current implementation risks are listed separately in section 8.

## 3. Input and Output Variables

| ID | Variable | Direction | Type/Shape | Constraints | Source |
| --- | --- | --- | --- | --- | --- |
| IN1 | Admin app entry point | Input | Browser navigation | Web Admin available at default `http://localhost:5174` | README |
| IN2 | Authentication/session state | Input | No token, valid admin token, valid non-admin token, expired/invalid token | Only admins should reach category management | FR-12, UI/code |
| IN3 | Admin login credentials | Input | Email/password fields | Admin credentials should grant admin UI access; invalid/non-admin credentials should not | README, UI/code |
| IN4 | Active admin tab | Input | Sidebar selection | Category tab must open category-management view | UI/code |
| IN5 | Category list data | Input/Output | Array of category rows | Existing categories should be visible with ID and name | FR-14 |
| IN6 | Category count | Input/Output | 0, 1, many categories | Empty, single-row, and multi-row states must render correctly | Domain testing |
| IN7 | Category ID | Input/Output | Positive integer | Displayed for each row and used by delete action | UI/code |
| IN8 | Category name input | Input | Text field | Required; must not be empty | FR-14 |
| IN9 | Category name display | Output | Text cell | Category name is shown safely and readably | FR-14, SEC-04 |
| IN10 | Add action | Input | Submit button / Enter key | Adds only valid category names | UI/spec |
| IN11 | Delete action | Input | Delete button | Removes selected category only after intentional admin action | FR-14 |
| IN12 | Data loading result | Input | Success, empty, failure | UI should distinguish data-load failure from an empty list | UI quality |
| OUT1 | Admin login gate | Output | Login form / blocked state | Non-admin or unauthenticated users cannot manage categories | FR-12 |
| OUT2 | Category management view | Output | Visible heading/tab/table/form | Admin can find category controls | FR-14 |
| OUT3 | Category table | Output | Rows and columns | Shows ID, category name, and actions | FR-14 |
| OUT4 | Validation message | Output | Visible error / browser validation | Empty or blank category names are rejected before/without creating a row | FR-14 |
| OUT5 | Add success outcome | Output | Updated list and cleared input | New valid category appears exactly once | FR-14 |
| OUT6 | Delete success outcome | Output | Updated list | Deleted category disappears; unrelated categories remain | FR-14 |
| OUT7 | Error state | Output | Visible message | Add/list/delete failures are visible to admin | UI quality |
| OUT8 | Safe rendering | Output | Text rendering | Category names are escaped, not rendered as HTML/script | SEC-04 |

## 4. Equivalence Classes

| EC ID | Variable | Class | Validity | Rationale |
| --- | --- | --- | --- | --- |
| EC-IN1-ADMIN-URL | Entry point | User opens Web Admin URL | Valid | Main access path |
| EC-IN2-NO-TOKEN | Session | No `adminToken` in browser storage | Invalid for management | Should show login form |
| EC-IN2-ADMIN | Session | Valid admin token | Valid | Required role |
| EC-IN2-NONADMIN | Session | Valid token for normal user | Invalid | FR-12 admin-only access |
| EC-IN2-EXPIRED | Session | Expired/invalid token | Invalid | Must not expose management UI |
| EC-IN3-ADMIN-CREDS | Login credentials | `admin@eshop.com` / `Admin123!` | Valid | Default admin account |
| EC-IN3-BAD-CREDS | Login credentials | Wrong email/password | Invalid | Login failure |
| EC-IN3-USER-CREDS | Login credentials | `test@eshop.com` / `Test1234!` | Invalid for admin | Valid user but not admin |
| EC-IN4-CATEGORY-TAB | Active tab | Sidebar "Danh muc" category tab selected | Valid | Opens target feature |
| EC-IN4-OTHER-TAB | Active tab | Dashboard/products/orders/users selected | Valid app state, not target | Category controls should not appear in unrelated views |
| EC-IN5-SEED-CATEGORIES | Category list | Seed categories exist | Valid | Normal initial data |
| EC-IN5-EMPTY-LIST | Category list | No categories exist | Valid | Empty list state |
| EC-IN5-LOAD-ERROR | Category list | Category fetch fails | Invalid/Needs review | UI should show error |
| EC-IN6-ZERO | Category count | 0 categories | Valid | Lower boundary |
| EC-IN6-ONE | Category count | Exactly 1 category | Valid | Minimal populated table |
| EC-IN6-MANY | Category count | 2 or more categories | Valid | Normal list |
| EC-IN7-ID-POSITIVE | Category ID | Positive integer id | Valid | Normal generated id |
| EC-IN7-ID-MISSING | Category ID | Missing/null id | Invalid/Needs review | UI should not show blank/misleading id |
| EC-IN8-NAME-NORMAL | Category name input | Non-empty readable text, e.g. `Do gia dung` | Valid | Main add path |
| EC-IN8-NAME-VIETNAMESE | Category name input | Vietnamese text with accents, e.g. `Đồ gia dụng` | Valid | Local-language domain |
| EC-IN8-NAME-ONE-CHAR | Category name input | One visible character | Valid boundary | No minimum length beyond non-empty is specified |
| EC-IN8-NAME-LONG | Category name input | Very long name | Needs review | No max length specified; UI should remain usable |
| EC-IN8-NAME-EMPTY | Category name input | Empty string | Invalid | Required |
| EC-IN8-NAME-SPACES | Category name input | Spaces only | Invalid | Blank-equivalent input |
| EC-IN8-NAME-TRIM | Category name input | Leading/trailing spaces around valid name | Valid/Needs review | Should trim or display cleanly |
| EC-IN8-NAME-DUPLICATE | Category name input | Same name as an existing category | Needs review | Spec does not say unique, but duplicates may confuse users |
| EC-IN8-NAME-HTML | Category name input | HTML/script payload, e.g. `<img src=x onerror=alert(1)>` | Valid input text but unsafe if rendered as HTML | Rendering must escape it |
| EC-IN8-NAME-SPECIAL | Category name input | Symbols inside name, e.g. `Kids & Baby` | Valid/Needs review | Spec does not forbid symbols |
| EC-IN10-CLICK | Add action | Click "Them moi" submit button | Valid | Primary mouse action |
| EC-IN10-ENTER | Add action | Press Enter from name input | Valid | Standard form behavior |
| EC-IN11-DELETE-EXISTING | Delete action | Delete existing category | Valid | Required operation |
| EC-IN11-DELETE-NONEXISTING | Delete action | Delete row that no longer exists/stale UI | Invalid/Needs review | UI should show failure clearly |
| EC-IN11-CANCEL-DELETE | Delete action | User declines delete confirmation | Valid/Needs review | Destructive UI should allow cancellation |
| EC-IN12-ADD-ERROR | Data result | Add request fails after submit | Invalid/Needs review | Admin should see visible error |
| EC-IN12-DELETE-ERROR | Data result | Delete request fails | Invalid/Needs review | Admin should see visible error |
| EC-OUT1-LOGIN-FORM | Auth output | Login form is visible | Valid output | Blocks unauthenticated access |
| EC-OUT1-BLOCKED | Auth output | Non-admin is rejected | Valid output | Blocks normal user |
| EC-OUT2-CATEGORY-VIEW | Category view | Heading, input, add button, table are visible | Valid output | Feature discoverability |
| EC-OUT3-TABLE-COLUMNS | Table | ID, category name, action columns visible | Valid output | Required view |
| EC-OUT3-ROWS | Table | One row per category | Valid output | List correctness |
| EC-OUT4-VALIDATION | Validation | Clear error or browser validation before add | Valid output | Required-name rule |
| EC-OUT5-ADDED | Add result | New category appears and input clears | Valid output | Add success |
| EC-OUT6-DELETED | Delete result | Deleted category disappears only | Valid output | Delete success |
| EC-OUT7-ERROR | Error output | Failure message visible | Valid output | Avoid silent failure |
| EC-OUT8-ESCAPED | Safe rendering | Category name rendered as text, not markup | Valid output | Security rendering |

## 5. Minimum Domain Test Set

| TC ID | Surface | Covered ECs | Preconditions | Inputs / Actions | Expected UI Output | Notes / Result |
| --- | --- | --- | --- | --- | --- | --- |
| DT-FR14-001 | UI | EC-IN1-ADMIN-URL, EC-IN2-NO-TOKEN, EC-OUT1-LOGIN-FORM | Browser has no `adminToken` | Open Web Admin URL | Admin login form is visible; category controls are not visible | Auth gate |
| DT-FR14-002 | UI | EC-IN3-ADMIN-CREDS, EC-IN2-ADMIN | No admin session | Log in with `admin@eshop.com` / `Admin123!` | Admin dashboard opens and sidebar is visible | Valid admin login |
| DT-FR14-003 | UI | EC-IN3-BAD-CREDS, EC-OUT1-LOGIN-FORM | No admin session | Enter wrong password and submit | Login remains blocked; visible login-failure feedback appears; category controls are not visible | Invalid credentials |
| DT-FR14-004 | UI/API | EC-IN3-USER-CREDS, EC-IN2-NONADMIN, EC-OUT1-BLOCKED | No admin session or normal user token exists | Log in with normal user `test@eshop.com` / `Test1234!`, then attempt direct category mutation with that token | UI rejects user as non-admin and does not show admin controls; backend category mutations also reject non-admin token | FAIL. UI blocks normal-user login, but backend category endpoints only check token, not role. |
| DT-FR14-005 | UI | EC-IN2-EXPIRED, EC-OUT1-LOGIN-FORM | Browser has invalid/expired `adminToken` | Open Web Admin URL | App clears/blocks the session and returns to login; category data is not visible | Stale token |
| DT-FR14-006 | UI | EC-IN4-CATEGORY-TAB, EC-OUT2-CATEGORY-VIEW | Admin is logged in | Click sidebar "Danh muc" | Category heading, name input, add button, and category table are visible | Navigation |
| DT-FR14-007 | UI | EC-IN4-OTHER-TAB | Admin is logged in | Click Dashboard or Products tab | Category add/delete controls are not visible in unrelated tab | Tab partition |
| DT-FR14-008 | UI | EC-IN5-SEED-CATEGORIES, EC-IN6-MANY, EC-IN7-ID-POSITIVE, EC-OUT3-TABLE-COLUMNS, EC-OUT3-ROWS | Admin logged in; seed categories exist | Open category tab | Table shows ID, category name, and action columns; seed categories appear as rows | View categories |
| DT-FR14-009 | UI | EC-IN5-EMPTY-LIST, EC-IN6-ZERO | Admin logged in; test data has zero categories | Open category tab | UI shows a clear empty category state or an empty table that is not confused with loading failure | Empty state |
| DT-FR14-010 | UI | EC-IN6-ONE, EC-OUT3-ROWS | Admin logged in; exactly one category exists | Open category tab | Exactly one category row is visible and readable | Single-row state |
| DT-FR14-011 | UI | EC-IN5-LOAD-ERROR, EC-OUT7-ERROR | Admin logged in; category fetch fails | Open category tab | A visible category-load error is shown; UI does not silently show stale or empty data | Load failure |
| DT-FR14-012 | UI | EC-IN8-NAME-NORMAL, EC-IN10-CLICK, EC-OUT5-ADDED | Admin logged in; category `Do gia dung` does not exist | Enter `Do gia dung`, click add | Category appears exactly once in table; input clears | Valid add |
| DT-FR14-013 | UI | EC-IN8-NAME-VIETNAMESE, EC-IN10-CLICK, EC-OUT5-ADDED | Admin logged in | Enter `Đồ gia dụng`, click add | Vietnamese name is added and displayed correctly | Local text |
| DT-FR14-014 | UI | EC-IN10-ENTER, EC-IN8-NAME-NORMAL, EC-OUT5-ADDED | Admin logged in | Enter `Sach`, press Enter | Category is added as if button was clicked | Keyboard form submit |
| DT-FR14-015 | UI/API-observable | EC-IN8-NAME-EMPTY, EC-OUT4-VALIDATION | Admin logged in | Leave name empty and submit | Empty name is rejected; no blank row appears | FAIL. UI has no required validation and backend inserts submitted name. |
| DT-FR14-016 | UI/API-observable | EC-IN8-NAME-SPACES, EC-OUT4-VALIDATION | Admin logged in | Enter spaces only and submit | Blank-equivalent name is rejected; no blank row appears | FAIL. UI/backend do not trim or reject spaces. |
| DT-FR14-017 | UI | EC-IN8-NAME-TRIM | Admin logged in | Enter `  Phu kien moi  ` and submit | Category is added as clean `Phu kien moi` or UI clearly preserves spaces by design | Needs review |
| DT-FR14-018 | UI | EC-IN8-NAME-DUPLICATE | Admin logged in; `Laptop` exists | Add `Laptop` again | UI either rejects duplicate with a clear message or adds it consistently if duplicates are allowed | Requirement unclear |
| DT-FR14-019 | UI | EC-IN8-NAME-HTML, EC-OUT8-ESCAPED | Admin logged in | Add `<img src=x onerror=alert(1)>` | Category cell displays the text literally; no HTML executes | Safe rendering |
| DT-FR14-020 | UI | EC-IN8-NAME-SPECIAL, EC-OUT5-ADDED | Admin logged in | Add `Kids & Baby` | Category is added and displayed safely | Symbol handling |
| DT-FR14-021 | UI | EC-IN8-NAME-LONG | Admin logged in | Add a 256-character category name | UI remains usable and either accepts or rejects with clear feedback | Max length unspecified |
| DT-FR14-022 | UI | EC-IN11-DELETE-EXISTING, EC-OUT6-DELETED | Admin logged in; a disposable category exists | Click delete on that category | Deleted category disappears; other category rows remain unchanged | Delete success |
| DT-FR14-023 | UI | EC-IN11-CANCEL-DELETE | Admin logged in; a category exists | Click delete, then cancel confirmation if offered | If a confirmation dialog is offered, canceling it leaves the category visible; if the product does not require confirmation, this case is marked needs review rather than a README failure | NEEDS REVIEW. SUT has no confirmation dialog and deletes immediately, but README does not explicitly require confirmation. |
| DT-FR14-024 | UI | EC-IN11-DELETE-NONEXISTING, EC-OUT7-ERROR | Admin logged in; stale row or already-deleted category is visible | Click delete on stale row | Visible delete failure appears; UI refreshes safely | Needs special setup |
| DT-FR14-025 | UI | EC-IN12-ADD-ERROR, EC-OUT7-ERROR | Admin logged in; backend/network blocks add | Submit valid category | Visible add failure appears; input data is not silently lost | Add error |
| DT-FR14-026 | UI | EC-IN12-DELETE-ERROR, EC-OUT7-ERROR | Admin logged in; backend/network blocks delete | Click delete | Visible delete failure appears; category row remains visible | Delete error |
| DT-FR14-027 | UI | EC-IN7-ID-MISSING | Admin logged in; malformed category row has missing id | Open category tab | UI does not show a misleading blank action row; safe placeholder or error is visible | Malformed data |
| DT-FR14-028 | UI | EC-IN3-ADMIN-CREDS | Admin login form is visible | Inspect/focus email field | Email field uses `type="email"` | FAIL. Email input has no `type`, so browser default is `text`. |
| DT-FR14-029 | UI | EC-IN3-BAD-CREDS, EC-OUT1-LOGIN-FORM | Admin login form is visible | Submit invalid admin credentials | Error is inline and above the submit button | FAIL. Login failure uses `alert()`, not inline form feedback. |
| DT-FR14-030 | UI | EC-IN8-NAME-EMPTY, EC-OUT4-VALIDATION | Admin is logged in and category tab is open | Inspect category add form | Required category name has a visible label with `*` and required-field semantics | FAIL. Category input has placeholder only, no label, no `*`, and no `required` attribute. |
| DT-FR14-031 | API/security | EC-IN2-NONADMIN | Normal user has a valid JWT | Call `POST /api/categories` or `DELETE /api/categories/:id` directly with user token | Request is rejected because only admin may mutate categories | FAIL. Endpoints use `authenticateToken` only and do not check `role === "admin"`. |
| DT-FR14-032 | UI | EC-IN4-OTHER-TAB | Admin dashboard has delivered orders with known totals | View total revenue on dashboard | Revenue equals the sum of `total_amount` for delivered orders exactly once | FAIL. Dashboard computes `sum + o.total_amount * 2`, doubling delivered revenue. |

## 6. Boundary Value Test Set

| TC ID | Surface | Boundary Target | Preconditions | Inputs / Actions | Expected UI Output | Covered ECs / Result |
| --- | --- | --- | --- | --- | --- | --- |
| BVA-FR14-001 | UI/API-observable | Name length LB-1 | Admin logged in | Submit empty name length 0 | Rejected; no category row created | EC-IN8-NAME-EMPTY; FAIL. Empty name can be submitted because there is no UI/backend validation. |
| BVA-FR14-002 | UI | Name length LB | Admin logged in | Submit `A` length 1 | Accepted or clearly handled as valid because only non-empty is specified | EC-IN8-NAME-ONE-CHAR |
| BVA-FR14-003 | UI | Name length LB+1 | Admin logged in | Submit `AB` length 2 | Accepted and displayed | EC-IN8-NAME-NORMAL |
| BVA-FR14-004 | UI/API-observable | Blank-equivalent length > 0 | Admin logged in | Submit one space | Rejected as empty after trim | EC-IN8-NAME-SPACES; FAIL. One-space name can be submitted because there is no trim validation. |
| BVA-FR14-005 | UI | Leading/trailing whitespace | Admin logged in | Submit ` A ` | Added as clean `A` or handled consistently with documented behavior | EC-IN8-NAME-TRIM |
| BVA-FR14-006 | UI | Long-name stress | Admin logged in | Submit 255-character name | UI remains usable; result is accepted or clear validation appears | EC-IN8-NAME-LONG |
| BVA-FR14-007 | UI | Long-name overflow | Admin logged in | Submit 256-character name | UI remains usable; result is accepted or clear validation appears | EC-IN8-NAME-LONG |
| BVA-FR14-008 | UI | Category count LB | Admin logged in; 0 categories | Open category tab | Empty state/empty table is clear | EC-IN6-ZERO |
| BVA-FR14-009 | UI | Category count LB+1 | Admin logged in; 1 category | Open category tab | Exactly one row shown | EC-IN6-ONE |
| BVA-FR14-010 | UI | Category count LB+2 | Admin logged in; 2 categories | Open category tab | Exactly two rows shown | EC-IN6-MANY |
| BVA-FR14-011 | UI | Category ID invalid low | Malformed fixture with id 0 | Open category tab | `#0` is not presented as a normal valid category id | EC-IN7-ID-MISSING |
| BVA-FR14-012 | UI | Category ID lower valid | Category id 1 exists | Open category tab | Category displays as `#1` or equivalent | EC-IN7-ID-POSITIVE |

Notes:

- FR-14 does not specify a maximum category-name length. The 255/256 cases are UI robustness boundaries, not hard pass/fail business boundaries.
- Some malformed-data cases require seeded or manually edited data. They are included because UI-only category management still needs safe behavior when displayed data is incomplete.

## 7. Suggested Manual Execution Data

| Data Item | Value |
| --- | --- |
| Admin account | `admin@eshop.com` / `Admin123!` |
| Normal user account | `test@eshop.com` / `Test1234!` |
| Seed categories | `Điện thoại`, `Laptop`, `Phụ kiện` |
| Valid ASCII category | `Do gia dung` |
| Valid Vietnamese category | `Đồ gia dụng` |
| One-character category | `A` |
| Spaces-only category | `   ` |
| Trim test category | `  Phu kien moi  ` |
| Duplicate test category | `Laptop` |
| HTML rendering payload | `<img src=x onerror=alert(1)>` |
| Long-name test | 255 and 256 visible characters |
| Disposable delete category | `Temp Delete Category` |

## 8. Current Implementation Risks / Likely Bugs

These are observations from the current SUT files and should be verified during UI execution.

| Bug ID | Observation | Evidence | Related tests |
| --- | --- | --- | --- |
| BUG-FR14-001 | Category name input is not marked `required`, so empty submissions are possible from the UI | `frontend-admin/src/App.jsx` category input lacks `required` and handler posts `categoryName` directly | DT-FR14-015, BVA-FR14-001 |
| BUG-FR14-002 | Spaces-only category names are not trimmed or rejected before submit | `handleCategorySubmit` posts `{ name: categoryName }` without trim validation | DT-FR14-016, BVA-FR14-004 |
| BUG-FR14-003 | Delete has no confirmation dialog despite being destructive | Delete button calls `deleteCategory(c.id)` directly | DT-FR14-023 |
| BUG-FR14-004 | Category load failure is silent; the admin may see an empty/stale table without explanation | `fetchData` only clears token for 401/403 and otherwise does not show category-specific errors | DT-FR14-011 |
| BUG-FR14-005 | Backend category mutation endpoints only check token presence, not admin role | `authenticateToken` verifies token but does not enforce `role = 'admin'` for `/api/categories` mutations | DT-FR14-004 |
| BUG-FR14-006 | FR title says CRUD, but UI and detailed FR-14 text do not provide category edit/update | Category section has add and delete only; no edit form/control | Open question for FR-14 scope |
| BUG-FR14-007 | Admin app login email input does not use `type="email"` and labels are placeholders only | Admin login input lacks `type="email"` | General FR-22/UI risk |

## 9. Assumptions and Open Questions

| ID | Assumption / Question | Impact |
| --- | --- | --- |
| A1 | The README detailed bullets are treated as the FR-14 contract: add, view, delete, and required name. | Edit/update tests are not included as required FR-14 cases. |
| A2 | Because FR-12 protects admin functions, UI tests include non-admin and invalid-session partitions even though FR-14 itself focuses on categories. | Captures access-control risk through the UI surface. |
| A3 | Category names are assumed to allow Vietnamese text and common symbols unless the product team states otherwise. | Tests for accents and `&` are valid representatives. |
| A4 | Duplicate category-name behavior is unspecified. | DT-FR14-018 is marked needs review instead of hard-coding one answer. |
| A5 | No maximum name length is specified. | Long-name BVA checks UI robustness and visible feedback, not a fixed business boundary. |
| A6 | UI-only tests may use seeded data to create empty/malformed/error states, but expected outcomes are based on what the browser displays. | Keeps the suite aligned with the requested surface. |

## 10. Coverage Check

| Coverage Item | Status |
| --- | --- |
| UI-only surface respected | Covered |
| Admin login and role/session partitions | Covered |
| Category tab navigation | Covered |
| View category list | Covered |
| Zero, one, and many category counts | Covered |
| Add valid category names | Covered |
| Reject empty and blank-equivalent names | Covered |
| Vietnamese, special-character, duplicate, and HTML-name classes | Covered |
| Delete existing category | Covered |
| Delete cancellation/error behavior | Covered |
| Data-load and mutation error states | Covered |
| Boundary tests for name length and category count | Covered |
| Executable UI tests | Deferred because no UI test framework exists in the reviewed admin frontend project |
