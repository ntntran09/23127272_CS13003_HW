#!/usr/bin/env python3
"""Export deterministic HW06 summaries from the reviewed catalog and Newman JSON."""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "test-design" / "test-cases.json"
NEWMAN = ROOT / "reports" / "newman-report.json"


BUGS = [
    ("BUG-01", "FR-03", "Forgot-password returns a four-digit OTP instead of six digits", ["A-AI-001", "A-AI-013", "A-STU-036"], "High"),
    ("BUG-02", "FR-03", "Password reset accepts missing or weak passwords", ["A-AI-020", "A-AI-023", "A-AI-024", "A-AI-025", "A-AI-026", "A-AI-027", "A-AI-028", "A-AI-029", "A-AI-032", "A-STU-039"], "Critical"),
    ("BUG-03", "FR-03", "Forgot-password does not validate malformed email input", ["A-AI-003", "A-AI-004", "A-AI-005", "A-AI-006", "A-AI-007", "A-AI-008", "A-AI-009"], "Medium"),
    ("BUG-04", "Cross-cutting", "Malformed JSON returns an HTML error page instead of the API error schema", ["A-AI-033", "C-AI-018"], "Medium"),
    ("BUG-05", "FR-11", "Order detail is publicly readable and exposes another user's order (IDOR)", ["B-AI-018", "B-AI-019", "B-STU-037"], "Critical"),
    ("BUG-06", "FR-11", "A shipping order can be canceled and its persisted state becomes canceled", ["B-AI-027", "B-STU-036"], "High"),
    ("BUG-07", "FR-11/supporting checkout", "Negative order totals enter history as valid-looking orders", ["B-STU-039"], "High"),
    ("BUG-08", "FR-14", "Normal users can create, update, and delete categories", ["C-AI-008", "C-AI-021", "C-AI-032", "C-STU-037"], "Critical"),
    ("BUG-09", "FR-14", "Category create/update accepts missing, empty, whitespace, null, or numeric names", ["C-AI-009", "C-AI-010", "C-AI-011", "C-AI-012", "C-AI-013", "C-AI-026", "C-STU-036"], "High"),
    ("BUG-10", "FR-14", "Category update/delete reports success for nonexistent or invalid identifiers", ["C-AI-022", "C-AI-023", "C-AI-024", "C-AI-025", "C-AI-027", "C-AI-033", "C-AI-034", "C-AI-035", "C-STU-040"], "High"),
]


def response_text(response: dict) -> str:
    stream = response.get("stream")
    if isinstance(stream, dict) and isinstance(stream.get("data"), list):
        return bytes(stream["data"]).decode("utf-8", errors="replace")
    if isinstance(stream, list):
        return bytes(stream).decode("utf-8", errors="replace")
    return str(stream or "")


def request_url(request: dict) -> str:
    url = request.get("url", {})
    protocol = url.get("protocol", "http")
    host = ".".join(url.get("host", []))
    port = f":{url['port']}" if url.get("port") else ""
    path = "/" + "/".join(url.get("path", []))
    return f"{protocol}://{host}{port}{path}"


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    run = json.loads(NEWMAN.read_text(encoding="utf-8"))["run"]
    failure_by_id: dict[str, list[dict]] = defaultdict(list)
    for failure in run.get("failures", []):
        name = failure.get("source", {}).get("name", "")
        match = re.match(r"([ABC]-(?:AI|STU)-\d{3})\b", name)
        if match:
            failure_by_id[match.group(1)].append(failure)

    cases = []
    for api in catalog["apis"]:
        for case in api["cases"]:
            manual = case.get("automation") == "MANUAL"
            status = "NOT RUN" if manual else ("FAILED" if case["id"] in failure_by_id else "PASSED")
            cases.append({
                "pool": api["pool"], "api_id": api["api_id"], "feature": api["feature"],
                "id": case["id"], "origin": case["origin"], "title": case["title"],
                "coverage": ", ".join(case["coverage"]),
                "equivalence_classes": ", ".join(case["equivalence_classes"]),
                "expected_status": "/".join(map(str, case["expected"]["status"])),
                "automation": case.get("automation", "AUTOMATED"),
                "audit_verdict": case["audit"]["verdict"],
                "audit_reason": case["audit"]["reason"],
                "student_fix": case["audit"].get("fix", "None"),
                "result": status,
                "failure_count": len(failure_by_id.get(case["id"], [])),
            })

    summary = {}
    for pool in "ABC":
        selected = [case for case in cases if case["pool"] == pool]
        counts = Counter(case["result"] for case in selected)
        summary[pool] = {
            "total": len(selected),
            "ai_generated": sum(case["origin"] == "AI" for case in selected),
            "student_added": sum(case["origin"] == "STUDENT" for case in selected),
            "executed": counts["PASSED"] + counts["FAILED"],
            "passed": counts["PASSED"],
            "failed": counts["FAILED"],
            "not_run": counts["NOT RUN"],
        }
    summary["total"] = {key: sum(summary[pool][key] for pool in "ABC") for key in summary["A"]}
    summary["newman"] = run["stats"]
    summary["confirmed_bug_groups"] = len(BUGS)
    (ROOT / "reports" / "test-summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with (ROOT / "reports" / "test-case-results.csv").open("w", newline="", encoding="utf-8-sig") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(cases[0]))
        writer.writeheader()
        writer.writerows(cases)

    md = ["# HW06 Test Case Catalog and Execution Results", "", "The reviewed catalog contains 40 cases per selected API: 35 AI-generated cases and 5 student-origin extensions adapted from HW02/HW04 evidence. `NOT RUN` is reserved for the OTP-expiry case that needs a controllable clock or a real wait fixture.", ""]
    for api in catalog["apis"]:
        md += [f"## Pool {api['pool']} - {api['api_id']} - {api['feature']}", "", f"Contract: {api['contract']}", "", "| ID | Origin | Title | Coverage | ECs | Expected status | Result |", "| --- | --- | --- | --- | --- | --- | --- |"]
        for case in [row for row in cases if row["pool"] == api["pool"]]:
            title = case["title"].replace("|", "\\|")
            md.append(f"| {case['id']} | {case['origin']} | {title} | {case['coverage']} | {case['equivalence_classes']} | {case['expected_status']} | {case['result']} |")
        md.append("")
    (ROOT / "test-design" / "test-cases.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    smd = ["# Newman Test Summary", "", "Local execution: pinned EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` at `http://127.0.0.1:3001`.", "", "| Metric | Pool A | Pool B | Pool C | Total |", "| --- | ---: | ---: | ---: | ---: |"]
    for key, label in [("total", "Designed"), ("ai_generated", "AI-generated"), ("student_added", "Student-added"), ("executed", "Executed"), ("passed", "Passed"), ("failed", "Failed"), ("not_run", "Not run")]:
        smd.append(f"| {label} | {summary['A'][key]} | {summary['B'][key]} | {summary['C'][key]} | {summary['total'][key]} |")
    smd += ["", f"Newman executed {run['stats']['items']['total']} sequential request items (setup + test requests), with {run['stats']['assertions']['total']} assertions and {run['stats']['assertions']['failed']} failed assertions. Setup and script failures: 0. Failed cases are retained as genuine contract-deviation evidence, not changed to match the implementation.", ""]
    (ROOT / "reports" / "test-summary.md").write_text("\n".join(smd), encoding="utf-8")

    execution_by_name = {}
    for execution in run.get("executions", []):
        name = execution.get("item", {}).get("name", "")
        match = re.match(r"([ABC]-(?:AI|STU)-\d{3})\b", name)
        if match and any(str(assertion.get("assertion", "")).startswith(match.group(1)) for assertion in execution.get("assertions", [])):
            execution_by_name[match.group(1)] = execution

    bug_md = ["# HW06 Bug Reports", "", "These are locally reproduced issue drafts. Each must receive a student-captured screenshot and a public GitHub Issue URL before submission.", "", "| ID | Feature | Severity | Title | Test IDs | GitHub Issue | Screenshot |", "| --- | --- | --- | --- | --- | --- | --- |"]
    for bug_id, feature, title, ids, severity in BUGS:
        bug_md.append(f"| {bug_id} | {feature} | {severity} | {title} | {', '.join(ids)} | STUDENT ACTION | STUDENT ACTION |")
    for bug_id, feature, title, ids, severity in BUGS:
        representative = next((case_id for case_id in ids if case_id in execution_by_name), None)
        bug_md += ["", f"## {bug_id} - {title}", "", f"- Severity: **{severity}**", f"- Feature: `{feature}`", f"- Reproduced by: `{', '.join(ids)}`", "- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026", "- Expected: The request follows the reviewed EShop contract and security/state rules.", "- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report."]
        if representative:
            execution = execution_by_name[representative]
            body = response_text(execution["response"]).replace("\n", " ")[:500]
            bug_md += [f"- Representative evidence (`{representative}`): `{execution['request']['method']} {request_url(execution['request'])}` -> HTTP `{execution['response']['code']}`", "", "```json", body, "```"]
        bug_md += ["", "Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**", "", "GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**"]
    (ROOT / "bug-reports.md").write_text("\n".join(bug_md) + "\n", encoding="utf-8")

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
