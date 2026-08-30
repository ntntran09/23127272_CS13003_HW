# Demo Video Script — AI-Driven EShop API Test Generator

**Goal (§7):** show the reusable Agent Skill generating API tests for **one API**
(Pool C — FR-15 `POST /api/products`), then validating, building, and running them.

- **Length:** ~3–4 minutes
- **Record:** screen capture (OBS / Xbox Game Bar `Win+G`) + optional voice
- **Language:** narration below is Vietnamese; adapt freely

## Before you record (setup, do NOT film)

1. Open a terminal at `D:\CODE\23127272_CS13003_HW\HW06-AI`.
2. Start the SUT so Newman has something to hit:
   - `node D:\CODE\eshop-sut\backend\database.js` (reseed)
   - `node automation\run-sut-3001.js` (leave running in a second terminal)
3. Open the editor showing: `skills/generate-eshop-api-tests/SKILL.md`,
   `test-generator/pseudocode.md`, and the diagram PNG.
4. Clear the terminal.

---

## Scene 1 — Intro (~15s)

**Show:** your face-cam or just the repo in the editor.

**Say:**
> "Chào thầy/cô, em là Nguyễn Thiên Nhã Trân, MSSV 23127272. Đây là demo Agent
> Skill 'AI-driven API test generator' cho EShop. Em sẽ minh hoạ nó sinh test cho
> một API: FR-15 tạo sản phẩm — `POST /api/products`."

## Scene 2 — The generator design (~40s)

**Show:** `SKILL.md`, then `pseudocode.md`, then the self-drawn diagram PNG.

**Say:**
> "Skill nhận đầu vào là API specification và source của SUT, rồi chạy các pass:
> trích contract và biến, sinh domain và boundary, state, security SEC-01 đến 07,
> và schema. Sau đó tới cổng review của con người và cổng thêm test của sinh viên.
> Đây là pseudocode và sơ đồ em tự vẽ mô tả luồng đó."

## Scene 3 — Generate for FR-15 (~50s)

**Show:** the reviewed catalog entry for FR-15 — open `test-design/test-cases.md`
and scroll to the **Pool C — FR-15** table (or open `test-design/test-cases.json`
and show a couple of Pool C cases).

**Say:**
> "Với FR-15, generator sinh 35 case AI cộng 5 case em tự thêm: kiểm tra auth
> admin, độ dài tên 1/254/255/256, giá âm/0/chuỗi, category tồn tại hay không,
> injection, và schema phản hồi. Mỗi case có oracle theo spec, nhãn audit, và
> truy vết SEC."

*(Optional, if you want to show the AI actually generating live: open Codex/Claude,
paste the FR-15 generation prompt from `appendix_a/prompt_02.md`, and show it
producing cases. Keep it short.)*

## Scene 4 — Validate + build (~40s)

**Show & type (let output appear on screen):**

```powershell
python skills/generate-eshop-api-tests/scripts/validate_catalog.py test-design/test-cases.json
python skills/generate-eshop-api-tests/scripts/build_postman_collection.py test-design/test-cases.json postman/23127272_HW06.postman_collection.json
```

**Say:**
> "Validator kiểm tra cấu trúc, số lượng, coverage và truy vết SEC — hợp lệ. Rồi
> builder sinh ra Postman collection từ catalog đã review, tự thêm header
> X-Student-Id."

## Scene 5 — Run the FR-15 tests with Newman (~50s)

**Show & type:**

```powershell
cd automation
npx newman run ../postman/23127272_HW06.postman_collection.json -e ../postman/23127272_HW06.local.postman_environment.json --folder "Pool C - FR-15 - Create product"
```

**Say (point at the console):**
> "Newman chạy riêng nhóm FR-15 trên SUT ở cổng 3001. Thấy dòng
> `X-Student-Id: 23127272` do pre-request script in ra. Các case pass là hợp lệ,
> còn các case fail chính là bug thật của SUT — ví dụ tạo sản phẩm không cần JWT
> admin vẫn trả 200, đó là BUG-08."

## Scene 6 — Outro (~15s)

**Say:**
> "Như vậy skill đã sinh, kiểm tra, build và chạy test cho FR-15 một cách tự động,
> còn phần review và bug thật do em tự kiểm chứng. Em cảm ơn thầy/cô."

---

## After recording
1. Upload to YouTube (Unlisted is fine).
2. Put the link in `README.md` and the submission notes.
3. Tip: keep it under ~4 minutes; TAs mainly want to see the skill actually run.
