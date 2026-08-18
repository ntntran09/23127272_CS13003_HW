# Newman Test Summary

Local execution: pinned EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9` at `http://127.0.0.1:3001`.

| Metric | Pool A | Pool B | Pool C | Total |
| --- | ---: | ---: | ---: | ---: |
| Designed | 40 | 40 | 40 | 120 |
| AI-generated | 35 | 35 | 35 | 105 |
| Student-added | 5 | 5 | 5 | 15 |
| Executed | 39 | 40 | 40 | 119 |
| Passed | 18 | 34 | 19 | 71 |
| Failed | 21 | 6 | 21 | 48 |
| Not run | 1 | 0 | 0 | 1 |

Newman executed 348 sequential request items (setup + test requests), with 601 assertions and 86 failed assertions. Setup and script failures: 0. Failed cases are retained as genuine contract-deviation evidence, not changed to match the implementation.
