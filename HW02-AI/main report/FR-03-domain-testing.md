# FR-03 Domain Testing Report - Forgot Password and Password Reset

## 1. Selected Testing Surface

| Item | Decision |
| --- | --- |
| Feature | FR-03: Forgot password and password reset, two-step flow |
| SUT area | EShop Frontend Web |
| Surface | UI only |
| Main source files reviewed | `D:\CODE\eshop-sut\README.md`, `D:\CODE\eshop-sut\frontend-web\src\pages\ForgotPassword.jsx`, `D:\CODE\eshop-sut\frontend-web\src\pages\Login.jsx`, `D:\CODE\eshop-sut\backend\server.js`, `D:\CODE\eshop-sut\api_specification.md` |
| Test type | Manual UI test cases using domain testing and boundary value analysis |
| Executable tests | Not produced. The frontend project has no existing UI test framework or test script in `package.json`. |

Rationale: the request explicitly says "UI test only", so the cases below check only user-visible controls, validation, messages, navigation, and browser-visible state. API status codes and database updates are not asserted directly.

## 2. Feature Contract Summary

The forgot-password feature has two UI steps.

Step 1 asks for the email address of a registered user. On success, the system generates a random 6-digit OTP and, in the demo environment, displays it directly on the screen. The page must show a clear step indicator such as "Step 1 / 2" and provide a "Back to login" action.

Step 2 asks for OTP, new password, and confirmation password. The new password must satisfy the same strong-password rule as FR-01: at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 allowed special character from `@`, `$`, `!`, `%`, `*`, `?`, `&`. The confirmation password must match. OTP is valid only for the email address that requested it. On success, the user is returned to the login page.

Review checkpoint: expected behavior is based on the README requirements. Current implementation appears to deviate in several places; those are listed in section 8 as likely bugs to verify during execution.

## 3. Input and Output Variables

| ID | Variable | Direction | Type/Shape | Constraints | Source |
| --- | --- | --- | --- | --- | --- |
| IN1 | Entry point / page route | Input | Navigation action | Direct `/forgot-password` access and login-page "Forgot password" link should open the flow | UI/spec |
| IN2 | User session state | Input | Browser auth state | Guest user can use forgot-password flow; existing login should not be required | Spec |
| IN3 | Email field | Input | Text/email control | Required; valid email format; must belong to a registered user for OTP generation | FR-03, FR-22 |
| IN4 | Step-1 submit action | Input | Button click / Enter key | Sends OTP request only when email is acceptable | UI/spec |
| IN5 | OTP value displayed by demo UI | Output/Input | 6 numeric digits | Generated after valid registered email; visible in demo; must be usable in step 2 | FR-03 |
| IN6 | OTP input field | Input | Text control | Required; exactly 6 digits; must match OTP for the same email | FR-03 |
| IN7 | New password field | Input | Password control | Required; strong password rule from FR-01 | FR-03, FR-01 |
| IN8 | Confirm new password field | Input | Password control | Required; must exactly match new password | FR-03 |
| IN9 | Step navigation control | Input | Link/button | Back to login must be available; step flow must remain understandable | FR-03, FR-22 |
| OUT1 | Step indicator | Output | Visible text/state | Clearly shows current step, e.g. Step 1 / 2 then Step 2 / 2 | FR-03, FR-22 |
| OUT2 | Validation/error message | Output | Visible message | Error shown near form and above submit button; no silent failure | FR-22 |
| OUT3 | OTP demo message | Output | Visible message | Shows only the generated 6-digit OTP after successful request | FR-03 |
| OUT4 | Step transition | Output | UI state | Step 1 transitions to Step 2 only after successful OTP request | FR-03 |
| OUT5 | Success outcome | Output | Visible result/navigation | Password reset succeeds and user is navigated to login page | FR-03 |
| OUT6 | Field security | Output | Browser rendering | Password values are masked using password inputs | FR-22 |

## 4. Equivalence Classes

| EC ID | Variable | Class | Validity | Rationale |
| --- | --- | --- | --- | --- |
| EC-IN1-DIRECT | Entry point | User opens `/forgot-password` directly | Valid | Forgot password should not require prior navigation |
| EC-IN1-FROM-LOGIN | Entry point | User opens the flow from login page link | Valid | Login page provides the main recovery path |
| EC-IN2-GUEST | Session | Guest/not authenticated | Valid | Recovery is intended for users who cannot log in |
| EC-IN3-REGISTERED | Email | Registered email with valid format, e.g. `test@eshop.com` | Valid | Required for OTP generation |
| EC-IN3-UNREGISTERED | Email | Valid format but not registered | Invalid | No OTP should be issued |
| EC-IN3-BAD-FORMAT | Email | Not an email, e.g. `test-at-eshop` | Invalid | Email field must validate format |
| EC-IN3-EMPTY | Email | Empty value | Invalid | Required field |
| EC-IN3-WHITESPACE | Email | Only spaces or leading/trailing spaces | Invalid/Needs review | UI should not accept blank-equivalent input; trim behavior is not specified |
| EC-IN4-CLICK | Step-1 action | Click "Get OTP" | Valid | Primary mouse interaction |
| EC-IN4-ENTER | Step-1 action | Press Enter in email field | Valid | Standard form submission behavior |
| EC-IN5-SIX-DIGIT | OTP display | Demo OTP is exactly 6 numeric digits | Valid | Required OTP format |
| EC-IN5-NOT-LEAKED-ON-ERROR | OTP display | OTP not shown when email request fails | Valid | Prevents misleading or unauthorized recovery feedback |
| EC-IN6-CORRECT | OTP input | Correct 6-digit OTP for same email | Valid | Required for reset |
| EC-IN6-WRONG | OTP input | 6 digits but does not match | Invalid | Must reject wrong OTP |
| EC-IN6-EMPTY | OTP input | Empty OTP | Invalid | Required field |
| EC-IN6-LEN-LOW | OTP input | Fewer than 6 digits | Invalid | Below required length |
| EC-IN6-LEN-HIGH | OTP input | More than 6 digits | Invalid | Above required length |
| EC-IN6-NONNUMERIC | OTP input | Contains letters or symbols | Invalid | OTP must be numeric |
| EC-IN6-OTHER-EMAIL | OTP input | OTP generated for a different email | Invalid | OTP is bound to requesting email |
| EC-IN7-STRONG | New password | Meets all strength rules, e.g. `NewPass1!` | Valid | Acceptable reset password |
| EC-IN7-EMPTY | New password | Empty password | Invalid | Required field |
| EC-IN7-TOO-SHORT | New password | Fewer than 8 characters | Invalid | Minimum length is 8 |
| EC-IN7-NO-UPPER | New password | Missing uppercase letter | Invalid | Strength rule |
| EC-IN7-NO-LOWER | New password | Missing lowercase letter | Invalid | Strength rule |
| EC-IN7-NO-DIGIT | New password | Missing digit | Invalid | Strength rule |
| EC-IN7-NO-SPECIAL | New password | Missing allowed special character | Invalid | Strength rule |
| EC-IN7-UNSUPPORTED-SPECIAL | New password | Uses a symbol outside `@$!%*?&` as the only special character | Invalid/Needs review | Spec lists allowed special characters |
| EC-IN8-MATCH | Confirm password | Same as new password | Valid | Confirmation succeeds |
| EC-IN8-MISMATCH | Confirm password | Different from new password | Invalid | Must reject mismatch |
| EC-IN8-EMPTY | Confirm password | Empty confirmation | Invalid | Required field |
| EC-IN9-BACK-LOGIN | Navigation | "Back to login" is visible and navigates to login | Valid | Explicit FR-03 requirement |
| EC-OUT1-STEP1 | Step indicator | Shows Step 1 / 2 during email step | Valid output | Required multi-step indicator |
| EC-OUT1-STEP2 | Step indicator | Shows Step 2 / 2 during reset step | Valid output | Required multi-step indicator |
| EC-OUT2-INLINE-ERROR | Error message | Error appears visibly above submit button | Valid output | FR-22 message placement |
| EC-OUT3-OTP-SHOWN | OTP message | 6-digit OTP shown after valid email | Valid output | Demo behavior |
| EC-OUT4-STAY-STEP1 | Step transition | Remains on Step 1 after invalid email | Valid output | Invalid request should not advance |
| EC-OUT4-GO-STEP2 | Step transition | Advances to Step 2 after valid email | Valid output | Valid request should advance |
| EC-OUT5-LOGIN | Success outcome | Returns to login after successful reset | Valid output | FR-03 completion behavior |
| EC-OUT6-MASKED | Field security | Password and confirm fields use masked input | Valid output | FR-22 password-field rule |

## 5. Minimum Domain Test Set

| TC ID | Surface | Covered ECs | Preconditions | Inputs / Actions | Expected UI Output | Notes / Result |
| --- | --- | --- | --- | --- | --- | --- |
| DT-FR03-001 | UI | EC-IN1-DIRECT, EC-IN2-GUEST, EC-OUT1-STEP1, EC-IN9-BACK-LOGIN | User is logged out | Open `/forgot-password` directly | Forgot-password page opens; Step 1 / 2 is visible; email field and "Get OTP" button are visible; "Back to login" is visible | Checks basic page contract |
| DT-FR03-002 | UI | EC-IN1-FROM-LOGIN | User is logged out | Open `/login`, click "Forgot password" | Browser navigates to forgot-password page | Covers main recovery entry path |
| DT-FR03-003 | UI | EC-IN3-REGISTERED, EC-IN4-CLICK, EC-IN5-SIX-DIGIT, EC-OUT3-OTP-SHOWN, EC-OUT4-GO-STEP2, EC-OUT1-STEP2 | Registered user `test@eshop.com` exists | Enter `test@eshop.com`, click "Get OTP" | UI advances to Step 2 / 2 and displays exactly one 6-digit numeric OTP | Valid representative |
| DT-FR03-004 | UI | EC-IN4-ENTER | Registered user exists | Enter registered email, press Enter | Same successful result as clicking "Get OTP" | Keyboard submission |
| DT-FR03-005 | UI | EC-IN3-UNREGISTERED, EC-IN5-NOT-LEAKED-ON-ERROR, EC-OUT4-STAY-STEP1, EC-OUT2-INLINE-ERROR | Email is not registered | Enter `notfound@example.com`, submit | Remains on Step 1; shows a clear error above submit; no OTP is displayed | Isolates unregistered email |
| DT-FR03-006 | UI | EC-IN3-BAD-FORMAT, EC-OUT4-STAY-STEP1, EC-OUT2-INLINE-ERROR | None | Enter `test-at-eshop`, submit | Browser or UI blocks submission; email format error is visible; remains on Step 1 | Email input should be `type=email` |
| DT-FR03-007 | UI | EC-IN3-EMPTY, EC-OUT4-STAY-STEP1, EC-OUT2-INLINE-ERROR | None | Leave email empty, submit | Required-field error is visible; remains on Step 1 | Required field |
| DT-FR03-008 | UI | EC-IN3-WHITESPACE, EC-OUT4-STAY-STEP1, EC-OUT2-INLINE-ERROR | None | Enter only spaces, submit | Blank-equivalent email is rejected; no OTP is shown | Needs review if trim behavior is unspecified |
| DT-FR03-009 | UI | EC-IN6-CORRECT, EC-IN7-STRONG, EC-IN8-MATCH, EC-OUT5-LOGIN, EC-OUT6-MASKED | Complete Step 1 successfully and capture OTP | Enter correct OTP, `NewPass1!`, confirm `NewPass1!`, submit | Success message is visible and browser navigates to `/login`; password fields are masked | FAIL. `NewPass1!` is rejected by flawed regex and confirm field does not exist. |
| DT-FR03-010 | UI | EC-IN6-WRONG, EC-IN7-STRONG, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter `000000`, `NewPass1!`, confirm `NewPass1!`, submit | Error says OTP is invalid; user stays on Step 2; password is not reset | FAIL. Password validation rejects before OTP submit; no confirm field; errors use `alert()`. |
| DT-FR03-011 | UI | EC-IN6-EMPTY, EC-IN7-STRONG, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Leave OTP empty; enter valid matching password; submit | Required OTP error is visible; user stays on Step 2 | FAIL. Password validation blocks first and no inline OTP error is shown. |
| DT-FR03-012 | UI | EC-IN6-NONNUMERIC, EC-IN7-STRONG, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter `12AB56`, valid matching password, submit | Numeric-only OTP error is visible; user stays on Step 2 | FAIL. Password validation blocks first; UI/backend use 4-digit OTP. |
| DT-FR03-013 | UI | EC-IN6-OTHER-EMAIL, EC-IN7-STRONG, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | OTP was generated for another registered email | Try that OTP in the current email's reset flow | UI rejects the OTP and stays on Step 2 | FAIL. Representative password is rejected before cross-email OTP can be tested; confirm field missing. |
| DT-FR03-014 | UI | EC-IN7-EMPTY, EC-IN6-CORRECT, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; leave new password empty; confirm empty; submit | Required password error is visible; user stays on Step 2 | FAIL. No confirm field and weak-password error uses `alert()`. |
| DT-FR03-015 | UI | EC-IN7-TOO-SHORT, EC-IN6-CORRECT, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; password `Aa1!aaa`; confirm same; submit | Password length error is visible; user stays on Step 2 | FAIL. Rejected for regex/special/whitespace mismatch, not correct length-specific inline validation. |
| DT-FR03-016 | UI | EC-IN7-NO-UPPER, EC-IN6-CORRECT, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; password `newpass1!`; confirm same; submit | Missing uppercase error is visible; user stays on Step 2 | FAIL. Rejected for multiple regex reasons via `alert()`. |
| DT-FR03-017 | UI | EC-IN7-NO-LOWER, EC-IN6-CORRECT, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; password `NEWPASS1!`; confirm same; submit | Missing lowercase error is visible; user stays on Step 2 | FAIL. Rejected for multiple regex reasons via `alert()`. |
| DT-FR03-018 | UI | EC-IN7-NO-DIGIT, EC-IN6-CORRECT, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; password `NewPass!`; confirm same; submit | Missing digit error is visible; user stays on Step 2 | FAIL. Rejected for multiple regex reasons via `alert()`. |
| DT-FR03-019 | UI | EC-IN7-NO-SPECIAL, EC-IN6-CORRECT, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; password `NewPass1`; confirm same; submit | Missing special-character error is visible; user stays on Step 2 | FAIL. Regex does not enforce `@$!%*?&`; a whitespace password can pass client validation. |
| DT-FR03-020 | UI | EC-IN7-UNSUPPORTED-SPECIAL, EC-IN6-CORRECT, EC-IN8-MATCH, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; password `NewPass1#`; confirm same; submit | Unsupported special-character error is visible; user stays on Step 2 | FAIL. Same path also rejects allowed `!`, so the partition is implemented incorrectly. |
| DT-FR03-021 | UI | EC-IN8-MISMATCH, EC-IN6-CORRECT, EC-IN7-STRONG, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP; new password `NewPass1!`; confirm `NewPass2!`; submit | Mismatch error is visible; user stays on Step 2 | FAIL. Confirm password field does not exist. |
| DT-FR03-022 | UI | EC-IN8-EMPTY, EC-IN6-CORRECT, EC-IN7-STRONG, EC-OUT2-INLINE-ERROR | Step 2 is open | Enter correct OTP and valid new password; leave confirm empty; submit | Required confirmation error is visible; user stays on Step 2 | FAIL. Confirm password field does not exist. |
| DT-FR03-023 | UI | EC-IN9-BACK-LOGIN | Forgot-password page is open | Click "Back to login" from Step 1 | Browser navigates to `/login` | FAIL. Back-to-login control is missing on Step 1. |
| DT-FR03-024 | UI | EC-IN9-BACK-LOGIN | Step 2 is open | Click "Back to login" | Browser navigates to `/login` without resetting password | FAIL. Existing back button runs `setStep(1)`, not `/login` navigation. |
| DT-FR03-025 | UI | EC-OUT6-MASKED | Step 2 is open | Type password and confirmation | Both fields hide typed characters; field types are password | FAIL. New password is masked, but confirm field does not exist. |
| DT-FR03-026 | UI | EC-IN7-STRONG | Web register page is open | Enter valid FR-01 password `Test1234!` during registration | Valid strong password is accepted by registration | FAIL. `Register.jsx` uses the same whitespace-based flawed regex and rejects `Test1234!`. |
| DT-FR03-027 | UI | EC-IN7-NO-SPECIAL | Step 2 is open with a correct OTP | Enter new password `NewPass 1` and submit | Password is rejected because it has no allowed special character from `@$!%*?&` | FAIL. Client regex accepts whitespace as the required extra character. |
| DT-FR03-028 | UI | EC-IN1-FROM-LOGIN, EC-OUT2-INLINE-ERROR | Open `/login` before navigating to forgot password | Inspect login title, email/password fields, submit text, and error placement | Login page supports the recovery journey without violating FR-21/FR-22 form requirements | FAIL. `Login.jsx` has register heading, `<h2>`, `type="text"` for email/password, `Sign In`, and error after form. |
| DT-FR03-029 | UI | EC-IN5-SIX-DIGIT, EC-OUT3-OTP-SHOWN | Complete Step 1 with registered email | Inspect Step 2 OTP label and displayed OTP | Step 2 labels and displays a 6-digit OTP | FAIL. UI says `OTP (4 digits)` and backend generates 4 digits. |

## 6. Boundary Value Test Set

| TC ID | Surface | Boundary Target | Preconditions | Inputs / Actions | Expected UI Output | Covered ECs / Result |
| --- | --- | --- | --- | --- | --- | --- |
| BVA-FR03-001 | UI | OTP length LB-1 | Step 2 is open | OTP `12345`; valid matching password | Reject as too short; stay on Step 2 | EC-IN6-LEN-LOW; FAIL. SUT uses a 4-digit OTP contract. |
| BVA-FR03-002 | UI | OTP length LB | Step 2 is open | Correct 6-digit OTP; valid matching password | Accept OTP and complete reset | EC-IN6-CORRECT; FAIL. Backend generates 4-digit OTP; valid password representative is rejected; confirm field missing. |
| BVA-FR03-003 | UI | OTP length LB+1/UB+1 | Step 2 is open | OTP `1234567`; valid matching password | Reject as too long; stay on Step 2 | EC-IN6-LEN-HIGH; FAIL. SUT does not implement the README 6-digit boundary. |
| BVA-FR03-004 | UI | OTP numeric lower visual value | Step 2 is open; OTP generated is `000000` if test data can force it | Enter `000000`; valid matching password | Accept only if it is the exact generated OTP for the same email | EC-IN6-CORRECT |
| BVA-FR03-005 | UI | OTP numeric upper visual value | Step 2 is open; OTP generated is `999999` if test data can force it | Enter `999999`; valid matching password | Accept only if it is the exact generated OTP for the same email | EC-IN6-CORRECT |
| BVA-FR03-006 | UI | Password length LB-1 | Step 2 is open | Password `Aa1!aaa` length 7; confirmation same | Reject as too short | EC-IN7-TOO-SHORT |
| BVA-FR03-007 | UI | Password length LB | Step 2 is open | Password `Aa1!aaaa` length 8; confirmation same | Accept password strength if OTP is correct | EC-IN7-STRONG; FAIL. Client rejects `!` and requires whitespace. |
| BVA-FR03-008 | UI | Password length LB+1 | Step 2 is open | Password `Aa1!aaaaa` length 9; confirmation same | Accept password strength if OTP is correct | EC-IN7-STRONG; FAIL. Client rejects `!` and requires whitespace. |
| BVA-FR03-009 | UI | Email empty | Step 1 is open | Email empty | Required-field error; stay on Step 1 | EC-IN3-EMPTY |
| BVA-FR03-010 | UI | Email minimum plausible shape invalid | Step 1 is open | Email `a@b` | Reject as invalid email format or unregistered email without OTP display | EC-IN3-BAD-FORMAT / EC-IN3-UNREGISTERED |
| BVA-FR03-011 | UI | Email simple valid registered | Registered user exists | Email `a@b.co` if registered in test data | OTP request succeeds; Step 2 visible | EC-IN3-REGISTERED |
| BVA-FR03-012 | UI | Confirm password exact equality | Step 2 is open | New `NewPass1!`, confirm `NewPass1!` | Confirmation accepted | EC-IN8-MATCH; FAIL. Confirm field does not exist. |
| BVA-FR03-013 | UI | Confirm password one-character difference | Step 2 is open | New `NewPass1!`, confirm `NewPass1?` | Mismatch error visible | EC-IN8-MISMATCH; FAIL. Confirm field does not exist. |

Notes:

- OTP numeric lower/upper values require test control over generated OTP, a seeded backend, or manual repetition until generated. If that is not available, these remain review/manual-observation cases.
- No upper bound is specified for password length, so only lower-bound BVA is defined.

## 7. Suggested Manual Execution Data

| Data Item | Value |
| --- | --- |
| Existing user | `test@eshop.com` |
| Existing user original password | `Test1234!` |
| Unregistered email | `notfound@example.com` |
| Valid new password | `NewPass1!` |
| Too-short password | `Aa1!aaa` |
| Missing uppercase password | `newpass1!` |
| Missing lowercase password | `NEWPASS1!` |
| Missing digit password | `NewPass!` |
| Missing special password | `NewPass1` |
| Unsupported-special password | `NewPass1#` |

## 8. Current Implementation Risks / Likely Bugs

These are not assumptions for the expected test results; they are observations from the current SUT files and should be verified by running the UI.

| Bug ID | Observation | Evidence | Related tests |
| --- | --- | --- | --- |
| BUG-FR03-001 | Forgot-password page does not show a visible "Step 1 / 2" or "Step 2 / 2" indicator | `ForgotPassword.jsx` uses internal `step` state but renders no step indicator | DT-FR03-001, DT-FR03-003 |
| BUG-FR03-002 | Email input on forgot-password page is `type="text"` instead of `type="email"` | `ForgotPassword.jsx` email field | DT-FR03-006 |
| BUG-FR03-003 | Required "Back to login" button/link is missing on forgot-password page | `ForgotPassword.jsx` has only a Step 2 "Back" button to Step 1 | DT-FR03-001, DT-FR03-023, DT-FR03-024 |
| BUG-FR03-004 | OTP is generated as 4 digits and UI label says "OTP (4 digits)", but FR-03 requires 6 digits | `server.js` uses `Math.floor(1000 + Math.random() * 9000)`; `ForgotPassword.jsx` label says 4 digits | DT-FR03-003, BVA-FR03-001..003 |
| BUG-FR03-005 | Step 2 has no confirm new password field | `ForgotPassword.jsx` renders only `newPassword` | DT-FR03-021, DT-FR03-022 |
| BUG-FR03-006 | Client password validation does not match FR-01/FR-03 strong-password rule | Regex requires whitespace and allows only letters/digits/spaces, while message says special character | DT-FR03-009, DT-FR03-015..020 |
| BUG-FR03-007 | Errors use browser alerts instead of inline messages above the submit button | `ForgotPassword.jsx` calls `alert(...)` for request/reset failures and weak password | DT-FR03-005..022 |
| BUG-FR03-008 | Page title uses `<h2>` instead of the required single page `<h1>` convention | `ForgotPassword.jsx` renders `<h2>` | DT-FR03-001 |

## 9. Assumptions and Open Questions

| ID | Assumption / Question | Impact |
| --- | --- | --- |
| A1 | Report uses the README as the source of intended behavior when code and spec conflict. | Test expected results may fail against the current implementation, which is useful for bug discovery. |
| A2 | Whitespace-only email should be rejected as blank-equivalent input. | If the product intentionally delegates this to the backend, DT-FR03-008 should be adjusted. |
| A3 | Password special characters are limited to the set explicitly listed in FR-01: `@`, `$`, `!`, `%`, `*`, `?`, `&`. | If all symbols are intended to be accepted, DT-FR03-020 should move from invalid to valid. |
| A4 | UI-only testing may observe that reset succeeded via navigation/login behavior, but should not inspect the database directly. | Keeps the suite aligned with the requested surface. |
| A5 | OTP boundary values `000000` and `999999` need controllable test data or a seeded generator. | These BVA cases may be documented rather than executed manually. |

## 10. Coverage Check

| Coverage Item | Status |
| --- | --- |
| UI surface respected | Covered |
| Step 1 email request path | Covered |
| Step 2 OTP + password reset path | Covered |
| Registered, unregistered, invalid, empty, whitespace email classes | Covered |
| Correct, wrong, empty, short, long, nonnumeric, other-email OTP classes | Covered |
| Strong and weak password partitions | Covered |
| Confirm-password match, mismatch, empty classes | Covered |
| Step indicator and navigation requirements | Covered |
| Boundary tests for OTP length and password length | Covered |
| Executable UI tests | Deferred because no UI test framework exists in the reviewed frontend project |
