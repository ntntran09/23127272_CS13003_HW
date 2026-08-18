# Prompt 09

| Field | Value |
| --- | --- |
| Tool | Codex |
| Time | 2026-08-17T04:55:52.363Z |
| Source group | product-data-session |
| Source | ../AI docs/evidence/product-data-session/codex-chat-logs/codex-chat-log.md#interaction-4 |

## Prompt

```text
nma có lúc nó load lần mấy cái product á
```

## AI Output

~~~~text
Đúng. Nó “load products” nhiều lần vì:

- Mỗi VU chạy nhiều vòng.
- Mỗi vòng gọi `GET /api/products` đúng 1 lần.
- Mỗi lần API trả về cùng danh sách 5 products.

Ví dụ Load test đã gọi `/api/products` **788 lần**, tất cả thành công và cùng kích thước response `1238 bytes`.

Vậy không phải nhiều product khác nhau được chọn. Chỉ là cùng danh sách product được tải lặp lại để tạo tải.
~~~~
