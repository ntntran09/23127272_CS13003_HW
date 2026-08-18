# Prompt 10

| Field | Value |
| --- | --- |
| Tool | Codex |
| Time | 2026-08-17T04:57:41.509Z |
| Source group | product-data-session |
| Source | ../AI docs/evidence/product-data-session/codex-chat-logs/codex-chat-log.md#interaction-5 |

## Prompt

```text
tôi muốn nhiều product hơn, trích csv ở trên mạng được ko
```

## AI Output

~~~~text
Được.

Nên dùng khoảng **1.000 sản phẩm** từ bộ dữ liệu Walmart công khai, rồi chuẩn hóa thành:

```csv
name,price,description,imageUrl,category_id
```

Nguồn có 1.001 sản phẩm và các trường tên, giá, mô tả, ảnh, danh mục: [Walmart dataset sample](https://github.com/luminati-io/Walmart-dataset-samples).

Nên lưu CSV vào repo và import lúc seed, không tải Internet mỗi lần chạy. Sau khi đổi phải chạy lại Load/Stress/Spike/Endurance vì kết quả JTL cũ chỉ đo danh sách 5 sản phẩm.
~~~~
