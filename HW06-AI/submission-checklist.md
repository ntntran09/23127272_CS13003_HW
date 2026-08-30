# HW06 Submission Checklist

## Ready now

- [x] Assignment read.
- [x] SUT requirements, API specification, source, database, and commit inspected.
- [x] Reusable `generate-eshop-api-tests` skill created and validated.
- [x] Catalog validator and Postman builder unit-tested.
- [x] Report/catalog/Postman/Newman artifacts created.
- [x] Generator pseudocode created.
- [x] Reusable Newman CI evidence skill created and validated.
- [x] AI audit scaffold created.

## Student/API gate

- [x] Select one Pool A API: FR-02 login.
- [x] Select one Pool B API: FR-07 add to cart.
- [x] Select one Pool C API: FR-15 create product.
- [x] Confirm revised allocation: student took member 1's row.
- [x] Reviewed and confirmed the selection is unique within the group (FR-02 / FR-07 / FR-15).

## Per API

- [x] At least 35 AI-generated cases.
- [x] Every AI case has a preliminary VALID/INVALID/INCOMPLETE label, reasoning, and fix.
- [x] Student reviewed/adopted the 5 extension candidates per API; six were strengthened so the assertion matches the case intent (A-STU-036/037, B-STU-036/037/038, C-STU-038).
- [x] Domain partitions and boundaries complete.
- [x] State transitions/preconditions complete.
- [x] Security and exact response schemas complete.
- [x] Executed with `X-Student-Id: 23127272`.
- [x] Genuine Newman evidence retained.
- [x] Confirmed bugs reported in Markdown and as GitHub Issues #57-#65 on `ntntran09/eshop-sut`, with screenshots in `reports/screenshots/`.

## Final submission

- [x] Main report Markdown updated for revised selection.
- [x] Main report PDF regenerated (`output/pdf/23127272_HW06_Main_Report.pdf`).
- [x] AI Audit Report rebuilt for the revised FR-02/FR-07/FR-15 selection (Markdown + PDF `output/pdf/23127272_HW06_AI_Audit.pdf`, with AI critique appended).
- [x] Appendix A rebuilt for the revised selection: index + one file per substantive interaction, prompts polished, generic turns excluded.
- [x] AI Critique rebuilt for the revised selection (290 words). Inclusion in main PDF pending.
- [x] Excel test cases and summary generated (`reports/23127272_HW06_test_cases.xlsx`).
- [x] Postman collection, environment, Newman HTML/JSON/CLI evidence.
- [x] Actual Postman features listed; unproven optional features excluded.
- [x] CI workflow configured and locally validated for passing/deliberate-failure modes.
- [x] CI run links and screenshots captured: green (success) run 33294118082 and red (one failing case) run 33294123072 on `ntntran09/23127272_CS13003_HW`; screenshots in `reports/screenshots/ci/`.
- [x] Student self-drawn diagram PNG and editable source (`test-generator/23127272_HW06_test_generator_diagram.png` + `.excalidraw`).
- [x] Demo video: <https://youtu.be/EbAGZ3QOC1U>.
- [x] Git commit log text file (`git-commit-log.txt`).
- [x] README counts and provisional self-assessment reconciled.
- [ ] Final ZIP name follows `23127272_HW06_AI_API_<grade>.zip`.
