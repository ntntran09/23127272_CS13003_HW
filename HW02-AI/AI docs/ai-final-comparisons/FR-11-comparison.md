# FR-11 AI Output vs Final File Comparison

## Evidence

- AI interaction evidence: `../evidence/fr03-reset/codex-chat-logs/codex-chat-log.md`, Interaction 3.
- Follow-up correction evidence: `../evidence/fr-incomplete-review/codex-chat-logs/codex-chat-log.md`, Interaction 1-4.
- Final student-edited file: `../../../main report/FR-11-domain-testing.md`.
- Limitation: no separate standalone AI-original FR-11 Markdown file is available in the current repository or git history. This comparison uses the transcript output and the final file.

## Verdict

`INCOMPLETE`

## Important Differences

- The initial AI output framed FR-11 as UI + API and highlighted a public `GET /api/orders/:id` risk. The final file is UI-only and focuses on user-visible order-history behavior.
- The final file covers order-history rendering for zero, one, and many orders; owner-only visibility; order id/date/total/status display; Vietnamese status labels; and status color distinction.
- Human review added missing cases around shipping-order cancellation, malformed status/date/amount data, fetch failure display, and shared profile-page phone validation.
- The final file corrected expected outputs to use README/spec oracles, especially that `shipping` orders should not expose a cancel action.
- The final bug report adds backend cancellation and profile validation bugs that a narrow UI table review could miss.

## Why The Changes Matter

FR-11 is privacy-sensitive because a user must see only their own order history. It is also a rendering feature, so malformed states such as missing status, invalid date, or missing amount need safe visible behavior. The initial AI output was useful but incomplete because it mixed API scope into a UI deliverable and missed adjacent profile-page behavior that affects the same screen. Human review made the scope clearer and added cross-feature state-machine checks from FR-10.

## Student Fix Summary

The student converted the report to a UI-only artifact, added missing rendering/state cases, corrected the shipping-order cancel oracle, and recorded final PASS/FAIL outcomes in the main FR-11 tables. See `../../../main report/FR-11-domain-testing.md`.
