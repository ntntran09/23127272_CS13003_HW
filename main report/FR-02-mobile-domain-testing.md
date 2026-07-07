# FR-02 Mobile Domain Testing Report - Login and Account Lockout

## 1. Selected Testing Surface

| Item | Decision |
| --- | --- |
| Feature | FR-02: Dang nhap va Khoa tai khoan / Login and account lockout |
| SUT area | EShop Mobile App, React Native + Expo |
| Surface | UI only: mobile login/account-lockout plus supplemental web-login coverage gap |
| Main source files reviewed | `D:\CODE\eshop-sut\README.md`, `D:\CODE\eshop-sut\frontend-mobile\App.js`, `D:\CODE\eshop-sut\frontend-mobile\package.json`, `D:\CODE\eshop-sut\backend\server.js`, `D:\CODE\eshop-sut\api_specification.md` |
| Test type | Manual mobile UI test cases using domain testing and boundary value analysis |
| Executable tests | Not produced. The mobile project has no configured test script or mobile UI automation framework in `package.json`. |

Rationale: the original FR-02 set is mobile UI-focused, so most cases check only visible/mobile-observable behavior: login screen access, email and password controls, validation feedback, lockout messages, successful authenticated state, logout, and whether later authenticated screens behave as if a token is available. The missed-case analysis also identified uncovered web `Login.jsx` FR-02/FR-22 behavior, so two supplemental web UI cases are included in the same test set. API status codes, database counters, and direct token inspection are not used as direct assertions except where a UI-observable lockout boundary is traced through current implementation behavior.

## 2. Feature Contract Summary

FR-02 requires the user to enter email and password. A successful login returns a JWT token, the client stores it, and authenticated requests include `Authorization: Bearer <token>`. After every failed login attempt, the system increments the failed-attempt counter by exactly 1. After 3 or more consecutive failed attempts, the account is temporarily locked for 30 seconds in the demo environment. During lockout, the system returns an appropriate error message without revealing sensitive cause details. The email control must behave like an email input, and the password control must hide the password.

For mobile UI testing, the login contract is interpreted through visible app behavior:

- guest can open the login screen from the mobile header/account action;
- email field should use email-friendly mobile input behavior and reject invalid/empty email;
- password field should mask text and reject empty password;
- valid credentials should move the user into an authenticated app state;
- repeated wrong-password attempts should result in visible lockout behavior at the 3rd failed attempt;
- the user should remain blocked before 30 seconds and be able to try again after 30 seconds;
- after login, authenticated mobile features should work without asking the user to log in again.

Review checkpoint: expected behavior is based on FR-02 and mobile UI expectations. Current implementation risks are listed in section 8.

## 3. Input and Output Variables

| ID | Variable | Direction | Type/Shape | Constraints | Source |
| --- | --- | --- | --- | --- | --- |
| IN1 | Login entry point | Input | Mobile navigation action | Guest reaches login by tapping account/login action | Mobile UI/code |
| IN2 | App authentication state | Input | Guest, authenticated, logged out, app restarted | Guest sees login; authenticated user sees account greeting/features | FR-02, mobile UI |
| IN3 | Email field | Input | TextInput | Required; valid email format; should use email-friendly keyboard/no auto-capitalization | FR-02, mobile UI |
| IN4 | Password field | Input | TextInput | Required; hidden by secure entry; exact value submitted | FR-02, FR-22 |
| IN5 | Submit action | Input | Tap login submit button / keyboard submit | Sends login attempt only for acceptable input | Mobile UI |
| IN6 | Account existence | Input | Registered user, unregistered email | Invalid account should not reveal whether email exists | FR-02 |
| IN7 | Credential correctness | Input | Correct password, wrong password | Drives success/failure and lockout attempts | FR-02 |
| IN8 | Failed-attempt count | Input/Output | 0, 1, 2, 3, more than 3 consecutive failures | Lockout begins at 3 failures | FR-02 |
| IN9 | Lockout time | Input | Before 30 seconds, at/after 30 seconds | Lockout lasts 30 seconds in demo | FR-02 |
| IN10 | Network/backend availability | Input | Available, unavailable/timeout | UI should distinguish connectivity failure from invalid credentials when possible | Mobile UI quality |
| OUT1 | Login screen | Output | Visible mobile view | Shows email field, password field, submit, registration/forgot links | Mobile UI/code |
| OUT2 | Field rendering | Output | Keyboard/security behavior | Email-friendly input; password masked | FR-02, FR-22 |
| OUT3 | Validation/error message | Output | Visible text/alert | Failed login and validation errors are visible and understandable | FR-02 |
| OUT4 | Authenticated state | Output | Visible greeting/navigation | User is visibly logged in after success | FR-02 |
| OUT5 | Token-backed behavior | Output | Authenticated feature access | Profile/orders/checkout use authenticated state without re-login | FR-02 |
| OUT6 | Lockout state | Output | Visible message/state | Account blocked after 3 failed attempts and before 30 seconds | FR-02 |
| OUT7 | Lockout recovery | Output | Visible state | User can log in again after the 30-second lock expires | FR-02 |
| OUT8 | Logout state | Output | Visible state | Logout clears authenticated UI and returns to guest behavior | Mobile UI |

## 4. Equivalence Classes

| EC ID | Variable | Class | Validity | Rationale |
| --- | --- | --- | --- | --- |
| EC-IN1-OPEN-FROM-HEADER | Entry point | Guest taps account/login action from header/home | Valid | Main mobile login path |
| EC-IN1-RETURN-HOME | Entry point | User taps back/home from login | Valid | User can leave login without authenticating |
| EC-IN2-GUEST | Auth state | No authenticated user/token in app state | Valid precondition | Initial mobile state |
| EC-IN2-AUTHENTICATED | Auth state | User is authenticated after login | Valid | Success state |
| EC-IN2-LOGGED-OUT | Auth state | User logs out after being authenticated | Valid | Session clearing |
| EC-IN2-APP-RESTART | Auth state | App is closed/reopened after login | Needs review | Token storage expectation from FR-02 |
| EC-IN3-EMAIL-REGISTERED | Email | Registered email `test@eshop.com` | Valid | Default test user |
| EC-IN3-EMAIL-ADMIN | Email | Admin email `admin@eshop.com` | Valid account | Login should work as a user identity unless app restricts role |
| EC-IN3-EMAIL-UNREGISTERED | Email | Valid format but unknown email | Invalid credentials | Should not reveal account existence |
| EC-IN3-EMAIL-BAD-FORMAT | Email | Invalid format, e.g. `test-at-eshop` | Invalid | Email format rule |
| EC-IN3-EMAIL-EMPTY | Email | Empty email | Invalid | Required field |
| EC-IN3-EMAIL-SPACES | Email | Spaces only | Invalid | Blank-equivalent input |
| EC-IN3-EMAIL-TRIM | Email | Leading/trailing spaces around valid email | Needs review | Should trim or show clear validation |
| EC-IN3-EMAIL-CASE | Email | Case variation, e.g. `TEST@ESHOP.COM` | Needs review | Email normalization unspecified |
| EC-IN4-PASSWORD-CORRECT | Password | Correct password for email | Valid | Success path |
| EC-IN4-PASSWORD-WRONG | Password | Wrong password for registered email | Invalid | Failed-attempt path |
| EC-IN4-PASSWORD-EMPTY | Password | Empty password | Invalid | Required field |
| EC-IN4-PASSWORD-SPACES | Password | Spaces only | Invalid | Blank-equivalent password should not authenticate |
| EC-IN4-PASSWORD-CASE-DIFF | Password | Same letters but wrong case | Invalid | Password is case-sensitive |
| EC-IN4-PASSWORD-SPECIAL | Password | Correct password with special character, e.g. `Test1234!` | Valid | Default password contains special character |
| EC-IN5-TAP-SUBMIT | Submit | Tap the Vietnamese login submit button | Valid | Primary mobile action |
| EC-IN5-KEYBOARD-SUBMIT | Submit | Submit from mobile keyboard if supported | Valid/Needs review | Common mobile form behavior |
| EC-IN6-UNKNOWN-ACCOUNT | Account | Email does not exist | Invalid credentials | Error should remain generic |
| EC-IN7-CORRECT-COMBO | Credentials | Registered email + correct password | Valid | Login success |
| EC-IN7-WRONG-COMBO | Credentials | Registered email + wrong password | Invalid | Login failure |
| EC-IN7-MISMATCHED-ACCOUNT | Credentials | Valid email of one user + another user's password | Invalid | Credential mismatch |
| EC-IN8-FAIL-0 | Failed count | Zero consecutive failures | Valid baseline | Account not locked |
| EC-IN8-FAIL-1 | Failed count | One consecutive failure | Invalid attempt but not locked | Counter boundary |
| EC-IN8-FAIL-2 | Failed count | Two consecutive failures | Invalid attempt but not locked | Just below lock threshold |
| EC-IN8-FAIL-3 | Failed count | Third consecutive failure | Locked | Lock threshold |
| EC-IN8-FAIL-MORE | Failed count | More than 3 consecutive failures | Locked | Remains locked |
| EC-IN8-RESET-AFTER-SUCCESS | Failed count | Successful login after prior failures resets counter | Valid | FR-02 says consecutive failures matter |
| EC-IN9-BEFORE-30S | Lockout time | Attempt during 0-29 seconds after lock | Invalid during lock | Must still be blocked |
| EC-IN9-AT-30S | Lockout time | Attempt at/after 30 seconds | Valid retry window | Demo lock duration |
| EC-IN10-NETWORK-OK | Network | Backend reachable | Valid | Normal operation |
| EC-IN10-NETWORK-DOWN | Network | Backend unavailable or wrong LAN IP | Invalid/Needs review | Mobile needs meaningful feedback |
| EC-OUT1-LOGIN-VISIBLE | Login screen | Login view with fields/actions visible | Valid output | Screen discoverability |
| EC-OUT2-EMAIL-KEYBOARD | Field rendering | Email field uses email-friendly keyboard/no auto-capitalization | Valid output | Mobile equivalent of email input |
| EC-OUT2-PASSWORD-MASKED | Field rendering | Password entry is hidden | Valid output | Password secrecy |
| EC-OUT3-GENERIC-FAILURE | Error output | Invalid credentials show generic failure | Valid output | Does not disclose account existence |
| EC-OUT3-VALIDATION | Error output | Empty/format validation visible before/after submit | Valid output | Required input handling |
| EC-OUT3-NETWORK | Error output | Network/connectivity error visible | Valid output | Avoid confusing network issue with bad credentials |
| EC-OUT4-HOME-AUTH | Auth success | User returns to home and header greets them | Valid output | Mobile visible token/user state |
| EC-OUT5-AUTH-FEATURE | Token behavior | Profile/orders/checkout are accessible without re-login | Valid output | Token-backed behavior |
| EC-OUT6-LOCKED | Lockout output | Lockout message/state visible after threshold | Valid output | Required lockout |
| EC-OUT7-UNLOCKED | Recovery output | Correct login succeeds after 30 seconds | Valid output | Required lockout expiry |
| EC-OUT8-LOGOUT | Logout output | Logout removes greeting and protected state | Valid output | Session clearing |

## 5. Minimum Domain Test Set

| TC ID | Surface | Covered ECs | Preconditions | Inputs / Actions | Expected Mobile UI Output | Notes / Result |
| --- | --- | --- | --- | --- | --- | --- |
| DT-FR02-MOB-001 | Mobile UI | EC-IN2-GUEST, EC-IN1-OPEN-FROM-HEADER, EC-OUT1-LOGIN-VISIBLE | App freshly opened, user not logged in | Tap account/login action from header | Login screen opens with an Email field, masked password field, Vietnamese "Dang nhap" submit button, forgot-password link, register link, and back/home action | FAIL. `App.js` shows `Username`, `Sign In`, and no email keyboard type. |
| DT-FR02-MOB-002 | Mobile UI | EC-IN1-RETURN-HOME | Login screen is open | Tap back/home action | App returns to home without authenticating | Navigation escape |
| DT-FR02-MOB-003 | Mobile UI | EC-OUT2-EMAIL-KEYBOARD | Login screen is open | Focus email field | Email field uses the mobile equivalent of `type=email`: `keyboardType="email-address"` or equivalent email keyboard behavior, and does not auto-capitalize typed email | FAIL. Login `TextInput` has `autoCapitalize="none"` but no `keyboardType="email-address"`. |
| DT-FR02-MOB-004 | Mobile UI | EC-OUT2-PASSWORD-MASKED | Login screen is open | Type `Test1234!` in password field | Password characters are hidden/masked | Password secrecy |
| DT-FR02-MOB-005 | Mobile UI | EC-IN3-EMAIL-EMPTY, EC-IN4-PASSWORD-CORRECT, EC-IN5-TAP-SUBMIT, EC-OUT3-VALIDATION | Login screen is open | Leave email empty, enter `Test1234!`, tap Dang nhap | Required-email validation is visible inline above the submit button; user remains unauthenticated | FAIL. No client validation; generic `loginError` renders below submit/register area. |
| DT-FR02-MOB-006 | Mobile UI | EC-IN3-EMAIL-BAD-FORMAT, EC-IN4-PASSWORD-CORRECT, EC-OUT3-VALIDATION | Login screen is open | Enter `test-at-eshop`, `Test1234!`, tap Dang nhap | Email-format validation is visible inline above the submit button; no authenticated state | FAIL. No client email-format validation; generic error renders below submit/register area. |
| DT-FR02-MOB-007 | Mobile UI | EC-IN3-EMAIL-SPACES, EC-IN4-PASSWORD-CORRECT, EC-OUT3-VALIDATION | Login screen is open | Enter spaces only for email, valid password, submit | Blank-equivalent email rejected; no authenticated state | Whitespace email |
| DT-FR02-MOB-008 | Mobile UI | EC-IN3-EMAIL-TRIM, EC-IN4-PASSWORD-CORRECT | Login screen is open | Enter ` test@eshop.com ` and `Test1234!`, submit | UI either trims and logs in, or rejects with clear validation | Trim behavior needs review |
| DT-FR02-MOB-009 | Mobile UI | EC-IN3-EMAIL-CASE, EC-IN4-PASSWORD-CORRECT | Login screen is open | Enter `TEST@ESHOP.COM` and `Test1234!`, submit | UI behavior is consistent and documented; either accepts normalized email or shows generic failure | Email case needs review |
| DT-FR02-MOB-010 | Mobile UI | EC-IN3-EMAIL-REGISTERED, EC-IN4-PASSWORD-EMPTY, EC-OUT3-VALIDATION | Login screen is open | Enter `test@eshop.com`, leave password empty, submit | Required-password validation is visible inline above the submit button; no authenticated state | FAIL. No client validation; generic `loginError` renders below submit/register area. |
| DT-FR02-MOB-011 | Mobile UI | EC-IN4-PASSWORD-SPACES, EC-IN3-EMAIL-REGISTERED, EC-OUT3-GENERIC-FAILURE | Login screen is open | Enter `test@eshop.com` and spaces-only password, submit | Generic login failure; no authenticated state | Blank-equivalent password |
| DT-FR02-MOB-012 | Mobile UI | EC-IN7-CORRECT-COMBO, EC-IN5-TAP-SUBMIT, EC-IN10-NETWORK-OK, EC-OUT4-HOME-AUTH | Backend reachable; account not locked | Enter `test@eshop.com` / `Test1234!`, tap login submit button | App returns to home; header/account area greets the user; login error is cleared | Main happy path |
| DT-FR02-MOB-013 | Mobile UI | EC-IN5-KEYBOARD-SUBMIT, EC-IN7-CORRECT-COMBO | Login fields filled with valid credentials | Submit from mobile keyboard if available | Same authenticated result as tapping the login submit button, or keyboard submit is intentionally unavailable without breaking form | Mobile form behavior |
| DT-FR02-MOB-014 | Mobile UI | EC-IN3-EMAIL-ADMIN, EC-IN4-PASSWORD-CORRECT, EC-IN7-CORRECT-COMBO | Admin account not locked | Enter `admin@eshop.com` / `Admin123!`, submit | Mobile app logs in or clearly blocks admin role by design; behavior must be consistent | Role expectation unclear for mobile |
| DT-FR02-MOB-015 | Mobile UI | EC-IN6-UNKNOWN-ACCOUNT, EC-IN3-EMAIL-UNREGISTERED, EC-OUT3-GENERIC-FAILURE | Login screen is open | Enter `notfound@example.com` / any password, submit | Generic failure message; UI does not reveal whether email exists | Enumeration resistance |
| DT-FR02-MOB-016 | Mobile UI | EC-IN7-WRONG-COMBO, EC-IN8-FAIL-1, EC-OUT3-GENERIC-FAILURE | Registered account has 0 failures | Enter `test@eshop.com` / `Wrong123!`, submit once | Generic failure visible; account is not locked yet; user may retry | Failure count 1 |
| DT-FR02-MOB-017 | Mobile UI | EC-IN8-FAIL-2, EC-OUT3-GENERIC-FAILURE | Same account has 1 consecutive failure | Submit wrong password a second time | Generic failure visible; account is not locked yet | Just below lock |
| DT-FR02-MOB-018 | Mobile UI | EC-IN8-FAIL-3, EC-OUT6-LOCKED | Same account has 2 consecutive failures | Submit wrong password a third time | UI shows appropriate lockout message/state; account cannot log in immediately | FAIL. Backend counter increments by 2 and mobile replaces lockout details with generic login error. |
| DT-FR02-MOB-019 | Mobile UI | EC-IN8-FAIL-MORE, EC-IN9-BEFORE-30S, EC-OUT6-LOCKED | Account just locked | Immediately enter correct password and submit | UI remains blocked with appropriate lockout feedback; no authenticated state | FAIL. Backend lockout is hidden behind generic mobile message. |
| DT-FR02-MOB-020 | Mobile UI | EC-IN9-AT-30S, EC-OUT7-UNLOCKED, EC-IN7-CORRECT-COMBO | Account locked, then 30 seconds pass | Enter correct credentials and submit | Login succeeds; app shows authenticated state | FAIL. Backend lockout lasts 180 seconds, not 30 seconds. |
| DT-FR02-MOB-021 | Mobile UI | EC-IN8-RESET-AFTER-SUCCESS | Account has 1-2 prior failures but not locked | Log in with correct password, log out, then enter one wrong password | Wrong-password attempt is treated as first new failure, not immediate lock | Consecutive-failure reset |
| DT-FR02-MOB-022 | Mobile UI | EC-IN7-MISMATCHED-ACCOUNT, EC-OUT3-GENERIC-FAILURE | Login screen is open | Enter `test@eshop.com` with `Admin123!`, submit | Generic failure; no authenticated state | Mismatched valid credentials |
| DT-FR02-MOB-023 | Mobile UI | EC-IN4-PASSWORD-CASE-DIFF, EC-OUT3-GENERIC-FAILURE | Login screen is open | Enter `test@eshop.com` / `test1234!`, submit | Generic failure; password case sensitivity preserved | Password case |
| DT-FR02-MOB-024 | Mobile UI | EC-OUT5-AUTH-FEATURE | User logged in successfully | Navigate to profile/orders or checkout flow requiring login | Mobile app accesses authenticated feature without asking for login again | UI-visible token behavior |
| DT-FR02-MOB-025 | Mobile UI | EC-IN2-APP-RESTART, EC-OUT5-AUTH-FEATURE | User logged in successfully | Close/reopen app | App should preserve session/token or clearly require re-login by design | Token storage expectation needs review |
| DT-FR02-MOB-026 | Mobile UI | EC-IN2-LOGGED-OUT, EC-OUT8-LOGOUT | User logged in | Tap logout | Greeting/protected state disappears; login is required for protected actions | Logout state |
| DT-FR02-MOB-027 | Mobile UI | EC-IN10-NETWORK-DOWN, EC-OUT3-NETWORK | Backend unavailable or mobile API IP unreachable | Enter otherwise valid credentials and submit | UI shows connectivity/error feedback distinguishable from invalid credentials | FAIL. Catch block always shows generic login failure. |
| DT-FR02-MOB-028 | Mobile UI | EC-OUT3-VALIDATION | Login screen is open | Trigger any login validation or failed-login error | Error message appears inline above the submit button | FAIL. `loginError` renders after the submit button and register link. |
| DT-FR02-MOB-029 | Mobile UI | EC-OUT1-LOGIN-VISIBLE | Login screen is open | Inspect login label and submit button text | Email label and submit action are Vietnamese or otherwise consistent with the Vietnamese UI requirement | FAIL. UI shows `Username` and `Sign In`. |
| DT-FR02-MOB-030 | Mobile UI | EC-IN8-FAIL-MORE | User has a `shipping` order in mobile order history | Open profile/order history and inspect the shipping order actions | A `shipping` order cannot be canceled from mobile UI; cancel action is available only for `pending` or `confirmed` | PASS. Mobile UI renders cancel only for `pending` or `confirmed`; backend direct cancel remains a separate risk. |
| DT-FR02-WEB-001 | Web UI | EC-OUT1-LOGIN-VISIBLE, EC-OUT2-EMAIL-KEYBOARD, EC-OUT2-PASSWORD-MASKED | Browser has no user session | Open `/login` in frontend web | Login page has correct login heading, Vietnamese UI text, email input, and masked password input | FAIL. `Login.jsx` uses `<h2>` register heading, `Username`, `Sign In`, email `type="text"`, and password `type="text"`. |
| DT-FR02-WEB-002 | Web UI | EC-OUT3-VALIDATION | Web login page is open | Submit invalid credentials | Error appears inline above the submit button | FAIL. `Login.jsx` renders error after the form. |

## 6. Boundary Value Test Set

| TC ID | Surface | Boundary Target | Preconditions | Inputs / Actions | Expected Mobile UI Output | Covered ECs / Result |
| --- | --- | --- | --- | --- | --- | --- |
| BVA-FR02-MOB-001 | Mobile UI | Failed attempts LB | Account has 0 consecutive failures | Enter correct credentials | Login succeeds | EC-IN8-FAIL-0 |
| BVA-FR02-MOB-002 | Mobile UI | Failed attempts threshold-2 | Account has 0 failures | Submit wrong password once | Generic failure; not locked | EC-IN8-FAIL-1 |
| BVA-FR02-MOB-003 | Mobile UI | Failed attempts threshold-1 | Account has 1 failure | Submit wrong password second time | Generic failure; not locked | EC-IN8-FAIL-2; FAIL. Backend adds `+2`, so the second wrong attempt locks. |
| BVA-FR02-MOB-004 | Mobile UI | Failed attempts threshold | Account has 2 failures | Submit wrong password third time | Account becomes locked; visible lockout state/message | EC-IN8-FAIL-3 |
| BVA-FR02-MOB-005 | Mobile UI | Failed attempts threshold+1 | Account locked after 3 failures | Submit wrong password again | Still locked; no extra disclosure | EC-IN8-FAIL-MORE |
| BVA-FR02-MOB-006 | Mobile UI | Lockout time LB | Account just locked | Submit correct password at 0 seconds | Still blocked | EC-IN9-BEFORE-30S |
| BVA-FR02-MOB-007 | Mobile UI | Lockout time UB-1 | Account locked | Submit correct password at 29 seconds | Still blocked | EC-IN9-BEFORE-30S |
| BVA-FR02-MOB-008 | Mobile UI | Lockout time UB | Account locked | Submit correct password at 30 seconds | Login succeeds or lock is visibly expired | EC-IN9-AT-30S; FAIL. Backend lockout is 180 seconds. |
| BVA-FR02-MOB-009 | Mobile UI | Lockout time UB+1 | Account locked | Submit correct password at 31 seconds | Login succeeds | EC-IN9-AT-30S; FAIL. Backend lockout is 180 seconds. |
| BVA-FR02-MOB-010 | Mobile UI | Email length empty | Login screen open | Email empty, valid password | Required-email error appears inline above submit; no login | EC-IN3-EMAIL-EMPTY; FAIL. No client required-email validation and generic error is below submit. |
| BVA-FR02-MOB-011 | Mobile UI | Email minimal valid shape | Test account exists with short valid email such as `a@b.co` | Enter short valid email and correct password | Login succeeds if registered | EC-IN3-EMAIL-REGISTERED |
| BVA-FR02-MOB-012 | Mobile UI | Password length empty | Login screen open | Registered email, empty password | Required-password error appears inline above submit; no login | EC-IN4-PASSWORD-EMPTY; FAIL. No client required-password validation and generic error is below submit. |
| BVA-FR02-MOB-013 | Mobile UI | Password exact registered value | Account not locked | `test@eshop.com` / `Test1234!` | Login succeeds | EC-IN4-PASSWORD-CORRECT |
| BVA-FR02-MOB-014 | Mobile UI | Password one-character difference | Account not locked | `test@eshop.com` / `Test1234?` | Generic failure; no login | EC-IN4-PASSWORD-WRONG |

Notes:

- Failed-attempt and lockout timing cases require a resettable test account or database reset between runs to avoid contaminating later cases.
- FR-02 says 30 seconds, so the UI oracle uses 29/30/31 seconds. If the SUT locks for a different duration, that is a bug against the spec.
- Mobile does not have HTML `type="email"`; the mobile-equivalent expectation is `keyboardType="email-address"` or comparable email-friendly input behavior plus no auto-capitalization.

## 7. Suggested Manual Execution Data

| Data Item | Value |
| --- | --- |
| Default user | `test@eshop.com` / `Test1234!` |
| Default admin | `admin@eshop.com` / `Admin123!` |
| Unregistered email | `notfound@example.com` |
| Wrong password | `Wrong123!` |
| Mismatched password | `Admin123!` with `test@eshop.com` |
| Case-different password | `test1234!` |
| Invalid email | `test-at-eshop` |
| Spaces-only input | `   ` |
| Mobile API base URL observed | `http://192.168.10.13:3000/api` in `frontend-mobile\App.js` |

## 8. Current Implementation Risks / Likely Bugs

These observations come from the current SUT files and should be verified during mobile execution.

| Bug ID | Observation | Evidence | Related tests |
| --- | --- | --- | --- |
| BUG-FR02-MOB-001 | Backend increments failed login attempts by 2, not exactly 1 | `server.js` uses `const newAttempts = user.login_attempts + 2` | BVA-FR02-MOB-002..004 |
| BUG-FR02-MOB-002 | Backend lockout duration is 180 seconds, not 30 seconds | `server.js` uses `Date.now() + 180000` | BVA-FR02-MOB-006..009 |
| BUG-FR02-MOB-003 | Mobile UI hides the backend lockout message by replacing every login error with the same generic message | `handleLogin` catch sets `loginError` to generic text | DT-FR02-MOB-018..020 |
| BUG-FR02-MOB-004 | Mobile email input does not declare an email keyboard type | Login `TextInput` has `autoCapitalize="none"` but no `keyboardType="email-address"` | DT-FR02-MOB-003 |
| BUG-FR02-MOB-005 | Mobile login does not validate empty or malformed email/password before submit | `handleLogin` posts current `email` and `password` directly | DT-FR02-MOB-005..011 |
| BUG-FR02-MOB-006 | Mobile token is kept only in React state and is not persisted across app restart | `token` state is initialized as empty string; no AsyncStorage/SecureStore usage | DT-FR02-MOB-025 |
| BUG-FR02-MOB-007 | Login button text and some labels are not consistently Vietnamese | UI shows `Username` and `Sign In` on Vietnamese login screen | DT-FR02-MOB-001 |
| BUG-FR02-MOB-008 | Login error appears below the submit/register area, not above the submit action as required by general form requirements | `loginError` is rendered after register link and Sign In button | DT-FR02-MOB-015..020 |
| BUG-FR02-MOB-009 | Mobile API URL is hard-coded to one LAN IP, so valid credentials may fail on another network/device | `API_URL = "http://192.168.10.13:3000/api"` | DT-FR02-MOB-027 |

## 9. Assumptions and Open Questions

| ID | Assumption / Question | Impact |
| --- | --- | --- |
| A1 | The README is treated as the intended contract when code and spec conflict. | Some expected UI outcomes may fail against the current SUT and become bug evidence. |
| A2 | Mobile equivalent of email `type="email"` means email keyboard/no auto-capitalization plus format validation. | Keeps FR-02 meaningful on React Native. |
| A3 | Token storage "phia client" is interpreted as persistence sufficient for later authenticated mobile flows; secure persistence is preferable. | DT-FR02-MOB-025 may need review if the product intentionally requires re-login after app restart. |
| A4 | The lockout message should be appropriate but not disclose whether the email exists. | Tests expect generic invalid-credential messages before lockout and a safe lockout message at threshold. |
| A5 | Admin credentials may or may not be intended to log into the mobile customer app. | DT-FR02-MOB-014 is marked as a consistency/review case. |
| A6 | Failed-attempt counter accuracy is normally backend behavior, but mobile UI can observe the boundary through when lockout appears. | Keeps tests UI-only while still covering FR-02 lockout behavior. |

## 10. Coverage Check

| Coverage Item | Status |
| --- | --- |
| Mobile UI surface plus supplemental web-login gap | Covered |
| Login screen entry/exit | Covered |
| Email required, format, whitespace, trim, case partitions | Covered |
| Password required, correct, wrong, case-sensitive partitions | Covered |
| Registered, unregistered, mismatched account partitions | Covered |
| Successful login and authenticated mobile state | Covered |
| Token-backed authenticated feature behavior | Covered |
| Logout behavior | Covered |
| Failed-attempt lock threshold at 3 attempts | Covered |
| Lockout timing boundaries at 29/30/31 seconds | Covered |
| Network/LAN failure state | Covered |
| Executable mobile UI tests | Deferred because no mobile UI test framework or test script exists in the reviewed mobile project |
