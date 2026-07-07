# FR-02 AI Output vs Final File Comparison

## Evidence

- AI interaction evidence: `../evidence/fr-incomplete-review/codex-chat-logs/codex-chat-log.md`, especially Interaction 1-4.
- Final student-edited file: `../../../main report/FR-02-mobile-domain-testing.md`.
- Limitation: no separate standalone AI-original FR-02 Markdown file is available in the current repository or git history. This comparison therefore uses the exported Codex transcript as evidence for the AI output and compares it against the current submitted file.

## Verdict

`INCOMPLETE`

## Important Differences

- The earlier AI-assisted FR-02 work was too narrow around the mobile login surface. The final file keeps the mobile focus but adds supplemental web-login cases `DT-FR02-WEB-001` and `DT-FR02-WEB-002`.
- The final file corrects the test oracle to use the README/spec requirement instead of accepting the current buggy UI text. For example, the expected login action is no longer treated as literal `Sign In` when the requirement expects a localized login action.
- The final file records results directly in the main domain/BVA tables instead of appending a separate Section 11. This matches the student's requested report format.
- The final file strengthens validation and UI-quality coverage: email keyboard, empty/malformed input validation, lockout feedback, network error feedback, error placement, and web login password masking.
- The final bug report adds `BUG-FR02-010` for the web login page. This was missed by the initial mobile-only framing.

## Why The Changes Matter

FR-02 is a login and lockout feature, so the test oracle must come from the feature contract: failed attempts increment by 1, lockout begins after 3 failures, lockout lasts 30 seconds, and email/password controls must behave safely. The initial AI output was useful but incomplete because it followed the selected mobile boundary too literally and missed related web login behavior that affects the same authentication requirement. Human review expanded the coverage and aligned expected results with the assignment requirement instead of current implementation bugs.

## Student Fix Summary

The student reviewed the AI output, corrected spec-based expected results, added missing mobile/web login cases, and integrated PASS/FAIL results into the main FR-02 report tables. See `../../../main report/FR-02-mobile-domain-testing.md`.
