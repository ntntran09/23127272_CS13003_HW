# HW06 API Selection Gate

No API is selected in this file yet.

## Selection rules

1. Choose one API or cohesive API operation from each Pool A, B, and C.
2. Confirm the exact three-API combination is not used by another group member.
3. Prefer operations that can support at least 35 meaningful cases, including domain, state, security, and response-schema coverage.
4. Record the selected FR, method(s), path(s), and reason below.

## Available API inventory

| Pool | Feature | Candidate method/path |
| --- | --- | --- |
| A | FR-01 Registration | `POST /api/register` |
| A | FR-02 Login/lockout | `POST /api/login` |
| A | FR-03 Password reset | `POST /api/forgot-password`; `POST /api/reset-password` |
| A | FR-04 Profile | `GET /api/users/me`; `PUT /api/users/me` |
| A | FR-05 Product search | `GET /api/products?search=...` |
| A | FR-06 Product detail | `GET /api/products/:id` |
| B | FR-07 Cart | `GET /api/cart`; `POST /api/cart` |
| B | FR-08 Checkout | `POST /api/checkout` |
| B | FR-09 Coupon application | `POST /api/apply-coupon`; `POST /api/coupon-usage` |
| B | FR-10/11 Order lifecycle | `GET /api/orders/my-orders`; `GET /api/orders/:id`; `PUT /api/orders/:id/cancel` |
| C | FR-14 Category CRUD | `GET/POST /api/categories`; `PUT/DELETE /api/categories/:id` |
| C | FR-15 Product CRUD | `POST /api/products`; `PUT/DELETE /api/products/:id` |
| C | FR-16 Product import | `POST /api/admin/import-products` |
| C | FR-17 Coupon management | `GET /api/coupons`; `POST /api/admin/coupons`; `DELETE /api/admin/coupons/:id` |
| C | FR-18 Admin order management | `GET /api/admin/orders`; `PUT /api/admin/orders/:id/status` |
| C | FR-19 User management | `GET /api/admin/users`; `DELETE /api/admin/users/:id` |

## Student decision

| Pool | Selected FR | Selected method/path(s) | Why this API | Group uniqueness confirmed? |
| --- | --- | --- | --- | --- |
| A | TBD | TBD | TBD | No |
| B | TBD | TBD | TBD | No |
| C | TBD | TBD | TBD | No |

**Student confirmation:** I selected these APIs and verified that no group member uses the same combination.

Signature/date: TBD
