# Prompt 03

| Field | Value |
| --- | --- |
| Tool | Codex |
| Time | 2026-08-18T04:19:27.346Z |
| Source group | setup-session |
| Source | ../AI docs/evidence/setup-session/codex-chat-logs/codex-chat-log.md#interaction-4 |

## Prompt

```text
Còn api thì lấy theo nhx lựa chọn của Hw02 và Hw04
```

## AI Output

~~~~text
Đã hoàn thiện phần HW06 có thể thực hiện cục bộ, chọn API theo HW02/HW04:

- Pool A: FR-03.
- Pool B: FR-11.
- Pool C: FR-14.
- 120 test case: 105 AI + 15 student-origin.
- Newman: 119 chạy, 71 pass, 48 fail, 1 manual.
- 601 assertions; 0 lỗi setup/script.
- Phát hiện 10 nhóm bug.
- Skill hợp lệ; unit test 3/3.
- Git sạch, HEAD `9649034`.

Tài liệu chính:

- [README](/D:/CODE/23127272_CS13003_HW/HW06-AI/README.md)
- [Test catalog](/D:/CODE/23127272_CS13003_HW/HW06-AI/test-design/test-cases.md)
- [Postman collection](/D:/CODE/23127272_CS13003_HW/HW06-AI/postman/23127272_HW06.postman_collection.json)
- [Newman HTML](/D:/CODE/23127272_CS13003_HW/HW06-AI/reports/newman-report.html)
- [Bug reports](/D:/CODE/23127272_CS13003_HW/HW06-AI/bug-reports.md)
- [Submission checklist](/D:/CODE/23127272_CS13003_HW/HW06-AI/submission-checklist.md)
- Main report: :codex-file-citation{path="D:/CODE/23127272_CS13003_HW/HW06-AI/output/pdf/23127272_HW06_Main_Report.pdf" purpose="output"}
- AI Audit: :codex-file-citation{path="D:/CODE/23127272_CS13003_HW/HW06-AI/output/pdf/23127272_HW06_AI_Audit.pdf" purpose="output"}

Còn các mục bắt buộc sinh viên tự hoàn thành:

- Xác nhận lựa chọn không trùng nhóm.
- Review/ký audit.
- Tự vẽ diagram.
- Chụp screenshot thật.
- Đăng GitHub Issues.
- Chạy và lưu hai CI run.
- Thực hiện OTP-expiry manual case.
- Xuất XLSX: runtime hiện thiếu dependency loader bắt buộc của Spreadsheet skill; đã cung cấp [CSV đầy đủ](/D:/CODE/23127272_CS13003_HW/HW06-AI/reports/test-case-results.csv).

Chưa tạo ZIP cuối vì các bằng chứng trên còn thiếu; tạo ZIP lúc này sẽ thành bộ nộp chưa hợp lệ.
~~~~
