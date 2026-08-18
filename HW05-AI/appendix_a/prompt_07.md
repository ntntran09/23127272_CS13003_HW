# Prompt 07

| Field | Value |
| --- | --- |
| Tool | Codex |
| Time | 2026-08-17T04:51:42.473Z |
| Source group | product-data-session |
| Source | ../AI docs/evidence/product-data-session/codex-chat-logs/codex-chat-log.md#interaction-2 |

## Prompt

```text
product để làm load test á
```

## AI Output

~~~~text
Đúng. Trong load test, tất cả VU đều gọi cùng endpoint `GET /api/products`, nên nhận cùng danh sách product.

Cái được chia riêng là `order_id`: mỗi VU lấy một order khác nhau từ CSV, tránh cập nhật trùng order.

Thiết kế hiện tại đúng với Scenario D và yêu cầu ba test Load/Stress/Spike chạy cùng workflow.
~~~~
