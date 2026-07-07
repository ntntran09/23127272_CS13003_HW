# HW02-AI Bug Report

## 1. Scope

Bug report này được tổng hợp từ các kết quả domain testing và boundary value analysis trong bốn file:

- `FR-02-mobile-domain-testing.md`: Login and account lockout, mobile UI plus supplemental web login gap.
- `FR-03-domain-testing.md`: Forgot password and password reset.
- `FR-11-domain-testing.md`: User order history.
- `FR-14-domain-testing.md`: Category management in Web Admin.

Các bug bên dưới dựa trên expected result trong FR/README và evidence đã ghi trong từng file FR. Screenshot cần được chụp khi tái hiện bug và đính kèm vào GitHub Issue tương ứng.

## 2. Summary

| Feature | Number of reported bugs | Main risk area |
| --- | ---: | --- |
| FR-02 Login and account lockout | 10 | Account lockout correctness, mobile validation, web/mobile form quality |
| FR-03 Forgot password/reset password | 8 | OTP length, password rule, missing confirmation field, navigation/inline validation |
| FR-11 User order history | 9 | Order status handling, cancellation state, malformed data display, profile validation |
| FR-14 Category management | 9 | Required category validation, admin authorization, error handling, admin UI form quality |
| Requirement gaps / needs review | 2 | Delete confirmation and category edit/update scope |
| Total | 38 |  |

Severity scale:

- Critical: security/privacy breach or state corruption.
- High: core FR cannot work correctly or wrong business rule.
- Medium: user-visible validation, feedback, accessibility, or robustness defect.
- Low: UI consistency or requirement-convention defect.

## 3. Detailed Bugs

### BUG-FR02-001: Failed login counter increments by 2 instead of 1

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | High |
| Related tests | `BVA-FR02-MOB-002..004`, `DT-FR02-MOB-016..018` |
| Evidence | `server.js` uses `const newAttempts = user.login_attempts + 2` |
| Steps to reproduce | 1. Reset `test@eshop.com` failed login count to 0. 2. Submit one wrong password. 3. Submit a second wrong password. |
| Expected result | Each failed login increases the counter by exactly 1; the account is not locked until the 3rd consecutive failure. |
| Actual result | The counter increases by 2 per failure, so the lockout boundary is reached too early. |
| Screenshot | Attach screenshot of the 2nd wrong attempt already showing lockout or blocked behavior. |

### BUG-FR02-002: Lockout duration is 180 seconds instead of 30 seconds

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | High |
| Related tests | `DT-FR02-MOB-020`, `BVA-FR02-MOB-006..009` |
| Evidence | `server.js` uses `Date.now() + 180000` |
| Steps to reproduce | 1. Lock `test@eshop.com` by repeated wrong-password attempts. 2. Wait 30 seconds. 3. Try logging in with the correct password. |
| Expected result | Login should be allowed at or after 30 seconds in the demo environment. |
| Actual result | Account remains locked because implementation uses 180 seconds. |
| Screenshot | Attach screenshot/video showing correct login still rejected after 30 seconds. |

### BUG-FR02-003: Mobile UI hides backend lockout details behind a generic error

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | Medium |
| Related tests | `DT-FR02-MOB-018..020`, `DT-FR02-MOB-027` |
| Evidence | `handleLogin` catch sets `loginError` to the same generic message for all failures |
| Steps to reproduce | 1. Trigger account lockout from the mobile login screen. 2. Try logging in again during the lockout period. |
| Expected result | UI shows an appropriate safe lockout message without revealing sensitive account details. |
| Actual result | UI replaces lockout/network/backend details with a generic login failure. |
| Screenshot | Attach screenshot of lockout attempt showing only generic failure. |

### BUG-FR02-004: Mobile email input does not use an email keyboard

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | Medium |
| Related tests | `DT-FR02-MOB-003` |
| Evidence | Login `TextInput` has `autoCapitalize="none"` but no `keyboardType="email-address"` |
| Steps to reproduce | 1. Open the mobile login screen. 2. Focus the email field. |
| Expected result | Mobile email keyboard appears, with email-friendly input behavior. |
| Actual result | Normal text keyboard appears. |
| Screenshot | Attach screenshot of keyboard/input behavior on device or emulator. |

### BUG-FR02-005: Mobile login has no client-side validation for empty or malformed email/password

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | Medium |
| Related tests | `DT-FR02-MOB-005..011`, `BVA-FR02-MOB-010`, `BVA-FR02-MOB-012` |
| Evidence | `handleLogin` posts current `email` and `password` directly |
| Steps to reproduce | 1. Open mobile login. 2. Submit empty email, invalid email such as `test-at-eshop`, or empty password. |
| Expected result | Required/email-format/password validation is shown before or during submit; user remains unauthenticated. |
| Actual result | Input is submitted and only a generic error is shown. |
| Screenshot | Attach screenshot of invalid form submission and generic error. |

### BUG-FR02-006: Mobile token is not persisted across app restart

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | Medium |
| Related tests | `DT-FR02-MOB-025` |
| Evidence | `token` state is initialized as empty string; no AsyncStorage/SecureStore usage |
| Steps to reproduce | 1. Log in successfully on mobile. 2. Close and reopen the app. 3. Navigate to an authenticated feature. |
| Expected result | Client token is stored and authenticated features remain available, or the product clearly documents forced re-login. |
| Actual result | Token is held only in React state, so restart loses authentication. |
| Screenshot | Attach screenshot before restart and after restart showing lost session. |

### BUG-FR02-007: Mobile login labels are inconsistent with the Vietnamese UI requirement

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | Low |
| Related tests | `DT-FR02-MOB-001`, `DT-FR02-MOB-029` |
| Evidence | UI shows `Username` and `Sign In` on the Vietnamese login screen |
| Steps to reproduce | Open the mobile login screen. |
| Expected result | Login label and submit text are Vietnamese or consistently localized. |
| Actual result | English labels are mixed into the Vietnamese UI. |
| Screenshot | Attach screenshot of the login screen. |

### BUG-FR02-008: Mobile login error appears below the submit/register area

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | Low |
| Related tests | `DT-FR02-MOB-015..020`, `DT-FR02-MOB-028` |
| Evidence | `loginError` is rendered after the register link and sign-in button |
| Steps to reproduce | Submit invalid mobile login credentials. |
| Expected result | Error is shown inline above the submit button. |
| Actual result | Error appears below the submit/register area. |
| Screenshot | Attach screenshot of error placement. |

### BUG-FR02-009: Mobile API base URL is hard-coded to one LAN IP

| Field | Detail |
| --- | --- |
| Feature | FR-02 Login and account lockout |
| Severity | Medium |
| Related tests | `DT-FR02-MOB-027` |
| Evidence | `API_URL = "http://192.168.10.13:3000/api"` in `frontend-mobile/App.js` |
| Steps to reproduce | 1. Run the mobile app on another network/device where `192.168.10.13` is not the backend. 2. Try valid login. |
| Expected result | App can be configured for the current backend or clearly reports connectivity failure. |
| Actual result | Valid credentials can fail because the app points to a fixed private IP. |
| Screenshot | Attach screenshot of login failure on a different network. |

### BUG-FR02-010: Web login form uses wrong heading, labels, input types, and error placement

| Field | Detail |
| --- | --- |
| Feature | FR-02 supplemental web login gap |
| Severity | High |
| Related tests | `DT-FR02-WEB-001`, `DT-FR02-WEB-002`, `DT-FR03-028` |
| Evidence | `Login.jsx` uses register heading, `Username`, `Sign In`, email `type="text"`, password `type="text"`, and error after the form |
| Steps to reproduce | 1. Open `/login` in web frontend. 2. Inspect heading, email/password fields, and submit invalid credentials. |
| Expected result | Login page has correct login heading, email input, masked password input, localized submit text, and inline error above submit. |
| Actual result | Page appears partly as a registration/login mismatch; password is visible as plain text and error is placed after the form. |
| Screenshot | Attach screenshot of the web login form and failed-login error. |

### BUG-FR03-001: Forgot-password page has no visible step indicator

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | Medium |
| Related tests | `DT-FR03-001`, `DT-FR03-003` |
| Evidence | `ForgotPassword.jsx` uses internal `step` state but renders no `Step 1 / 2` or `Step 2 / 2` text |
| Steps to reproduce | 1. Open `/forgot-password`. 2. Submit a registered email to move to step 2. |
| Expected result | UI clearly shows `Step 1 / 2` then `Step 2 / 2`. |
| Actual result | No visible step indicator is rendered. |
| Screenshot | Attach screenshots of step 1 and step 2. |

### BUG-FR03-002: Forgot-password email input is `type="text"` instead of `type="email"`

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | Medium |
| Related tests | `DT-FR03-006` |
| Evidence | `ForgotPassword.jsx` email field is text input |
| Steps to reproduce | Open `/forgot-password` and inspect the email field. |
| Expected result | Email field uses browser email input behavior and validation. |
| Actual result | Email field is a plain text input. |
| Screenshot | Attach screenshot or devtools evidence of input type. |

### BUG-FR03-003: Back-to-login action is missing or incorrect

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | Medium |
| Related tests | `DT-FR03-001`, `DT-FR03-023`, `DT-FR03-024` |
| Evidence | `ForgotPassword.jsx` has only a Step 2 `Back` button that returns to Step 1 |
| Steps to reproduce | 1. Open `/forgot-password`. 2. Look for a back-to-login action on step 1. 3. Move to step 2 and click Back. |
| Expected result | A `Back to login` action is available and navigates to `/login`. |
| Actual result | Step 1 has no back-to-login action; Step 2 back only returns to Step 1. |
| Screenshot | Attach screenshots of missing/incorrect navigation. |

### BUG-FR03-004: OTP is 4 digits instead of the required 6 digits

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | High |
| Related tests | `DT-FR03-003`, `DT-FR03-029`, `BVA-FR03-001..003` |
| Evidence | `server.js` uses `Math.floor(1000 + Math.random() * 9000)`; UI label says `OTP (4 digits)` |
| Steps to reproduce | 1. Request OTP for `test@eshop.com`. 2. Inspect the OTP shown in the UI. |
| Expected result | Demo UI displays exactly one 6-digit numeric OTP. |
| Actual result | UI/backend use a 4-digit OTP. |
| Screenshot | Attach screenshot of displayed OTP label/value. |

### BUG-FR03-005: Step 2 has no confirm new password field

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | High |
| Related tests | `DT-FR03-009`, `DT-FR03-021`, `DT-FR03-022`, `BVA-FR03-012`, `BVA-FR03-013` |
| Evidence | `ForgotPassword.jsx` renders only `newPassword` |
| Steps to reproduce | 1. Request a valid OTP. 2. Inspect Step 2 reset form. |
| Expected result | Step 2 asks for OTP, new password, and confirmation password. |
| Actual result | Confirmation password field is missing. |
| Screenshot | Attach screenshot of Step 2 form. |

### BUG-FR03-006: Client password validation does not match the strong-password rule

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | High |
| Related tests | `DT-FR03-009`, `DT-FR03-015..020`, `DT-FR03-026`, `DT-FR03-027`, `BVA-FR03-007`, `BVA-FR03-008` |
| Evidence | Regex requires whitespace and allows only letters/digits/spaces while message says special character |
| Steps to reproduce | 1. Open reset password step. 2. Try valid password `NewPass1!`. 3. Try invalid password `NewPass 1`. |
| Expected result | `NewPass1!` should pass; passwords without allowed special character should fail. |
| Actual result | Allowed special characters such as `!` are rejected, while whitespace may satisfy the regex. |
| Screenshot | Attach screenshot of rejected valid password and/or accepted invalid password. |

### BUG-FR03-007: Forgot-password errors use browser alerts instead of inline messages

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | Medium |
| Related tests | `DT-FR03-005..022` |
| Evidence | `ForgotPassword.jsx` calls `alert(...)` for request/reset failures and weak password |
| Steps to reproduce | Submit unregistered email, wrong OTP, or weak password. |
| Expected result | Error appears inline near the form and above the submit button. |
| Actual result | Error is displayed through browser alert. |
| Screenshot | Attach screenshot of alert. |

### BUG-FR03-008: Forgot-password page uses `<h2>` instead of the required single `<h1>` page title

| Field | Detail |
| --- | --- |
| Feature | FR-03 Forgot password and password reset |
| Severity | Low |
| Related tests | `DT-FR03-001` |
| Evidence | `ForgotPassword.jsx` renders `<h2>` |
| Steps to reproduce | Open `/forgot-password` and inspect heading structure. |
| Expected result | Page has one main `<h1>` title. |
| Actual result | Page uses `<h2>` as the main title. |
| Screenshot | Attach screenshot or devtools evidence. |

### BUG-FR11-001: Order fetch failure is rendered like empty order history

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history |
| Severity | Medium |
| Related tests | `DT-FR11-025` |
| Evidence | `Profile.jsx` catches fetch errors, logs to console, and calls `setOrders([])` |
| Steps to reproduce | 1. Log in as a normal user. 2. Block or break the order-history endpoint. 3. Open `/profile`. |
| Expected result | UI shows a visible load-error message. |
| Actual result | UI can look like the user simply has no orders. |
| Screenshot | Attach screenshot of profile page during endpoint failure. |

### BUG-FR11-002: Unsupported order status is shown as raw uppercase text

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history |
| Severity | Medium |
| Related tests | `DT-FR11-015`, `BVA-FR11-015` |
| Evidence | `statusLabel(status)` returns `status.toUpperCase()` for unknown values |
| Steps to reproduce | Seed an order with unsupported status such as `returned`, then open order history. |
| Expected result | UI shows a safe Vietnamese fallback such as `Trang thai khong xac dinh`. |
| Actual result | UI shows raw status code such as `RETURNED`. |
| Screenshot | Attach screenshot of unsupported status row. |

### BUG-FR11-003: Missing order status can crash the profile/order-history page

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history |
| Severity | High |
| Related tests | `DT-FR11-016` |
| Evidence | `statusLabel(null)` can reach `status.toUpperCase()` |
| Steps to reproduce | Seed an order with `status = null`, then open `/profile`. |
| Expected result | UI shows a safe fallback and does not crash. |
| Actual result | Page can crash because `toUpperCase()` is called on null. |
| Screenshot | Attach screenshot of crash/error state. |

### BUG-FR11-004: Missing or invalid order date can render as `Invalid Date`

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history |
| Severity | Medium |
| Related tests | `DT-FR11-023`, `DT-FR11-024`, `BVA-FR11-012` |
| Evidence | `new Date(o.created_at).toLocaleDateString()` has no guard |
| Steps to reproduce | Seed an order with missing date or `created_at = not-a-date`, then open order history. |
| Expected result | UI shows a safe placeholder. |
| Actual result | UI can show `Invalid Date`. |
| Screenshot | Attach screenshot of invalid date display. |

### BUG-FR11-005: Missing total amount is silently displayed as `0`

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history |
| Severity | Medium |
| Related tests | `DT-FR11-021` |
| Evidence | `Number(o.total_amount || 0).toLocaleString()` converts null/undefined to 0 |
| Steps to reproduce | Seed an order with missing/null `total_amount`, then open order history. |
| Expected result | UI shows a safe placeholder or flags invalid data. |
| Actual result | UI displays `0` VND, making missing data look valid. |
| Screenshot | Attach screenshot of misleading total. |

### BUG-FR11-006: Profile/order-history page has no single `<h1>` page title

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history |
| Severity | Low |
| Related tests | `DT-FR11-003`, `DT-FR11-029` |
| Evidence | `Profile.jsx` renders `<h2>` headings and no `<h1>` |
| Steps to reproduce | Open `/profile` as a logged-in user and inspect the headings. |
| Expected result | Page has exactly one `<h1>` representing the page title. |
| Actual result | Page uses `<h2>` headings without a main `<h1>`. |
| Screenshot | Attach screenshot or devtools evidence. |

### BUG-FR11-007: Web UI shows cancel button for `shipping` orders

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history / FR-10 order state rule |
| Severity | High |
| Related tests | `DT-FR11-011`, `DT-FR11-027` |
| Evidence | `Profile.jsx` shows cancel button for every status except `delivered` and `canceled` |
| Steps to reproduce | 1. Seed a user order with `status = "shipping"`. 2. Log in and open `/profile`. |
| Expected result | Shipping order shows status only; no cancel button is visible. |
| Actual result | Cancel button is visible for a shipping order. |
| Screenshot | Attach screenshot of shipping order row with cancel button. |

### BUG-FR11-008: Backend allows `shipping` orders to be canceled

| Field | Detail |
| --- | --- |
| Feature | FR-11 User order history / FR-10 order state rule |
| Severity | Critical |
| Related tests | `DT-FR11-028` |
| Evidence | Backend only blocks `delivered` and `canceled`, so `shipping` can be updated to `canceled` |
| Steps to reproduce | 1. Log in as a user with a shipping order. 2. Trigger cancel action or call the cancel endpoint. |
| Expected result | Cancellation is rejected and order remains `shipping`. |
| Actual result | Shipping order is updated to `canceled`. |
| Screenshot | Attach screenshot before and after cancellation. |

### BUG-FR11-009: Profile phone validation rejects a valid Vietnamese phone and accepts an invalid one

| Field | Detail |
| --- | --- |
| Feature | FR-11 related profile page validation |
| Severity | Medium |
| Related tests | `DT-FR11-030`, `DT-FR11-031` |
| Evidence | Regex requires first digit `1-9`, not Vietnamese leading `0`; invalid `123456789` is accepted |
| Steps to reproduce | 1. Open `/profile`. 2. Try saving phone `0912345678`. 3. Try saving phone `123456789`. |
| Expected result | `0912345678` is accepted; `123456789` is rejected. |
| Actual result | Valid Vietnamese phone is rejected and invalid 9-digit phone is accepted. |
| Screenshot | Attach screenshots of both validation outcomes. |

### BUG-FR14-001: Empty category name can be submitted

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management |
| Severity | High |
| Related tests | `DT-FR14-015`, `BVA-FR14-001` |
| Evidence | Category input lacks `required`; handler posts `categoryName` directly |
| Steps to reproduce | 1. Log in to Web Admin as admin. 2. Open category tab. 3. Leave category name empty and submit. |
| Expected result | Empty name is rejected and no blank category row is created. |
| Actual result | Empty submission is possible from UI/backend path. |
| Screenshot | Attach screenshot of empty submission or blank row. |

### BUG-FR14-002: Spaces-only category names are accepted

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management |
| Severity | High |
| Related tests | `DT-FR14-016`, `BVA-FR14-004` |
| Evidence | `handleCategorySubmit` posts `{ name: categoryName }` without trim validation |
| Steps to reproduce | Submit category name containing only spaces. |
| Expected result | Blank-equivalent name is rejected after trimming. |
| Actual result | Spaces-only category can be created. |
| Screenshot | Attach screenshot of blank-looking category row. |

### BUG-FR14-003: Category load failure is silent

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management |
| Severity | Medium |
| Related tests | `DT-FR14-011` |
| Evidence | `fetchData` clears token only for 401/403 and otherwise does not show category-specific errors |
| Steps to reproduce | 1. Log in as admin. 2. Break the category endpoint/network. 3. Open category tab. |
| Expected result | A visible category-load error is shown. |
| Actual result | Admin may see empty or stale data without explanation. |
| Screenshot | Attach screenshot during fetch failure. |

### BUG-FR14-004: Category mutation endpoints do not enforce admin role

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management / FR-12 access control |
| Severity | Critical |
| Related tests | `DT-FR14-004`, `DT-FR14-031` |
| Evidence | Category endpoints use `authenticateToken` but do not check `role === "admin"` |
| Steps to reproduce | 1. Log in as normal user and obtain JWT. 2. Call `POST /api/categories` or `DELETE /api/categories/:id` with that token. |
| Expected result | Request is rejected because only admin can mutate categories. |
| Actual result | Normal authenticated user can mutate categories through API. |
| Screenshot | Attach screenshot of API request/response or UI/API evidence. |

### BUG-FR14-005: Admin login email input is not `type="email"`

| Field | Detail |
| --- | --- |
| Feature | FR-14 Web Admin login |
| Severity | Medium |
| Related tests | `DT-FR14-028` |
| Evidence | Admin login input lacks `type="email"` |
| Steps to reproduce | Open Web Admin login page and inspect/focus the email field. |
| Expected result | Email field uses email input behavior. |
| Actual result | Browser treats it as plain text. |
| Screenshot | Attach screenshot or devtools evidence. |

### BUG-FR14-006: Admin invalid-login feedback uses alert instead of inline error

| Field | Detail |
| --- | --- |
| Feature | FR-14 Web Admin login |
| Severity | Medium |
| Related tests | `DT-FR14-029` |
| Evidence | Login failure uses `alert()` |
| Steps to reproduce | Submit invalid admin credentials. |
| Expected result | Error appears inline and above the submit button. |
| Actual result | Browser alert is shown. |
| Screenshot | Attach screenshot of alert. |

### BUG-FR14-007: Category add form lacks required-field semantics and visible label

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management |
| Severity | Medium |
| Related tests | `DT-FR14-030` |
| Evidence | Category input has placeholder only, no label, no `*`, and no `required` attribute |
| Steps to reproduce | Open category tab and inspect category add form. |
| Expected result | Required category name field has visible label, required indicator, and required-field semantics. |
| Actual result | Field uses placeholder only and has no required semantics. |
| Screenshot | Attach screenshot of category add form. |

### BUG-FR14-008: Dashboard revenue is doubled

| Field | Detail |
| --- | --- |
| Feature | FR-14 related admin dashboard result |
| Severity | High |
| Related tests | `DT-FR14-032` |
| Evidence | Dashboard computes `sum + o.total_amount * 2` |
| Steps to reproduce | 1. Seed delivered orders with known total amounts. 2. Open admin dashboard. 3. Compare displayed revenue with expected sum. |
| Expected result | Revenue equals the sum of delivered order totals exactly once. |
| Actual result | Revenue is doubled. |
| Screenshot | Attach screenshot of dashboard revenue and source/test data. |

### BUG-FR14-009: Add/delete mutation failures do not provide clear visible feedback

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management |
| Severity | Medium |
| Related tests | `DT-FR14-024`, `DT-FR14-025`, `DT-FR14-026` |
| Evidence | FR results identify add/delete/network failure cases where visible error handling is absent or unclear |
| Steps to reproduce | 1. Log in as admin. 2. Force add/delete endpoint failure. 3. Submit add or click delete. |
| Expected result | Visible add/delete failure appears and UI remains consistent. |
| Actual result | Failure can be silent or unclear to admin. |
| Screenshot | Attach screenshot after failed add/delete action. |

## 4. Requirement Gaps / Needs Review

These items should be discussed with the product owner/lecturer before reporting as hard bugs.

### GAP-FR14-001: Delete has no confirmation dialog

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management |
| Severity | Low / Needs review |
| Related tests | `DT-FR14-023` |
| Evidence | Delete button calls `deleteCategory(c.id)` directly |
| Reason for review | Deleting a category is destructive, but README does not explicitly require confirmation. |
| Suggested decision | If the product requires destructive-action confirmation, report this as a bug; otherwise keep it as a usability improvement. |

### GAP-FR14-002: FR title says CRUD but UI has no edit/update category function

| Field | Detail |
| --- | --- |
| Feature | FR-14 Category management |
| Severity | Medium / Needs review |
| Related tests | `BUG-FR14-006` in FR report section 8 |
| Evidence | Category section exposes add, view, and delete only; no edit form/control |
| Reason for review | The FR title says Category CRUD, but the detailed bullets mention only add/view/delete. |
| Suggested decision | If CRUD is interpreted literally, add missing update/edit tests and report no edit control as a bug. If detailed bullets are authoritative, keep this as an open scope question. |
