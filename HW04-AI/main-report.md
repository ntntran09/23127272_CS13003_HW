# HW04 – Automation Testing Report

## 1. Student Information

| Field | Value |
| --- | --- |
| Student name | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class / Cohort | 23KTPM2 |
| Assignment | HW04-AI – Automation Testing |
| AI tool | OpenAI Codex |

## 2. Scope and Feature Selection

The same three web features selected in HW02 were automated:

| Pool | Feature | HW02 source | Test cases | Datasets |
| --- | --- | --- | ---: | ---: |
| A | FR-03 Forgot password and password reset | `../HW02-AI/main report/FR-03-domain-testing.md` | 12 | 25 |
| B | FR-11 User order history | `../HW02-AI/main report/FR-11-domain-testing.md` | 12 | 27 |
| C | FR-14 Category management | `../HW02-AI/main report/FR-14-domain-testing.md` | 12 | 26 |

## 3. Automation Design

The suite uses Playwright with external JSON data. Each JSON row contains a stable ID, title, action key, inputs, expected result, and requirement IDs. The `.spec.js` files iterate over those rows; variable test inputs are not stored in inline arrays.

The design is hybrid:

- UI pages and React behavior are always the real SUT.
- Main navigation and authentication gates are exercised in the UI.
- Deterministic network fixtures provide rare order states and disposable category state without modifying the SUT database.
- Fixtures set up preconditions only; requirement assertions evaluate the real frontend behavior.

Assertion patterns include URL, visibility, text/content, count/structure, attributes, values, classes, and negative assertions.

## 4. Browser and Report Configuration

The locally available browser projects are:

- Playwright Chromium
- Installed Google Chrome
- Installed Microsoft Edge

Each feature was invoked independently on every browser. The nine report directories are under `automation/reports/<feature>/<browser>/`. Every report contains:

- visible title `Run by: 23127272`;
- an ISO run timestamp;
- feature and browser metadata;
- test annotations, screenshots, videos, and traces for failures.

`scripts/validate-reports.ps1` decodes the embedded Playwright `report.json` and verifies these fields instead of trusting directory names.

## 5. Execution Summary

| Feature | Datasets | Browser runs | Executions | Passed | Failed | Flaky | Skipped |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| FR-03 | 25 | 3 | 75 | 6 | 69 | 0 | 0 |
| FR-11 | 27 | 3 | 81 | 69 | 12 | 0 | 0 |
| FR-14 | 26 | 3 | 78 | 69 | 9 | 0 | 0 |
| **Total** | **78** | **9** | **234** | **144** | **90** | **0** | **0** |

The result is deterministic across the three browsers: every case has the same outcome on each browser. Failures were consolidated into eleven unique defects in `bug-report/bug-report.md`.

## 6. AI-generated Script Review and Human Fixes

The first generated matrix runner attempted to spawn `npx.cmd`. On this Windows environment, the child process did not start and the runner misleadingly summarized all nine runs as failed in about one second. Human review identified the absence of Playwright output and report files. The runner was corrected to call `process.execPath` with `require.resolve('@playwright/test/cli')`, and it then executed all 231 browser tests.

The initial OTP assertion used word boundaries. Rendered React text concatenated the OTP with the next element text, so a correct visible token did not match even though it was present. The assertion was corrected to numeric boundaries using non-digit checks.

The initial 7.5-second assertion timeout made known missing-element failures unnecessarily slow. It was reduced to three seconds after confirming that mocked UI states render in under one second.

The original browser plan assumed Firefox and WebKit runtimes. Installation was not authorized, so the environment was inspected and the executable projects were changed to Chromium, installed Chrome, and installed Edge. This limitation is explicit because all three use the Chromium engine.

Selectors were scoped to the target feature. For example, the back-to-login locator was restricted to `main`; otherwise the global header login link caused a false pass.

### 6.1 Second review pass — test validity

A second review targeted the validity of the cases themselves rather than the runner. Five classes of problem were found and corrected.

**Tautological fixtures.** The largest defect in the generated suite was that several fixtures were told the answer by the case that used them. `mockForgotPassword` accepted an `unregisteredEmails` array, so "unregistered email is rejected" could only ever pass; the three "registered email" datasets were likewise interchangeable because the fixture returned success for every address. Worse, FR11-AUTO-006 claimed to verify SEC-02 ownership while serving a payload that contained only the current user's orders — the assertion "another user's order is absent" was guaranteed by the fixture and would have passed against a SUT with no ownership check at all. The fixture was rewritten around an account registry that answers from its own data, and the ownership case now serves the mixed data that DT-FR11-007/008 prescribe. That single change turned a permanently green test into **BUG-FR11-01**: the profile table renders another user's order verbatim.

**Assertions that outran the requirement.** The page-contract case asserted `main h1`, which no FR requires and which the SUT does not use, and the back-to-login case demanded a `link` role when the requirement only names a "Back to login" action. Both produced failures that a reviewer could dismiss. The `h1` assertion was deleted and the control is now matched as link *or* button, with the destination as the oracle — the remaining failure is that step 1 offers no such control at all.

**Weak oracles.** The money assertion matched a substring of the whole `<tr>`, and because a table row concatenates cells without separators, `1 ₫` also matched `21 ₫`. It now matches the money cell with both ends anchored. The OTP assertion accepted any six digits rather than the token the fixture issued. The XSS cases asserted `img` count zero for all three payloads, including the `<script>` and `<b>` ones, and collected browser dialogs without ever asserting on them — an `alert()` that actually fired would have passed.

**Data that contradicted its own label.** The case named "255-character name" carried a 325-character string, so the documented boundary was never exercised. The value is now exactly 255 characters, the 256-character companion required by BVA-FR14-007 was added, and the spec asserts the declared length before using it. One password dataset labelled "allowed-special-character" used `#`, which is outside the FR-01 set `@ $ ! % * ? &`.

**Internal contradiction.** FR03-AUTO-009 required the confirmation field to exist while FR03-AUTO-010 skipped it with `if (count > 2)`. The suite now asserts the three-input contract explicitly and still drives the form, so the submit outcome stays observable.

`scripts/validate-test-data.js` was extended to catch these classes mechanically: dataset ids must nest under their case id, every `action` must have a matching `case` in the spec, action-specific dataset fields must be present, declared boundary lengths must match the value, and an email may not expect an OTP unless the registry actually issues one.

## 7. Failure Review

Before classifying failures, the test code, request fixture, rendered text, screenshot, and SUT source were compared with the published requirement. The 90 failed executions represent eleven repeated product defects, not 90 distinct bugs. See `bug-report/bug-report.md`.

Each defect row states whether a fixture stood in for the backend and, where it did, names the API check still required. This matters most for the OTP-length and ownership rows: both are UI-contract defects observed against a mocked endpoint, and neither run is evidence about live backend behaviour.

## 8. Agent Skills

Two reusable task skills were created instead of one assignment-specific skill:

- `convert-domain-cases-to-playwright`: converts existing requirement/domain cases into external-data Playwright tests and enforces human-review gates.
- `run-playwright-browser-matrix`: executes isolated feature-browser runs and defines the attributable report contract.

Both skill directories passed the official `quick_validate.py`. The first skill's data validator was executed against all three feature data files.

## 9. Limitations and Remaining Student Actions

- Chrome, Edge, and Chromium are three browser executables but use one rendering engine. Firefox/WebKit remains the stronger compatibility matrix if their runtimes are installed later.
- Network fixtures make edge-state UI tests deterministic; they do not replace separate backend/API authorization testing.
- GitHub Issues must still be created from the eleven reviewed bug rows and screenshots.
- Two defects are UI-contract findings observed behind a fixture (BUG-FR03-05 OTP length, BUG-FR11-01 ownership filtering). Confirming whether the backend shares the defect requires API-level testing that is out of scope here.
- The narrated Vietnamese video, `whoami`/`hostname` evidence, YouTube links, and PDF exports require the student.
- The assignment requires at least eight meaningful test-script commits over at least four real days. This cannot be fabricated after implementation.

## 10. Reproduction Commands

```powershell
cd HW04-AI\automation
npm install
npm run validate:data
npm run test:matrix
npm run validate:reports
```
