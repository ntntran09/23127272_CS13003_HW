#!/usr/bin/env python3
"""Build the two CI Postman suites from the reviewed catalog.

- ci/ci-suite-green.postman_collection.json : cases that pass on the current SUT
- ci/ci-suite-red.postman_collection.json   : the same cases + one real failing
  case (C-AI-002: missing-JWT product creation, which genuinely detects BUG-08)

No fabricated assertions: every case is a real reviewed case with the
specification as its oracle.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "skills" / "generate-eshop-api-tests" / "scripts"))
import build_postman_collection as B  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "test-design" / "test-cases.json"
CI = ROOT / "ci"

GREEN_IDS = [
    "A-AI-002", "A-AI-019", "A-AI-026", "A-STU-036", "A-STU-038",
    "B-AI-002", "B-AI-004", "B-AI-001",
    "C-AI-001", "C-AI-011", "C-STU-036", "C-AI-035",
]
RED_EXTRA = "C-AI-002"  # missing-JWT product creation: real failing test (BUG-08)


def subset(data: dict, ids: list[str]) -> dict:
    keep = set(ids)
    out = {"meta": data["meta"], "apis": []}
    for api in data["apis"]:
        cases = [c for c in api["cases"] if c["id"] in keep]
        if cases:
            new_api = dict(api)
            new_api["cases"] = cases
            out["apis"].append(new_api)
    return out


def main() -> int:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    CI.mkdir(exist_ok=True)

    green = B.build_collection(subset(data, GREEN_IDS))
    green["info"]["name"] = "23127272 HW06 CI Suite (green)"
    green["info"]["description"] = "Reviewed cases that pass against the SUT; used for the all-passing CI run."
    (CI / "ci-suite-green.postman_collection.json").write_text(
        json.dumps(green, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    red = B.build_collection(subset(data, GREEN_IDS + [RED_EXTRA]))
    red["info"]["name"] = "23127272 HW06 CI Suite (one failing)"
    red["info"]["description"] = f"The green cases plus {RED_EXTRA}, a real reviewed case that fails on the SUT (detects BUG-08)."
    (CI / "ci-suite-red.postman_collection.json").write_text(
        json.dumps(red, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps({
        "green_cases": len(GREEN_IDS),
        "red_cases": len(GREEN_IDS) + 1,
        "red_extra": RED_EXTRA,
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
