# Kịch bản video demo HW04 (6-8 phút)

## Chuẩn bị

- Mở ba terminal cho backend, frontend web và frontend admin.
- Mở terminal thứ tư tại `HW04-AI\automation`.
- Đảm bảo màn hình không lộ token, mật khẩu cá nhân hoặc dữ liệu riêng tư.

Mọi lệnh trong kịch bản này ghi kết quả vào `demo-run\` (đã gitignore), **không**
đụng tới `reports\` là bằng chứng nộp bài. Nếu quay hỏng thì quay lại, không cần
lo hỏng report đã commit.

## 0:00-0:40 - Giới thiệu và bằng chứng tác giả

Nói:

> Em là Nguyễn Thiện Nhã Trân, MSSV 23127272. Video này trình bày automation testing cho EShop bằng Playwright. Em sẽ demo FR-14 Category Management trên Chromium, Google Chrome và Microsoft Edge, sau đó mở HTML report và giải thích một lỗi em đã sửa từ code AI sinh ra.

Chạy:

```powershell
whoami
hostname
```

## 0:40-1:30 - Giới thiệu cấu trúc

Mở nhanh:

- `data/fr14-category-management.json`: chỉ ra 12 data row ngoài script.
- `tests/fr14-category-management.spec.js`: chỉ ra vòng lặp sinh test và annotation requirement.
- `playwright.config.js`: chỉ ra ba browser project, `Run by`, timestamp, screenshot/trace/video.

Nói rõ các assertion pattern: URL/visibility, text, count, attribute/value, negative assertion.

## 1:30-4:00 - Chạy multi-browser

Trong PowerShell:

```powershell
npm run demo:fr14
```

Runner tự đặt `Run by: 23127272`, ISO timestamp, feature và browser cho từng
run, nên không cần set biến môi trường thủ công trên camera.

Trong lúc chạy, giải thích:

- Mỗi data row trở thành một test case.
- Hai case tên rỗng và chỉ có khoảng trắng được kỳ vọng fail theo FR-14.
- Failure là kết quả đối chiếu requirement, không sửa expected để làm test pass.

## 4:00-5:00 - Mở HTML report

Chạy:

```powershell
npx playwright show-report demo-run\reports\fr14\chromium
```

Trong report, chỉ ra:

- Tiêu đề `Run by: 23127272` và ISO timestamp.
- Ba projects Chromium, Chrome, Edge.
- Một test pass và một test fail.
- Screenshot/trace của failure FR14-AUTO-009 hoặc FR14-AUTO-010.

## 5:00-6:20 - Human review fix

Nói:

> Phiên bản runner AI sinh đầu tiên gọi trực tiếp `npx.cmd`. Trên Windows tiến trình con không khởi động, nhưng script chỉ nhìn exit status nên báo cả chín run thất bại mà không có output Playwright. Em phát hiện điều này vì thời gian chạy chỉ khoảng một giây và không có report mới. Em sửa runner để dùng chính Node executable với `require.resolve('@playwright/test/cli')`, đồng thời kiểm tra `result.error`. Sau sửa, matrix chạy đủ 108 executions và tạo đủ chín HTML report.

Mở `scripts/run-browser-matrix.js` và chỉ hai dòng sửa tương ứng.

Có thể nói thêm:

> Em cũng scope back-to-login locator vào `main` để tránh global header tạo false pass, và đổi OTP assertion từ word boundary sang numeric boundary.

## 6:20-7:00 - Kết luận

Nói:

> Bộ suite có 36 test case, chín browser run, tổng cộng 108 executions: 69 pass và 39 fail, được hợp nhất thành chín defect duy nhất. Hai skill em tạo là skill chuyển domain case sang Playwright và skill chạy browser matrix; không có skill nào được viết riêng để giải HW04.

Hiển thị `reports/run-summary.json`, sau đó kết thúc video.

## Sau khi quay

1. Upload YouTube ở chế độ Unlisted.
2. Điền URL vào `README.md` cho cả demo chính và skill demo nếu dùng chung video.
3. Không cắt mất phần `whoami`, `hostname`, giọng nói, multi-browser output hoặc report metadata.
