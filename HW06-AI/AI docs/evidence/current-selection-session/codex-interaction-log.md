# Codex Interaction Log — Current Selection (FR-02 / FR-07 / FR-15)

This log preserves the substantive AI interactions that produced the **current**
HW06 submission for member 1's API allocation (Pool A FR-02 login, Pool B FR-07
add-to-cart, Pool C FR-15 create-product).

- **Tool:** OpenAI Codex (with Context7 documentation lookups)
- **Source transcripts (raw backups, machine-local):**
  - `~/.codex/sessions/2026/08/18/rollout-2026-08-18T14-45-12-*.jsonl`
  - `~/.codex/sessions/2026/08/29/rollout-2026-08-29T13-35-11-*.jsonl`
- **What is excluded (per course audit policy):** session bootstrap turns,
  auto-injected instruction bodies, plugin lists, environment context,
  progress-only messages, tool output, and hidden reasoning.

The prompts below are lightly edited from the original (mixed Vietnamese)
for clarity and professional presentation; their intent is unchanged. Long
outputs are summarised and cross-referenced to the committed artifacts, which
are the authoritative record of what was produced.

---

## Interaction 1 — Set up the reusable generator and scaffold (2026-08-18)

**Prompt (original intent):** *Read the HW06 assignment specification and build a
reusable Agent Skill that drives the API-testing pipeline; then begin the work.*

**AI output (summary):** Created `skills/generate-eshop-api-tests/` (skill
instructions, catalog validator, Postman builder, unit tests, template) plus the
report/catalog/environment scaffolds. Stopped at the API-selection gate rather
than inventing the three APIs. Evidence: `skills/generate-eshop-api-tests/`,
commit `c860a0e`.

---

## Interaction 2 — Select member 1's APIs and regenerate everything (2026-08-18T07:45Z)

**Prompt (original intent):** *New task split — I am taking member 1's APIs.*

**AI output (verbatim summary of the delivered result):**

> Switched to member 1's selection:
> - Pool A: FR-02 — `POST /api/login`
> - Pool B: FR-07 — `POST /api/cart`
> - Pool C: FR-15 — `POST /api/products`
>
> Regenerated the full catalog (40 × 3 = 120 cases; 119 automated + 1 manual
> 30-second lockout-expiry case), the Postman collection, the main report, the
> bug reports, and the README. Real Newman run: **120 designed, 119 executed,
> 46 passed, 73 failed, 1 manual; 212 requests, 457 assertions; zero
> request/pre-request/script failures; 9 reproducible bug groups.** Oracle kept
> to the README/specification (buggy behaviour is never used as the oracle).
> Validator passed; generator unit tests 3/3.

Evidence: `test-design/test-cases.json`, `postman/`, `reports/`, `bug-reports.md`.

---

## Interaction 3 — Isolate a clean SUT instance for deterministic execution (2026-08-18)

**Prompt (original intent):** *Automate and execute the selected cases and give
me verified results.*

**AI output (summary):** The first run was invalid — it used a stale collection
because the build command executed from the wrong working directory, and the
existing SUT process on port 3000 could not be reset due to Windows file locks.
The invalid evidence was discarded. A clean SUT instance was started from the
same pinned source commit on `127.0.0.1:3001`, and the suite was re-run
deterministically. Evidence: `automation/run-sut-3001.js`, `reports/newman-cli.txt`.

---

## Interaction 4 — Remove the mis-assigned earlier selection (2026-08-23T00:43Z)

**Prompt (original intent):** *Because of a human error in the group API split I
redid the work several times. Delete everything that does not belong to the
current version (member 1's FR-02/FR-07/FR-15) so only the current version
remains.*

**AI output (summary):** Removed the artifacts, evidence, PDFs, audit, commit
log, and builder branches that belonged only to the earlier, mis-assigned
FR-03/FR-11/FR-14 selection, after distinguishing current evidence from stale
evidence. Confirmed no residual `FR-03/FR-11/FR-14` references remain outside the
assignment brief and the reference inventory. Deleted files remain recoverable
from Git history. Evidence: working-tree state; `README.md` note.

---

## Interaction 5 — CI/CD pipeline and reusable evidence skill (2026-08-29)

**Prompt (original intent):** *Set up the CI/CD pipeline (Newman in GitHub
Actions) against my own fork of the SUT, and package it as a reusable skill.
Do not touch the upstream repository.*

**AI output (summary):** Added `.github/workflows/hw06-api.yml` (manual workflow
with `passing` and `deliberate-failure` modes, targeting the student's fork) and
the reusable `skills/setup-newman-ci-evidence/` skill with a deterministic
one-failure verifier. Validated locally: `actionlint` passed, generator tests
3/3, catalog validation passed, CI verifier tests 4/4. Remote run links and
screenshots remain student actions. Evidence: `.github/workflows/hw06-api.yml`,
`skills/setup-newman-ci-evidence/`, `ci-cd-report.md`.
