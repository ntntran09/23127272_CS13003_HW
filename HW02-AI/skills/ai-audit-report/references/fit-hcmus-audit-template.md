# FIT@HCMUS AI Audit Report Template

Use this structure for Software Testing homework audit appendices.

```markdown
**Faculty of Information Technology (FIT) - Ho Chi Minh City University of Science (HCMUS)**

**CS423 / CSC13003 - Software Testing (AI-augmented - 2026)**

**AI POLICY - TEMPLATES - 2026 v1.0**

# AI Audit Report - 5-section Template per Artifact

*Mandatory appendix for every AI-assisted homework.*

## 1. Student Information

| Field | Value |
| :---- | :---- |
| **Student name (printed):** | <student-name> |
| **Student ID:** | <student-id> |
| **Class / Cohort:** | <class-or-cohort> |
| **Assignment ID:** | <assignment-id> |
| **Assignment date:** | <assignment-date> |
| **AI tool(s) used:** | <tools-used> |
| **AI used in this assignment:** | Yes / No |

## 2. Instructions

* Add one row per AI-generated artifact or AI-assisted interaction.
* Paste the verbatim prompt. Do not paraphrase.
* Paste the verbatim final AI output, an excerpt with a file reference, or a labelled screenshot reference.
* Do not include the AI thinking process, hidden reasoning, progress updates, tool logs, or drafting process in the AI Output column.
* Tag the verdict: VALID / INVALID / INCOMPLETE.
* Reasoning should cite course material, ISTQB, assignment requirements, or technical documentation.
* Show the corrected artifact or state the required student fix.
* If the student edited an AI-generated file directly, compare the AI original with the final file and cite the comparison report.

## 3. Audit Table - one row per artifact

| (1) Prompt + Tool | (2) AI Output | (3) Verdict | (4) Reasoning | (5) Student Fix |
| :---- | :---- | :---- | :---- | :---- |
| **Tool:** <tool><br>**Time:** <timestamp><br>**Prompt:** "<prompt>" | <verbatim final output, excerpt, or file reference> | VALID / INVALID / INCOMPLETE | <why this condition is correct> | <correction or None> |
| **Tool:** <tool><br>**Time:** <timestamp><br>**Prompt:** "<prompt>" | <AI original output or original file reference> | INCOMPLETE / INVALID | <why the original needed student review and correction> | Final file differs from AI original: <key changes>. See `<comparison-report-path>`. |

## 4. AI Use Declaration

I use AI tools for the following tasks: <summary of AI-assisted work>.

OR:

I do not use any AI help in this exercise.

## 5. Signature / Submission Checklist

| Item | Status |
| :---- | :---- |
| Every AI-assisted artifact has a prompt | Done / Missing |
| Every AI-assisted artifact has output evidence | Done / Missing |
| Every output has a verdict | Done / Missing |
| Invalid or incomplete outputs have student fixes | Done / Missing |
| AI-original vs final-file comparisons attached when applicable | Done / Not applicable |
| Codex/chat transcript attached when requested | Done / Not requested |

**Student confirmation:** I reviewed all AI-generated material and remain responsible for the correctness of the submitted work.
```

Notes:

- Keep `Tool`, `Time`, and `Prompt` together in column 1.
- Keep column 2 focused on the final AI answer or final generated artifact only.
- Use `<br>` inside table cells to avoid broken Markdown tables.
- Use `None` in `Student Fix` only for `VALID` rows.
- If an AI output is very long, store the full transcript in the folder and cite it as `See codex-chat-logs/codex-chat-log.md, Interaction N`.
- If a final edited file exists, summarize the important human edits and cite the comparison report rather than pasting a full diff into the audit table.
