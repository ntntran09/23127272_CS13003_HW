# Prompt 04 — Remove the mis-assigned earlier selection

| Field | Value |
| --- | --- |
| Tool | Codex |
| Date | 2026-08-23 |
| Stage | Cleanup of mis-assigned selection |
| Source | ../AI docs/evidence/current-selection-session/codex-interaction-log.md#interaction-4 |

## Prompt

```text
Because of a human error in the group's API split, I reworked this assignment
several times. Keep only the current version (member 1's FR-02 / FR-07 / FR-15)
and remove the artifacts, evidence, PDFs, and audit that belong solely to the
earlier, mis-assigned FR-03 / FR-11 / FR-14 selection. Be careful not to delete
anything the current version still depends on.
```

## AI output (summary)

Distinguished current evidence from stale evidence, then removed the artifacts,
evidence folders, PDFs, prior AI audit, commit log, PDF-build script, and builder
branches that belonged only to the earlier FR-03/FR-11/FR-14 selection. Confirmed
that no residual `FR-03/FR-11/FR-14` references remain outside the assignment
brief and the reference inventory, and that the catalog, unit tests (3/3), and
Postman build-check still pass. Deleted files remain recoverable from Git history.

Evidence: working-tree state; the `README.md` note recording the removal and the
instruction to recreate the audit, Appendix A, PDFs, and commit log from the
current selection.
