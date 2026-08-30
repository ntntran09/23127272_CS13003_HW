# HW06 Bug Reports

These are locally reproduced issue drafts. Each must receive a student-captured screenshot and a public GitHub Issue URL before submission.

| ID | Feature | Severity | Title | Test IDs | GitHub Issue | Screenshot |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-01 | FR-02 | Critical | Login success exposes the plaintext password and internal account fields | A-AI-001 | https://github.com/ntntran09/eshop-sut/issues/57 | `reports/screenshots/bug-console/BUG-01_A-AI-001_console.png` |
| BUG-02 | FR-02 | High | Login does not validate missing, malformed, or wrong-type fields | A-AI-003, A-AI-004, A-AI-005, A-AI-006, A-AI-007, A-AI-008, A-AI-009, A-AI-010, A-AI-011, A-AI-012, A-AI-013, A-AI-014, A-AI-015, A-AI-016, A-AI-017, A-AI-018, A-AI-021 | https://github.com/ntntran09/eshop-sut/issues/58 | `reports/screenshots/bug-console/BUG-02_A-AI-003_console.png` |
| BUG-03 | Cross-cutting | Medium | Malformed JSON returns HTML instead of the API JSON error schema | A-AI-022, B-AI-030, C-AI-032 | https://github.com/ntntran09/eshop-sut/issues/59 | `reports/screenshots/bug-console/BUG-03_A-AI-022_console.png` |
| BUG-04 | FR-02 | High | Failed-login counter advances too quickly and locks after two failures | A-AI-029 | https://github.com/ntntran09/eshop-sut/issues/60 | `reports/screenshots/bug-console/BUG-04_A-AI-029_console.png` |
| BUG-05 | FR-07 | High | Cart accepts invalid IDs, quantities, names, and prices | B-AI-007, B-AI-008, B-AI-009, B-AI-010, B-AI-011, B-AI-012, B-AI-013, B-AI-014, B-AI-015, B-AI-016, B-AI-017, B-AI-018, B-AI-019, B-AI-020, B-AI-021, B-AI-022, B-AI-023, B-AI-024, B-AI-025, B-AI-031, B-STU-039 | https://github.com/ntntran09/eshop-sut/issues/61 | `reports/screenshots/bug-console/BUG-05_B-AI-007_console.png` |
| BUG-06 | FR-07 | High | Adding the same product creates a duplicate row instead of merging quantity | B-AI-028, B-STU-036 | https://github.com/ntntran09/eshop-sut/issues/62 | `reports/screenshots/bug-console/BUG-06_B-AI-028_console.png` |
| BUG-07 | FR-07 | Critical | Cart trusts client-supplied product name and price | B-AI-034, B-AI-035 | https://github.com/ntntran09/eshop-sut/issues/63 | `reports/screenshots/bug-console/BUG-07_B-AI-034_console.png` |
| BUG-08 | FR-15 | Critical | Product creation is accessible without an admin JWT | C-AI-002, C-AI-003, C-AI-004, C-AI-005, C-STU-037 | https://github.com/ntntran09/eshop-sut/issues/64 | `reports/screenshots/bug-console/BUG-08_C-AI-002_console.png` |
| BUG-09 | FR-15 | High | Product creation omits required name, price, and category validation | C-AI-006, C-AI-007, C-AI-008, C-AI-009, C-AI-010, C-AI-014, C-AI-015, C-AI-016, C-AI-017, C-AI-018, C-AI-021, C-AI-022, C-AI-023, C-AI-024, C-AI-025, C-AI-026, C-AI-027, C-AI-028, C-AI-029, C-STU-039 | https://github.com/ntntran09/eshop-sut/issues/65 | `reports/screenshots/bug-console/BUG-09_C-AI-006_console.png` |

## BUG-01 - Login success exposes the plaintext password and internal account fields

- Severity: **Critical**
- Feature: `FR-02`
- Reproduced by: `A-AI-001`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-001`): `POST http://127.0.0.1:3001/api/login` -> HTTP `200`

```json
{"message":"Login successful","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODgwNjMzMTB9.oMiPw1XvcqZMkrEoAX5XbkVMD-w71QFWMP4U5UGJXGs","user":{"id":2,"name":"Test User","email":"test@eshop.com","password":"Test1234!","role":"user","login_attempts":0,"locked_until":null,"reset_token":null,"shipping_address":null,"phone":null}}
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-01_A-AI-001_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-01_issue-57.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/57

## BUG-02 - Login does not validate missing, malformed, or wrong-type fields

- Severity: **High**
- Feature: `FR-02`
- Reproduced by: `A-AI-003, A-AI-004, A-AI-005, A-AI-006, A-AI-007, A-AI-008, A-AI-009, A-AI-010, A-AI-011, A-AI-012, A-AI-013, A-AI-014, A-AI-015, A-AI-016, A-AI-017, A-AI-018, A-AI-021`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-003`): `POST http://127.0.0.1:3001/api/login` -> HTTP `401`

```json
{"error":"Invalid email or password"}
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-02_A-AI-003_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-02_issue-58.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/58

## BUG-03 - Malformed JSON returns HTML instead of the API JSON error schema

- Severity: **Medium**
- Feature: `Cross-cutting`
- Reproduced by: `A-AI-022, B-AI-030, C-AI-032`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-022`): `POST http://127.0.0.1:3001/api/login` -> HTTP `400`

```json
<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>Error</title> </head> <body> <pre>SyntaxError: Expected double-quoted property name in JSON at position 13 (line 1 column 14)<br> &nbsp; &nbsp;at JSON.parse (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at parse (D:\CODE\eshop-sut\backend\node_modules\body-parser\lib\types\json.js:72:19)<br> &nbsp; &nbsp;at D:\CODE\eshop-sut\backend\node_modules\body-parser\lib\read.js:162:18<br> &nbsp; &nbsp;at AsyncResource.runInAsyncScope (node:asyn
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-03_A-AI-022_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-03_issue-59.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/59

## BUG-04 - Failed-login counter advances too quickly and locks after two failures

- Severity: **High**
- Feature: `FR-02`
- Reproduced by: `A-AI-029`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-029`): `POST http://127.0.0.1:3001/api/login` -> HTTP `403`

```json
{"error":"Tài khoản đã bị khóa. Vui lòng thử lại sau."}
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-04_A-AI-029_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-04_issue-60.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/60

## BUG-05 - Cart accepts invalid IDs, quantities, names, and prices

- Severity: **High**
- Feature: `FR-07`
- Reproduced by: `B-AI-007, B-AI-008, B-AI-009, B-AI-010, B-AI-011, B-AI-012, B-AI-013, B-AI-014, B-AI-015, B-AI-016, B-AI-017, B-AI-018, B-AI-019, B-AI-020, B-AI-021, B-AI-022, B-AI-023, B-AI-024, B-AI-025, B-AI-031, B-STU-039`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`B-AI-007`): `POST http://127.0.0.1:3001/api/cart` -> HTTP `200`

```json
{"message":"Added to cart"}
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-05_B-AI-007_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-05_issue-61.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/61

## BUG-06 - Adding the same product creates a duplicate row instead of merging quantity

- Severity: **High**
- Feature: `FR-07`
- Reproduced by: `B-AI-028, B-STU-036`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`B-AI-028`): `GET http://127.0.0.1:3001/api/cart` -> HTTP `200`

```json
[{"id":1,"name":"iPhone 15 Pro Max","price":30000000,"quantity":1},{"id":1,"name":"iPhone 15 Pro Max","price":30000000,"quantity":2}]
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-06_B-AI-028_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-06_issue-62.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/62

## BUG-07 - Cart trusts client-supplied product name and price

- Severity: **Critical**
- Feature: `FR-07`
- Reproduced by: `B-AI-034, B-AI-035`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`B-AI-034`): `POST http://127.0.0.1:3001/api/cart` -> HTTP `200`

```json
{"message":"Added to cart"}
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-07_B-AI-034_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-07_issue-63.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/63

## BUG-08 - Product creation is accessible without an admin JWT

- Severity: **Critical**
- Feature: `FR-15`
- Reproduced by: `C-AI-002, C-AI-003, C-AI-004, C-AI-005, C-STU-037`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`C-AI-002`): `POST http://127.0.0.1:3001/api/products` -> HTTP `200`

```json
{"message":"Product created","id":7}
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-08_C-AI-002_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-08_issue-64.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/64

## BUG-09 - Product creation omits required name, price, and category validation

- Severity: **High**
- Feature: `FR-15`
- Reproduced by: `C-AI-006, C-AI-007, C-AI-008, C-AI-009, C-AI-010, C-AI-014, C-AI-015, C-AI-016, C-AI-017, C-AI-018, C-AI-021, C-AI-022, C-AI-023, C-AI-024, C-AI-025, C-AI-026, C-AI-027, C-AI-028, C-AI-029, C-STU-039`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 30/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`C-AI-006`): `POST http://127.0.0.1:3001/api/products` -> HTTP `200`

```json
{"message":"Product created","id":11}
```

- Bug/console screenshot: `reports/screenshots/bug-console/BUG-09_C-AI-006_console.png` (shows the request with `X-Student-Id: 23127272`, the response, and the failed assertion).
- GitHub Issue screenshot: `reports/screenshots/github-issues/BUG-09_issue-65.png`

GitHub Issue URL: https://github.com/ntntran09/eshop-sut/issues/65
