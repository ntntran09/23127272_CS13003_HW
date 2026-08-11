# HW04 – Automation Testing Report

## 1. Student Information

| Field | Value |
| --- | --- |
| Student name | NGUYEN THIEN NHA TRAN |
| Student ID | 23127272 |
| Class / Cohort | 23KTPM2 |
| Assignment | HW04-AI – Automation Testing |
| AI tool | OpenAI Codex; Claude (Claude Code, Opus 5) |

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
- `run-playwright-browser-matrix`: executes isolated feature-browser runs, defines the attributable report contract, and verifies it.

Both skills are exercised against this project's real artifacts rather than described only in prose:

```powershell
npm run validate:data:skill      # the conversion skill's validator, on all three data files
npm run validate:reports:skill   # the matrix skill's verifier, on all fifteen reports
```

### Corrections found by using the skills on their own output

The review session exposed two ways in which a skill can look complete and still be unusable.

**The conversion skill could not validate the data it produced.** Its schema and bundled validator still described a flat one-row-per-test shape, while the suite had moved to case objects holding a `datasets` array. Running the skill's validator against the three feature files reported `missing input` and `missing expected` for all 36 cases. An earlier draft of this report stated that the validator had been run against them, which cannot have been true. The schema reference now documents case fields and dataset fields separately, and the validator checks the real shape, including the `sourceCases` traceability field that makes section 9 computable. It passes on all three files.

**The matrix skill told the user to verify but shipped nothing to verify with.** Its "Verify" section described decoding the embedded `report.json` by hand, and the only working implementation lived in this project as a Windows-only PowerShell script. The skill now ships `scripts/verify-reports.js`: dependency-free Node that reads the ZIP the HTML report embeds, checks runner identity, ISO timestamp, feature/browser metadata against the path, the visible title, and totals, and exits nonzero on any violation. It also fails a report containing zero tests, because a run that executed nothing otherwise reads as a clean pass — the exact failure mode that produced a misleading all-red summary during implementation.

**The matrix skill also could not catch the mistake this project made.** Its precondition was "at least three browsers", which Chromium, Chrome, and Edge satisfy while sharing one renderer. The runner now maps each project to its engine and refuses a single-engine matrix unless `--allow-single-engine` is passed, in which case the limitation belongs in the report.

The conversion skill's human-review gates were sharpened from the specific defects found in section 6.1: a falsifiability test for every case that uses a fixture, and a rule that a case asserting the absence of something must be served data that contains it. Those two checks are what would have caught the tautological ownership case before it shipped green on three browsers.

An `quick_validate.py` conformance run was claimed in an earlier draft; that tool is not present in this environment, so the claim is withdrawn rather than restated. The validation evidence above is reproducible from the repository.

## 9. Coverage of the HW02 Domain Cases

Every automated case declares a `sourceCases` field naming the HW02 domain cases it converts, and `scripts/validate-test-data.js` fails the build if a case traces to nothing or to an id that does not belong to its feature. The coverage figures below are therefore computed from the data files, not estimated.

| Feature | HW02 cases | Covered | Not automated | Coverage |
| --- | ---: | ---: | ---: | ---: |
| FR-03 | 42 | 20 | 22 | 48% |
| FR-11 | 46 | 29 | 17 | 63% |
| FR-14 | 44 | 21 | 23 | 48% |
| **Total** | **132** | **70** | **62** | **53%** |

The assignment requires at least 12 converted cases per feature; 36 automated cases carrying 78 datasets cover 70 domain cases. The 62 remaining cases were not automated, grouped by reason:

**Blocked by a defect already filed (19 cases).** `DT-FR03-010` to `DT-FR03-012`, `DT-FR03-014` to `DT-FR03-020`, `DT-FR03-027`, `BVA-FR03-001`, `BVA-FR03-003`, `BVA-FR03-005`, `BVA-FR03-006`, `BVA-FR03-008` all assert an inline error on step 2 for a wrong OTP length, a non-numeric OTP, or a weak password. Step 2 is non-functional per BUG-FR03-06 and BUG-FR03-07: there is no confirmation field, the reset request never fires, and every error surfaces through `alert()`. Automating them today would re-assert those two defects sixteen times with different inputs rather than test the rule. `DT-FR14-017`, `BVA-FR14-003`, and `BVA-FR14-005` collapse the same way into BUG-FR14-01, which shows that no trim or required validation exists at all. These become automatable once the defects are fixed, and the ids are recorded here so they can be picked up then.

**Requires a backend or database oracle (9 cases).** `DT-FR03-013` (OTP bound to the requesting email), `DT-FR14-031` (direct `POST`/`DELETE` with a non-admin token), `DT-FR11-025`, `DT-FR14-005`, `DT-FR14-011`, `DT-FR14-023`, `DT-FR14-024`, `DT-FR14-025`, `DT-FR14-026`. These depend on server-side enforcement, endpoint failure modes, or a real session expiring. HW02 scoped these features to a UI-only oracle, and a fixture that forced the outcome would be exactly the tautology removed from this suite in section 6.1; they belong to API-level testing.

**Belongs to another feature (8 cases).** `DT-FR03-026` and `DT-FR03-028` are FR-01 registration and FR-02 login-page checks; `DT-FR11-030` and `DT-FR11-031` are FR-04 profile phone validation; `DT-FR11-028` is the FR-10 cancel transition; `DT-FR14-007` and `DT-FR14-032` are FR-13/FR-15 dashboard and product tabs; `BVA-FR03-011` needs an `a@b.co` account seeded into the real user table.

**Malformed-fixture robustness, deferred (12 cases).** `DT-FR11-015`, `DT-FR11-016`, `DT-FR11-020`, `DT-FR11-021`, `DT-FR11-023`, `DT-FR11-026`, `BVA-FR11-004`, `BVA-FR11-006`, `BVA-FR11-012`, `BVA-FR11-015`, `DT-FR14-027`, `BVA-FR14-011` feed impossible values — a negative total, a null date, an unknown status code, id `0`. They are legitimate robustness checks and are the highest-value group to automate next, because the single case of this kind that was automated (`FR11-AUTO-012-02`, unparseable date) found BUG-FR11-03 immediately.

**Low-yield duplication of an automated case (10 cases).** `DT-FR03-004` and `DT-FR14-014` re-run an automated flow with Enter instead of a click; `DT-FR03-024` is back-to-login from step 2, already covered by BUG-FR03-02; `DT-FR11-003` and `DT-FR14-010` restate navigation and row-count assertions; `DT-FR14-018` is a duplicate-name case whose expected result HW02 itself left open; `BVA-FR11-005`, `BVA-FR14-009`, `BVA-FR14-010`, `BVA-FR14-012` restate id and row-count assertions already made. These were traded for the browser matrix and the boundary datasets.

**Presentation detail, deliberately not asserted (4 cases).** `DT-FR11-029` (exactly one `<h1>`) and `DT-FR14-028`, `DT-FR14-029`, `DT-FR14-030` (admin form label and error placement). An early version of the suite did assert `<h1>`, and it produced a false defect against a page that legitimately uses `<h2>`; the assertion was removed rather than kept as noise. See section 6.1.

## 10. Limitations and Remaining Student Actions

- Network fixtures make edge-state UI tests deterministic; they do not replace separate backend/API authorization testing.
- Two defects are UI-contract findings observed behind a fixture (BUG-FR03-05 OTP length, BUG-FR11-01 ownership filtering). Confirming whether the backend shares the defect requires API-level testing that is out of scope here.
- The narrated Vietnamese video, `whoami`/`hostname` evidence, and the YouTube links require the student.
- The assignment requires at least eight meaningful test-script commits over at least four real days. Commit count is genuine, but the calendar spread cannot be manufactured retroactively.

## 11. Reproduction Commands

```powershell
cd HW04-AI\automation
npm install
npm run validate:data
npm run test:matrix
npm run validate:reports
```
