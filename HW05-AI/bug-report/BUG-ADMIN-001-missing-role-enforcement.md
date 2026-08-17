# BUG-ADMIN-001 - Admin endpoints accept a non-admin JWT

| Field | Value |
| --- | --- |
| Feature | FR-12 Access Control / FR-18 Order Management |
| Severity | High |
| Priority | High |
| Status | Reproduced with request/response evidence and published on 2026-08-18 |
| GitHub Issue URL | <https://github.com/ntntran09/eshop-sut/issues/56> |

## Preconditions

1. EShop backend is running.
2. A normal user has a valid JWT.
3. At least one order exists.

## Steps

1. Log in as `test@eshop.com`.
2. Send `GET /api/admin/orders` with the returned bearer token.
3. Send `PUT /api/admin/orders/{id}/status` with a valid next status.

## Expected

Both calls return `403 Forbidden`, because FR-12 requires `role = admin` for `/api/admin/*`.

## Actual

The routes use `authenticateToken` only. That middleware verifies the token but does not check `req.user.role`. A normal authenticated account can list and modify all orders.

Fresh-backend reproduction on 2026-08-18:

| Observation | Actual value |
| --- | --- |
| JWT user role | `user` |
| `GET /api/admin/orders` | HTTP 200; accepted and returned all orders |
| Target order | ID 1, `pending` |
| Non-admin update response | `Order status updated` |
| Re-read status | `confirmed` |

Screenshot: `BUG-ADMIN-001-evidence.png`.

## Source evidence

- `backend/server.js`: `authenticateToken` only verifies JWT validity.
- `GET /api/admin/orders` and `PUT /api/admin/orders/:id/status` attach only `authenticateToken`.

## Performance-test relevance

The Scenario D plan therefore performs an explicit `/api/users/me` role assertion after login. A successful admin endpoint response alone is not evidence that authorization is correct.

## Required submission evidence

- [x] Reproduce with a non-admin token after the measured runs.
- [x] Attach request/response screenshot.
- [x] Publish to the student's EShop fork and replace the placeholder URL.
