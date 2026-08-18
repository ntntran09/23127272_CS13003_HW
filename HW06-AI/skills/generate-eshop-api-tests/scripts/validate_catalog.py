#!/usr/bin/env python3
"""Validate an auditable EShop HW06 API test catalog."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

REQUIRED_POOLS = {"A", "B", "C"}
REQUIRED_COVERAGE = {"domain", "state", "security", "schema"}
REQUIRED_SECS = {f"SEC-0{i}" for i in range(1, 8)}
VERDICTS = {"VALID", "INVALID", "INCOMPLETE"}
ORIGINS = {"AI", "STUDENT"}


def load_catalog(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as stream:
        data = json.load(stream)
    if not isinstance(data, dict):
        raise ValueError("catalog root must be an object")
    return data


def validate_catalog(data: dict[str, Any], allow_partial: bool = False) -> list[str]:
    errors: list[str] = []
    meta = data.get("meta")
    if not isinstance(meta, dict):
        return ["meta must be an object"]
    student_id = str(meta.get("student_id", ""))
    if not re.fullmatch(r"\d{8}", student_id):
        errors.append("meta.student_id must be exactly 8 digits")
    if not str(meta.get("base_url", "")).startswith(("http://", "https://")):
        errors.append("meta.base_url must be an http(s) URL")
    if not re.fullmatch(r"[0-9a-f]{40}", str(meta.get("sut_commit", ""))):
        errors.append("meta.sut_commit must be a 40-character Git SHA")

    apis = data.get("apis")
    if not isinstance(apis, list):
        return errors + ["apis must be an array"]
    if not allow_partial and len(apis) != 3:
        errors.append(f"suite must contain exactly 3 APIs; found {len(apis)}")

    pools = [str(api.get("pool", "")) for api in apis if isinstance(api, dict)]
    if not allow_partial and set(pools) != REQUIRED_POOLS:
        errors.append(f"pools must be exactly A, B, C; found {sorted(set(pools))}")
    if len(pools) != len(set(pools)):
        errors.append("each pool may appear only once")

    global_case_ids: set[str] = set()
    suite_secs: set[str] = set()
    for index, api in enumerate(apis, start=1):
        label = f"apis[{index - 1}]"
        if not isinstance(api, dict):
            errors.append(f"{label} must be an object")
            continue
        api_id = str(api.get("api_id", "")).strip()
        label = api_id or label
        if api.get("pool") not in REQUIRED_POOLS:
            errors.append(f"{label}: pool must be A, B, or C")
        if not str(api.get("feature", "")).strip():
            errors.append(f"{label}: feature is required")
        if not re.fullmatch(r"(?:GET|POST|PUT|PATCH|DELETE)", str(api.get("method", ""))):
            errors.append(f"{label}: method must be an uppercase HTTP method")
        if not str(api.get("path", "")).startswith("/"):
            errors.append(f"{label}: path must start with /")
        if not str(api.get("contract", "")).strip():
            errors.append(f"{label}: contract is required")

        ecs = api.get("equivalence_classes", [])
        if not isinstance(ecs, list):
            errors.append(f"{label}: equivalence_classes must be an array")
            ecs = []
        ec_ids: set[str] = set()
        for ec in ecs:
            if not isinstance(ec, dict) or not str(ec.get("id", "")).strip():
                errors.append(f"{label}: every equivalence class needs an id")
                continue
            ec_id = str(ec["id"])
            if ec_id in ec_ids:
                errors.append(f"{label}: duplicate equivalence class {ec_id}")
            ec_ids.add(ec_id)
            if ec.get("validity") not in {"VALID", "INVALID"}:
                errors.append(f"{label}/{ec_id}: validity must be VALID or INVALID")

        cases = api.get("cases", [])
        if not isinstance(cases, list):
            errors.append(f"{label}: cases must be an array")
            cases = []
        origins = Counter(str(case.get("origin", "")) for case in cases if isinstance(case, dict))
        if not allow_partial and origins["AI"] < 35:
            errors.append(f"{label}: needs at least 35 AI cases; found {origins['AI']}")
        if not allow_partial and origins["STUDENT"] < 5:
            errors.append(f"{label}: needs at least 5 STUDENT cases; found {origins['STUDENT']}")

        api_coverage: set[str] = set()
        covered_ecs: set[str] = set()
        has_schema = False
        for case_index, case in enumerate(cases, start=1):
            case_label = f"{label}/cases[{case_index - 1}]"
            if not isinstance(case, dict):
                errors.append(f"{case_label} must be an object")
                continue
            case_id = str(case.get("id", "")).strip()
            case_label = case_id or case_label
            if not case_id:
                errors.append(f"{case_label}: id is required")
            elif case_id in global_case_ids:
                errors.append(f"duplicate case id {case_id}")
            global_case_ids.add(case_id)

            origin = case.get("origin")
            if origin not in ORIGINS:
                errors.append(f"{case_label}: origin must be AI or STUDENT")
            if origin == "STUDENT" and not str(case.get("missed_by_ai", "")).strip():
                errors.append(f"{case_label}: STUDENT case needs missed_by_ai reasoning")

            audit = case.get("audit")
            if not isinstance(audit, dict) or audit.get("verdict") not in VERDICTS:
                errors.append(f"{case_label}: audit verdict must be VALID, INVALID, or INCOMPLETE")
            else:
                if not str(audit.get("reason", "")).strip():
                    errors.append(f"{case_label}: audit reason is required")
                if audit["verdict"] != "VALID" and not str(audit.get("fix", "")).strip():
                    errors.append(f"{case_label}: non-VALID verdict needs a fix")

            coverage = case.get("coverage", [])
            if not isinstance(coverage, list):
                errors.append(f"{case_label}: coverage must be an array")
                coverage = []
            unknown_coverage = set(coverage) - REQUIRED_COVERAGE
            if unknown_coverage:
                errors.append(f"{case_label}: unknown coverage tags {sorted(unknown_coverage)}")
            api_coverage.update(coverage)

            case_ecs = case.get("equivalence_classes", [])
            if not isinstance(case_ecs, list):
                errors.append(f"{case_label}: equivalence_classes must be an array")
                case_ecs = []
            covered_ecs.update(case_ecs)
            unknown_ecs = set(case_ecs) - ec_ids
            if unknown_ecs:
                errors.append(f"{case_label}: references unknown ECs {sorted(unknown_ecs)}")

            secs = case.get("security_requirements", [])
            if not isinstance(secs, list):
                errors.append(f"{case_label}: security_requirements must be an array")
                secs = []
            unknown_secs = set(secs) - REQUIRED_SECS
            if unknown_secs:
                errors.append(f"{case_label}: unknown security IDs {sorted(unknown_secs)}")
            suite_secs.update(secs)

            request = case.get("request")
            if not isinstance(request, dict):
                errors.append(f"{case_label}: request must be an object")
            else:
                if not re.fullmatch(r"(?:GET|POST|PUT|PATCH|DELETE)", str(request.get("method", ""))):
                    errors.append(f"{case_label}: request.method is invalid")
                if not str(request.get("path", "")).startswith("/"):
                    errors.append(f"{case_label}: request.path must start with /")

            expected = case.get("expected")
            if not isinstance(expected, dict):
                errors.append(f"{case_label}: expected must be an object")
            else:
                statuses = expected.get("status")
                if not isinstance(statuses, list) or not statuses or not all(isinstance(s, int) for s in statuses):
                    errors.append(f"{case_label}: expected.status must be a non-empty integer array")
                if "json_schema" in expected:
                    has_schema = True
            if not str(case.get("oracle", "")).strip():
                errors.append(f"{case_label}: oracle source is required")
            if not str(case.get("prerequisite", "")).strip():
                errors.append(f"{case_label}: prerequisite is required")

        missing_ecs = ec_ids - covered_ecs
        if missing_ecs:
            errors.append(f"{label}: uncovered equivalence classes {sorted(missing_ecs)}")
        if cases and not allow_partial:
            missing_coverage = REQUIRED_COVERAGE - api_coverage
            if missing_coverage:
                errors.append(f"{label}: missing coverage categories {sorted(missing_coverage)}")
            if not has_schema:
                errors.append(f"{label}: needs at least one JSON Schema assertion")

    if not allow_partial:
        missing_secs = REQUIRED_SECS - suite_secs
        if missing_secs:
            errors.append(f"suite does not cover {sorted(missing_secs)}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalog", type=Path)
    parser.add_argument("--allow-partial", action="store_true", help="validate a pre-selection or in-progress catalog")
    args = parser.parse_args()
    try:
        errors = validate_catalog(load_catalog(args.catalog), args.allow_partial)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"valid": False, "errors": [str(exc)]}, ensure_ascii=False, indent=2))
        return 2
    print(json.dumps({"valid": not errors, "errors": errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
