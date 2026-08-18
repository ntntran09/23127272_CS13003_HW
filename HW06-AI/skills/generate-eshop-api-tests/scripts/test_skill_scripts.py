#!/usr/bin/env python3
"""Unit tests for the EShop catalog validator and Postman builder."""

from __future__ import annotations

import unittest

from build_postman_collection import build_collection
from validate_catalog import validate_catalog


def full_catalog():
    apis = []
    sec_ids = [f"SEC-0{i}" for i in range(1, 8)]
    for pool in "ABC":
        ec_id = f"{pool}-EC-VALID"
        cases = []
        for index in range(1, 41):
            origin = "AI" if index <= 35 else "STUDENT"
            cases.append({
                "id": f"{pool}-{'AI' if origin == 'AI' else 'STU'}-{index:03d}",
                "title": "generated fixture",
                "origin": origin,
                "missed_by_ai": "Cross-pass fixture" if origin == "STUDENT" else "",
                "audit": {"verdict": "VALID", "reason": "Matches fixture contract", "fix": "None"},
                "coverage": ["domain", "state", "security", "schema"] if index == 1 else ["domain"],
                "equivalence_classes": [ec_id],
                "security_requirements": sec_ids if pool == "A" and index == 1 else [],
                "prerequisite": "Seeded fixture",
                "oracle": "Fixture contract",
                "request": {"method": "GET", "path": "/api/fixture", "headers": {}, "query": []},
                "expected": {
                    "status": [200],
                    **({"content_type": "application/json", "json_schema": {"type": "object"}} if index == 1 else {}),
                },
            })
        apis.append({
            "api_id": f"API-{pool}",
            "pool": pool,
            "feature": "Fixture",
            "method": "GET",
            "path": "/api/fixture",
            "contract": "Fixture contract",
            "equivalence_classes": [{"id": ec_id, "variable": "fixture", "class": "valid", "validity": "VALID"}],
            "cases": cases,
        })
    return {
        "meta": {
            "student_id": "23127272",
            "base_url": "http://localhost:3000",
            "sut_commit": "85af3ba875c88283615e22cb108f13e2fccaf0e9",
        },
        "apis": apis,
    }


class SkillScriptTests(unittest.TestCase):
    def test_full_catalog_passes(self):
        self.assertEqual(validate_catalog(full_catalog()), [])

    def test_missing_ai_cases_fails(self):
        data = full_catalog()
        data["apis"][0]["cases"] = data["apis"][0]["cases"][10:]
        errors = validate_catalog(data)
        self.assertTrue(any("at least 35 AI cases" in error for error in errors))

    def test_collection_has_header_script_and_120_items(self):
        collection = build_collection(full_catalog())
        script = "\n".join(collection["event"][0]["script"]["exec"])
        self.assertIn("X-Student-Id", script)
        self.assertEqual(sum(len(folder["item"]) for folder in collection["item"]), 120)


if __name__ == "__main__":
    unittest.main()
