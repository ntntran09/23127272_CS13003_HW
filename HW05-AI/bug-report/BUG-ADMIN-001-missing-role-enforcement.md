# BUG-ADMIN-001 - Admin endpoints accept a non-admin JWT

| Field | Value |
| --- | --- |
| Feature | FR-12 Access Control / FR-18 Order Management |
| Severity | High |
| Priority | High |
| Status | Reproduced locally on 2026-08-17; GitHub issue and screenshot pending |
| GitHub Issue URL | `TBD - student must publish` |

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

Local reproduction after the Endurance run:

| Observation | Actual value |
| --- | --- |
| JWT user role | `user` |
| `GET /api/admin/orders` | Accepted; returned 7,500 orders |
| Target order | ID 7500, `pending` |
| Non-admin update response | `Order status updated` |
| Re-read status | `confirmed` |

## Source evidence

- `backend/server.js`: `authenticateToken` only verifies JWT validity.
- `GET /api/admin/orders` and `PUT /api/admin/orders/:id/status` attach only `authenticateToken`.

## Performance-test relevance

The Scenario D plan therefore performs an explicit `/api/users/me` role assertion after login. A successful admin endpoint response alone is not evidence that authorization is correct.

## Required submission evidence

- [ ] Reproduce with a non-admin token after the measured runs.
- [ ] Attach request/response screenshot.
- [ ] Publish to the student's GitHub Issues page and replace the TBD URL.
