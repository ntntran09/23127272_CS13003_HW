# CI Evidence Runbook

Use this only after the workflow and full reviewed collection pass locally against a corrected SUT commit.

## Passing run

1. Put the workflow on the repository's default branch. GitHub only exposes `workflow_dispatch` there.
2. Preserve the exact homework commit and corrected SUT commit. Do not use a moving branch name as final evidence.
3. Dispatch `evidence_mode=passing` with the corrected SUT repository and commit.
4. Confirm generator checks, catalog validation, SUT startup, and the full Newman run all pass.
5. Save the commit URL, workflow-run URL, input values, green summary screenshot, and uploaded Newman artifacts.

## Deliberate-failure run

1. Use the same corrected SUT commit and unchanged reviewed collection.
2. Dispatch `evidence_mode=deliberate-failure`.
3. Confirm the full reviewed collection passes first.
4. Confirm `CI-FAIL-001` produces exactly one failed assertion named `DELIBERATE FAILURE - controlled CI evidence`.
5. Confirm the verifier accepts the Newman JSON and the workflow is red by design.
6. Save the commit URL, workflow-run URL, input values, red summary screenshot, console failure detail, and uploaded artifacts.

If the rubric strictly requires two sample commits, create a temporary evidence branch only after student approval: one commit for the passing sample and one commit that selects the opt-in failure mode. Revert or delete the temporary failure commit after recording it. Never leave a false oracle in the normal collection.

## Stop conditions

- More than one assertion fails: stop and diagnose; do not label it the controlled sample.
- The full reviewed collection fails before `CI-FAIL-001`: stop; the SUT is not a valid passing baseline.
- No corrected SUT commit exists: report that green evidence is blocked. Do not weaken tests.
- Missing run URL, screenshot, or artifact: keep the submission checklist incomplete.
