#!/usr/bin/env python3
"""Verify that a Newman JSON report contains only the intended assertion failures."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def _failed(stats: dict[str, Any], key: str) -> int:
    value = stats.get(key, {})
    if not isinstance(value, dict):
        raise ValueError(f"run.stats.{key} must be an object")
    failed = value.get("failed")
    if not isinstance(failed, int):
        raise ValueError(f"run.stats.{key}.failed must be an integer")
    return failed


def verify_report(
    report: dict[str, Any], expected_failures: int, expected_assertion: str | None
) -> list[str]:
    run = report.get("run")
    if not isinstance(run, dict):
        return ["report.run is missing or invalid"]

    stats = run.get("stats")
    if not isinstance(stats, dict):
        return ["report.run.stats is missing or invalid"]

    errors: list[str] = []
    try:
        assertion_failures = _failed(stats, "assertions")
        if assertion_failures != expected_failures:
            errors.append(
                f"expected {expected_failures} failed assertion(s), found {assertion_failures}"
            )

        for key in ("iterations", "items", "scripts", "prerequests", "requests"):
            failed = _failed(stats, key)
            if failed != 0:
                errors.append(f"expected zero failed {key}, found {failed}")
    except ValueError as exc:
        errors.append(str(exc))

    failures = run.get("failures")
    if not isinstance(failures, list):
        errors.append("report.run.failures is missing or invalid")
        return errors

    assertion_names = [
        failure.get("error", {}).get("test")
        for failure in failures
        if isinstance(failure, dict)
        and isinstance(failure.get("error"), dict)
        and failure.get("error", {}).get("test")
    ]
    if len(assertion_names) != expected_failures:
        errors.append(
            "expected failure list to contain "
            f"{expected_failures} assertion failure(s), found {len(assertion_names)}"
        )
    if expected_assertion and assertion_names != [expected_assertion] * expected_failures:
        errors.append(
            f"expected assertion name {expected_assertion!r}, found {assertion_names!r}"
        )

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path, help="Newman JSON report")
    parser.add_argument("--expected-failures", type=int, default=1)
    parser.add_argument("--expected-assertion")
    args = parser.parse_args()

    if args.expected_failures < 0:
        parser.error("--expected-failures must be non-negative")
    if not args.report.is_file():
        print(f"ERROR: report not found: {args.report}", file=sys.stderr)
        return 2

    try:
        report = json.loads(args.report.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"ERROR: cannot read Newman report: {exc}", file=sys.stderr)
        return 2

    errors = verify_report(report, args.expected_failures, args.expected_assertion)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1

    print(
        f"Verified Newman report: {args.expected_failures} controlled assertion failure(s), "
        "zero infrastructure failures."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
