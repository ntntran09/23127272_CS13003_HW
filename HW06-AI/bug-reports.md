# HW06 Bug Reports

These are locally reproduced issue drafts. Each must receive a student-captured screenshot and a public GitHub Issue URL before submission.

| ID | Feature | Severity | Title | Test IDs | GitHub Issue | Screenshot |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-01 | FR-03 | High | Forgot-password returns a four-digit OTP instead of six digits | A-AI-001, A-AI-013, A-STU-036 | STUDENT ACTION | STUDENT ACTION |
| BUG-02 | FR-03 | Critical | Password reset accepts missing or weak passwords | A-AI-020, A-AI-023, A-AI-024, A-AI-025, A-AI-026, A-AI-027, A-AI-028, A-AI-029, A-AI-032, A-STU-039 | STUDENT ACTION | STUDENT ACTION |
| BUG-03 | FR-03 | Medium | Forgot-password does not validate malformed email input | A-AI-003, A-AI-004, A-AI-005, A-AI-006, A-AI-007, A-AI-008, A-AI-009 | STUDENT ACTION | STUDENT ACTION |
| BUG-04 | Cross-cutting | Medium | Malformed JSON returns an HTML error page instead of the API error schema | A-AI-033, C-AI-018 | STUDENT ACTION | STUDENT ACTION |
| BUG-05 | FR-11 | Critical | Order detail is publicly readable and exposes another user's order (IDOR) | B-AI-018, B-AI-019, B-STU-037 | STUDENT ACTION | STUDENT ACTION |
| BUG-06 | FR-11 | High | A shipping order can be canceled and its persisted state becomes canceled | B-AI-027, B-STU-036 | STUDENT ACTION | STUDENT ACTION |
| BUG-07 | FR-11/supporting checkout | High | Negative order totals enter history as valid-looking orders | B-STU-039 | STUDENT ACTION | STUDENT ACTION |
| BUG-08 | FR-14 | Critical | Normal users can create, update, and delete categories | C-AI-008, C-AI-021, C-AI-032, C-STU-037 | STUDENT ACTION | STUDENT ACTION |
| BUG-09 | FR-14 | High | Category create/update accepts missing, empty, whitespace, null, or numeric names | C-AI-009, C-AI-010, C-AI-011, C-AI-012, C-AI-013, C-AI-026, C-STU-036 | STUDENT ACTION | STUDENT ACTION |
| BUG-10 | FR-14 | High | Category update/delete reports success for nonexistent or invalid identifiers | C-AI-022, C-AI-023, C-AI-024, C-AI-025, C-AI-027, C-AI-033, C-AI-034, C-AI-035, C-STU-040 | STUDENT ACTION | STUDENT ACTION |

## BUG-01 - Forgot-password returns a four-digit OTP instead of six digits

- Severity: **High**
- Feature: `FR-03`
- Reproduced by: `A-AI-001, A-AI-013, A-STU-036`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-001`): `POST http://127.0.0.1:3001/api/forgot-password` -> HTTP `200`

```json
{"message":"Mã đặt lại mật khẩu đã được tạo","resetToken":"8699"}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-02 - Password reset accepts missing or weak passwords

- Severity: **Critical**
- Feature: `FR-03`
- Reproduced by: `A-AI-020, A-AI-023, A-AI-024, A-AI-025, A-AI-026, A-AI-027, A-AI-028, A-AI-029, A-AI-032, A-STU-039`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-020`): `POST http://127.0.0.1:3001/api/reset-password` -> HTTP `200`

```json
{"message":"Password reset successfully"}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-03 - Forgot-password does not validate malformed email input

- Severity: **Medium**
- Feature: `FR-03`
- Reproduced by: `A-AI-003, A-AI-004, A-AI-005, A-AI-006, A-AI-007, A-AI-008, A-AI-009`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-003`): `POST http://127.0.0.1:3001/api/forgot-password` -> HTTP `404`

```json
{"error":"User not found"}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-04 - Malformed JSON returns an HTML error page instead of the API error schema

- Severity: **Medium**
- Feature: `Cross-cutting`
- Reproduced by: `A-AI-033, C-AI-018`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`A-AI-033`): `POST http://127.0.0.1:3001/api/reset-password` -> HTTP `400`

```json
<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>Error</title> </head> <body> <pre>SyntaxError: Unexpected end of JSON input<br> &nbsp; &nbsp;at JSON.parse (&lt;anonymous&gt;)<br> &nbsp; &nbsp;at parse (D:\CODE\eshop-sut-hw06\backend\node_modules\body-parser\lib\types\json.js:72:19)<br> &nbsp; &nbsp;at D:\CODE\eshop-sut-hw06\backend\node_modules\body-parser\lib\read.js:162:18<br> &nbsp; &nbsp;at AsyncResource.runInAsyncScope (node:async_hooks:214:14)<br> &nbsp; &nbsp;at invo
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-05 - Order detail is publicly readable and exposes another user's order (IDOR)

- Severity: **Critical**
- Feature: `FR-11`
- Reproduced by: `B-AI-018, B-AI-019, B-STU-037`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`B-AI-018`): `GET http://127.0.0.1:3001/api/orders/13` -> HTTP `200`

```json
{"id":13,"user_id":39,"total_amount":200000,"status":"pending","shipping_address":"123 Le Loi, TP.HCM","created_at":"2026-08-18 04:40:37"}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-06 - A shipping order can be canceled and its persisted state becomes canceled

- Severity: **High**
- Feature: `FR-11`
- Reproduced by: `B-AI-027, B-STU-036`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`B-AI-027`): `PUT http://127.0.0.1:3001/api/orders/22/cancel` -> HTTP `200`

```json
{"message":"Order canceled successfully"}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-07 - Negative order totals enter history as valid-looking orders

- Severity: **High**
- Feature: `FR-11/supporting checkout`
- Reproduced by: `B-STU-039`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`B-STU-039`): `GET http://127.0.0.1:3001/api/orders/my-orders` -> HTTP `200`

```json
[{"id":31,"user_id":62,"total_amount":-1,"status":"pending","shipping_address":"123 Le Loi, TP.HCM","created_at":"2026-08-18 04:40:47"}]
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-08 - Normal users can create, update, and delete categories

- Severity: **Critical**
- Feature: `FR-14`
- Reproduced by: `C-AI-008, C-AI-021, C-AI-032, C-STU-037`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`C-AI-008`): `POST http://127.0.0.1:3001/api/categories` -> HTTP `200`

```json
{"message":"Category created","id":5}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-09 - Category create/update accepts missing, empty, whitespace, null, or numeric names

- Severity: **High**
- Feature: `FR-14`
- Reproduced by: `C-AI-009, C-AI-010, C-AI-011, C-AI-012, C-AI-013, C-AI-026, C-STU-036`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`C-AI-009`): `POST http://127.0.0.1:3001/api/categories` -> HTTP `200`

```json
{"message":"Category created","id":6}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**

## BUG-10 - Category update/delete reports success for nonexistent or invalid identifiers

- Severity: **High**
- Feature: `FR-14`
- Reproduced by: `C-AI-022, C-AI-023, C-AI-024, C-AI-025, C-AI-027, C-AI-033, C-AI-034, C-AI-035, C-STU-040`
- Environment: EShop commit `85af3ba875c88283615e22cb108f13e2fccaf0e9`, local Newman run on 18/08/2026
- Expected: The request follows the reviewed EShop contract and security/state rules.
- Actual: The listed contract assertions fail consistently in the attached Newman JSON/HTML report.
- Representative evidence (`C-AI-022`): `PUT http://127.0.0.1:3001/api/categories/999999` -> HTTP `200`

```json
{"message":"Category updated"}
```

Screenshot: **STUDENT ACTION - capture the real Postman/Newman/GitHub Issue screen.**

GitHub Issue URL: **STUDENT ACTION - publish after reviewing this draft.**
