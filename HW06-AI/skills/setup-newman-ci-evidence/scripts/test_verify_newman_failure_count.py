#!/usr/bin/env python3
"""Unit tests for verify_newman_failure_count.py."""

from __future__ import annotations

import unittest

from verify_newman_failure_count import verify_report


ASSERTION = "DELIBERATE FAILURE - controlled CI evidence"


def report(assertion_failures: int, request_failures: int = 0) -> dict:
    stats = {
        key: {"failed": 0}
        for key in ("iterations", "items", "scripts", "prerequests", "requests")
    }
    stats["assertions"] = {"failed": assertion_failures}
    stats["requests"]["failed"] = request_failures
    failures = [
        {"error": {"test": ASSERTION}} for _ in range(assertion_failures)
    ]
    return {"run": {"stats": stats, "failures": failures}}


class VerifyNewmanFailureCountTests(unittest.TestCase):
    def test_accepts_exactly_one_controlled_assertion_failure(self) -> None:
        self.assertEqual(verify_report(report(1), 1, ASSERTION), [])

    def test_rejects_extra_assertion_failure(self) -> None:
        self.assertTrue(verify_report(report(2), 1, ASSERTION))

    def test_rejects_request_failure(self) -> None:
        self.assertTrue(verify_report(report(1, request_failures=1), 1, ASSERTION))

    def test_rejects_wrong_assertion_name(self) -> None:
        self.assertTrue(verify_report(report(1), 1, "other"))


if __name__ == "__main__":
    unittest.main()
