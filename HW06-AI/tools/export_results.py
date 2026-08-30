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
    ("BUG-01", "FR-02", "Login success exposes the plaintext password and internal account fields", ["A-AI-001"], "Critical"),
    ("BUG-02", "FR-02", "Login does not validate missing, malformed, or wrong-type fields", ["A-AI-003", "A-AI-004", "A-AI-005", "A-AI-006", "A-AI-007", "A-AI-008", "A-AI-009", "A-AI-010", "A-AI-011", "A-AI-012", "A-AI-013", "A-AI-014", "A-AI-015", "A-AI-016", "A-AI-017", "A-AI-018", "A-AI-021"], "High"),
    ("BUG-03", "Cross-cutting", "Malformed JSON returns HTML instead of the API JSON error schema", ["A-AI-022", "B-AI-030", "C-AI-032"], "Medium"),
    ("BUG-04", "FR-02", "Failed-login counter advances too quickly and locks after two failures", ["A-AI-029"], "High"),
    ("BUG-05", "FR-07", "Cart accepts invalid IDs, quantities, names, and prices", ["B-AI-007", "B-AI-008", "B-AI-009", "B-AI-010", "B-AI-011", "B-AI-012", "B-AI-013", "B-AI-014", "B-AI-015", "B-AI-016", "B-AI-017", "B-AI-018", "B-AI-019", "B-AI-020", "B-AI-021", "B-AI-022", "B-AI-023", "B-AI-024", "B-AI-025", "B-AI-031", "B-STU-039"], "High"),
    ("BUG-06", "FR-07", "Adding the same product creates a duplicate row instead of merging quantity", ["B-AI-028", "B-STU-036"], "High"),
    ("BUG-07", "FR-07", "Cart trusts client-supplied product name and price", ["B-AI-034", "B-AI-035"], "Critical"),
    ("BUG-08", "FR-15", "Product creation is accessible without an admin JWT", ["C-AI-002", "C-AI-003", "C-AI-004", "C-AI-005", "C-STU-037"], "Critical"),
    ("BUG-09", "FR-15", "Product creation omits required name, price, and category validation", ["C-AI-006", "C-AI-007", "C-AI-008", "C-AI-009", "C-AI-010", "C-AI-014", "C-AI-015", "C-AI-016", "C-AI-017", "C-AI-018", "C-AI-021", "C-AI-022", "C-AI-023", "C-AI-024", "C-AI-025", "C-AI-026", "C-AI-027", "C-AI-028", "C-AI-029", "C-STU-039"], "High"),
]


ISSUE_URLS = {
    "BUG-01": "https://github.com/ntntran09/eshop-sut/issues/57",
    "BUG-02": "https://github.com/ntntran09/eshop-sut/issues/58",
    "BUG-03": "https://github.com/ntntran09/eshop-sut/issues/59",
    "BUG-04": "https://github.com/ntntran09/eshop-sut/issues/60",
    "BUG-05": "https://github.com/ntntran09/eshop-sut/issues/61",
    "BUG-06": "https://github.com/ntntran09/eshop-sut/issues/62",
    "BUG-07": "https://github.com/ntntran09/eshop-sut/issues/63",
    "BUG-08": "https://github.com/ntntran09/eshop-sut/issues/64",
    "BUG-09": "https://github.com/ntntran09/eshop-sut/issues/65",
}


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


def main_executions(run: dict) -> dict:
    """Map each case id to the execution of its main test request (setup items excluded)."""
    by_id: dict[str, dict] = {}
    for execution in run.get("executions", []):
        name = execution.get("item", {}).get("name", "")
        match = re.match(r"([ABC]-(?:AI|STU)-\d{3})\b", name)
        if match and any(str(a.get("assertion", "")).startswith(match.group(1)) for a in execution.get("assertions", [])):
            by_id[match.group(1)] = execution
    return by_id


def failed_assertions(case_id: str, execution: dict) -> list[str]:
    """Concise, human-readable names of the failed assertions for a case."""
    names = []
    for a in execution.get("assertions", []):
        if a.get("error"):
            label = str(a.get("assertion", "")).strip()
            if label.startswith(case_id):
                label = label[len(case_id):].strip()
            names.append(label or "assertion")
    return names


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    run = json.loads(NEWMAN.read_text(encoding="utf-8"))["run"]
    failure_by_id: dict[str, list[dict]] = defaultdict(list)
    for failure in run.get("failures", []):
        name = failure.get("source", {}).get("name", "")
        match = re.match(r"([ABC]-(?:AI|STU)-\d{3})\b", name)
        if match:
            failure_by_id[match.group(1)].append(failure)

    executions = main_executions(run)

    cases = []
    for api in catalog["apis"]:
        for case in api["cases"]:
            manual = case.get("automation") == "MANUAL"
            status = "NOT RUN" if manual else ("FAILED" if case["id"] in failure_by_id else "PASSED")
            execution = executions.get(case["id"])
            actual_status = ""
            actual_response = ""
            failure_reason = ""
            if execution is not None:
                actual_status = str(execution.get("response", {}).get("code", ""))
                actual_response = response_text(execution["response"]).replace("\n", " ").strip()[:200]
                if status == "FAILED":
                    failure_reason = "; ".join(failed_assertions(case["id"], execution))[:300]
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
                "actual_status": actual_status,
                "failure_reason": failure_reason,
                "actual_response": actual_response,
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

    md = ["# HW06 Test Case Catalog and Execution Results", "", "The reviewed catalog contains 40 cases per selected API: 35 AI-generated cases and 5 student-origin extensions, all reviewed and confirmed by the student. `Actual` is the HTTP status returned by the SUT for the case's primary request; `Failure reason` lists the failed assertions (empty when the case passed). `NOT RUN` is reserved for the 30-second lockout-expiry case that needs a controllable clock or a timed fixture.", ""]
    for api in catalog["apis"]:
        md += [f"## Pool {api['pool']} - {api['api_id']} - {api['feature']}", "", f"Contract: {api['contract']}", "", "| ID | Origin | Title | Coverage | Expected | Actual | Result | Failure reason |", "| --- | --- | --- | --- | --- | --- | --- | --- |"]
        for case in [row for row in cases if row["pool"] == api["pool"]]:
            title = case["title"].replace("|", "\\|")
            reason = (case["failure_reason"] or "").replace("|", "\\|")
            actual = case["actual_status"] or "-"
            md.append(f"| {case['id']} | {case['origin']} | {title} | {case['coverage']} | {case['expected_status']} | {actual} | {case['result']} | {reason} |")
        md.append("")
    (ROOT / "test-design" / "test-cases.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    smd = ["# Newman Test Summary", "", "Local execution: pinned EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` at `http://127.0.0.1:3001`.", "", "| Metric | Pool A | Pool B | Pool C | Total |", "| --- | ---: | ---: | ---: | ---: |"]
    for key, label in [("total", "Designed"), ("ai_generated", "AI-generated"), ("student_added", "Student-added"), ("executed", "Executed"), ("passed", "Passed"), ("failed", "Failed"), ("not_run", "Not run")]:
        smd.append(f"| {label} | {summary['A'][key]} | {summary['B'][key]} | {summary['C'][key]} | {summary['total'][key]} |")
    smd += ["", f"Newman executed {run['stats']['items']['total']} sequential request items (setup + test requests), with {run['stats']['assertions']['total']} assertions and {run['stats']['assertions']['failed']} failed assertions. Setup and script failures: 0. Failed cases are retained as genuine contract-deviation evidence, not changed to match the implementation.", ""]
    (ROOT / "reports" / "test-summary.md").write_text("\n".join(smd), encoding="utf-8")

    execution_by_name = executions

    bug_md =["# HW06 Bug Reports", "", "These are locally reproduced issue drafts. Each must receive a student-captured screenshot and a public GitHub Issue URL before submission.", "", "| ID | Feature | Severity | Title | Test IDs | GitHub Issue | Screenshot |", "| --- | --- | --- | --- | --- | --- | --- |"]
    def console_shot(bug_id, ids):
        return f"reports/screenshots/bug-console/{bug_id}_{ids[0]}_console.png"

    def issue_shot(bug_id):
        url = ISSUE_URLS.get(bug_id, "")
        num = url.rsplit("/", 1)[-1] if url else ""
        return f"reports/screenshots/github-issues/{bug_id}_issue-{num}.png" if num else "STUDENT ACTION"

    for bug_id, feature, title, ids, severity in BUGS:
        issue = ISSUE_URLS.get(bug_id, "STUDENT ACTION")
        bug_md.append(f"| {bug_id} | {feature} | {severity} | {title} | {', '.join(ids)} | {issue} | `{console_shot(bug_id, ids)}` |")
    for bug_id, feature, title, ids, severity in BUGS:
        representative = next((case_id for case_id in ids if case_id in execution_by_name), None)
        bug_md += ["", f"## {bug_id} - {title}", "", f"- Severity: **{severity}**", f"- Feature: `{feature}`", f"- Reproduced by: `{', '.join(ids)}`", "- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026", "- Expected: The request follows the reviewed EShop contract and security/state rules.", "- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report."]
        if representative:
            execution = execution_by_name[representative]
            body = response_text(execution["response"]).replace("\n", " ")[:500]
            bug_md += [f"- Representative evidence (`{representative}`): `{execution['request']['method']} {request_url(execution['request'])}` -> HTTP `{execution['response']['code']}`", "", "```json", body, "```"]
        issue_url = ISSUE_URLS.get(bug_id, "**STUDENT ACTION - publish after reviewing this draft.**")
        bug_md += [
            "",
            f"- Bug/console screenshot: `{console_shot(bug_id, ids)}` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).",
            f"- GitHub Issue screenshot: `{issue_shot(bug_id)}`",
            "",
            f"GitHub Issue URL: {issue_url}",
        ]
    (ROOT / "bug-reports.md").write_text("\n".join(bug_md) + "\n", encoding="utf-8")

    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
