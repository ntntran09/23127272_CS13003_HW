# FR-03 AI Output vs Final File Comparison

## Evidence

- AI interaction evidence: `../evidence/fr03-reset/codex-chat-logs/codex-chat-log.md`, Interaction 2.
- Follow-up correction evidence: `../evidence/fr-incomplete-review/codex-chat-logs/codex-chat-log.md`, Interaction 1-4.
- Final student-edited file: `../../../main report/FR-03-domain-testing.md`.
- Limitation: no separate standalone AI-original FR-03 Markdown file is available in the current repository or git history. This comparison uses the transcript output and the final file.

## Verdict

`INCOMPLETE`

## Important Differences

- The initial AI output produced FR-03 as a UI + API report. The final file narrows the selected surface to UI only, matching the later report direction.
- The final file keeps the domain-testing pipeline but focuses the oracle on visible controls, messages, navigation, and browser-visible state rather than direct database/API assertions.
- The final file adds and/or emphasizes missing UI cases for the forgot-password page: login-page recovery entry, missing step indicator, missing back-to-login action, 6-digit OTP boundary, missing confirm-password field, flawed strong-password validation, alert-vs-inline error feedback, and heading structure.
- The final file integrates review results into the main test tables instead of leaving a separate supplemental section.
- The bug report summarizes 8 FR-03 bugs, especially OTP length, confirm password, password regex, navigation, and inline error handling.

## Why The Changes Matter

FR-03 is specified as a two-step user recovery flow. For a UI-only submission, direct API/database checks would not be the correct primary oracle. The final file corrects this by testing what the user can observe: step transition, OTP display, field validation, confirmation, and navigation. Human review also caught that the current implementation generates a 4-digit OTP and lacks confirmation password, both of which are central boundary and domain failures.

## Student Fix Summary

The student narrowed the report to UI-only testing, removed inappropriate API emphasis, added missing UI/BVA cases, and recorded final results in the main FR-03 tables. See `../../../main report/FR-03-domain-testing.md`.
