# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr11-order-history.spec.js >> FR-11 User order history >> FR11-AUTO-008 Shipping order cannot be canceled >> FR11-AUTO-008-01 Shipping order row
- Location: tests\fr11-order-history.spec.js:19:9

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('tbody tr').first().getByRole('button')
Expected: 0
Received: 1
Timeout:  3000ms

Call log:
  - Expect "toHaveCount" with timeout 3000ms
  - waiting for locator('tbody tr').first().getByRole('button')
    10 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "EShop" [ref=e5] [cursor=pointer]:
      - /url: /
    - navigation [ref=e6]:
      - link "Giỏ hàng" [ref=e7] [cursor=pointer]:
        - /url: /cart
      - generic [ref=e8]:
        - link "Chào, Test User" [ref=e9] [cursor=pointer]:
          - /url: /profile
        - button "Thoát" [ref=e10] [cursor=pointer]
  - main [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Hồ sơ của bạn" [level=2] [ref=e14]
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: Email (Không đổi)
            - textbox [disabled] [ref=e18]: test@eshop.com
          - generic [ref=e19]:
            - generic [ref=e20]: Họ Tên
            - textbox [ref=e21]: Test User
          - generic [ref=e22]:
            - generic [ref=e23]: Số điện thoại
            - 'textbox "VD: 0912345678" [ref=e24]'
          - generic [ref=e25]:
            - generic [ref=e26]: Địa chỉ giao hàng
            - textbox "Nhập địa chỉ của bạn" [ref=e27]
          - button "Cập nhật" [ref=e28] [cursor=pointer]
      - generic [ref=e29]:
        - heading "Lịch sử đơn hàng" [level=2] [ref=e30]
        - table [ref=e31]:
          - rowgroup [ref=e32]:
            - row [ref=e33]:
              - columnheader "Mã ĐH" [ref=e34]
              - columnheader "Ngày đặt" [ref=e35]
              - columnheader "Tổng tiền" [ref=e36]
              - columnheader "Trạng thái" [ref=e37]
              - columnheader "Thao tác" [ref=e38]
          - rowgroup [ref=e39]:
            - row [ref=e40]:
              - cell "#110" [ref=e41]
              - cell "8/8/2026" [ref=e42]
              - cell "100 ₫" [ref=e43]
              - cell "Đang giao" [ref=e44]
              - cell [ref=e45]:
                - button "Hủy đơn" [ref=e46] [cursor=pointer]
  - contentinfo [ref=e47]: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | const cases = require('../data/fr11-order-history.json');
  3   | const { WEB_URL, json, mockAuthenticatedProfile } = require('../helpers/sut');
  4   | 
  5   | function moneyPattern(expectedTotal) {
  6   |   return new RegExp(expectedTotal.split('.').join('[.,]') + '\\s*₫');
  7   | }
  8   | 
  9   | async function openProfile(page, orders) {
  10  |   await mockAuthenticatedProfile(page, orders);
  11  |   await page.goto(`${WEB_URL}/profile`);
  12  |   await expect(page.locator('main')).toBeVisible();
  13  | }
  14  | 
  15  | test.describe('FR-11 User order history', () => {
  16  |   for (const row of cases) {
  17  |     test.describe(`${row.id} ${row.title}`, () => {
  18  |       for (const dataset of row.datasets) {
  19  |         test(`${dataset.id} ${dataset.title}`, async ({ page }) => {
  20  |           test.info().annotations.push(
  21  |             { type: 'requirements', description: row.requirementIds.join(', ') },
  22  |             { type: 'expected', description: dataset.expected },
  23  |           );
  24  | 
  25  |           const input = dataset.input;
  26  | 
  27  |           switch (row.action) {
  28  |             case 'guest-gate': {
  29  |               await page.goto(`${WEB_URL}/profile`);
  30  |               await expect(page.locator('main')).toContainText(/đăng nhập/i);
  31  |               await expect(page.locator('tbody tr')).toHaveCount(0);
  32  |               break;
  33  |             }
  34  |             case 'expired-token': {
  35  |               await page.addInitScript((token) => localStorage.setItem('token', token), input.token);
  36  |               await page.route('**/api/users/me', (route) => route.fulfill(json({ error: 'Forbidden' }, 403)));
  37  |               await page.goto(`${WEB_URL}/profile`);
  38  |               await expect(page.locator('tbody tr')).toHaveCount(0);
  39  |               await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  40  |               break;
  41  |             }
  42  |             case 'empty-orders': {
  43  |               await openProfile(page, input.orders);
  44  |               await expect(page.locator('tbody tr')).toHaveCount(0);
  45  |               await expect(page.locator('main')).toContainText(/chưa có.*đơn hàng/i);
  46  |               break;
  47  |             }
  48  |             case 'one-order': {
  49  |               await openProfile(page, input.orders);
  50  |               const order = input.orders[0];
  51  |               const rows = page.locator('tbody tr');
  52  |               await expect.soft(page.locator('thead th')).toHaveCount(5);
  53  |               await expect.soft(rows).toHaveCount(1);
  54  |               await expect.soft(rows.first()).toContainText(`#${order.id}`);
  55  |               await expect.soft(rows.first()).toContainText(moneyPattern(dataset.expectedTotal));
  56  |               await expect(rows.first().locator('span')).toContainText(dataset.expectedLabel);
  57  |               break;
  58  |             }
  59  |             case 'many-orders': {
  60  |               await openProfile(page, input.orders);
  61  |               await expect(page.locator('tbody tr')).toHaveCount(input.orders.length);
  62  |               for (const order of input.orders) {
  63  |                 await expect(page.locator('tbody')).toContainText(`#${order.id}`);
  64  |               }
  65  |               break;
  66  |             }
  67  |             case 'ownership': {
  68  |               await openProfile(page, input.orders);
  69  |               await expect.soft(page.locator('tbody')).toContainText(`#${input.orders[0].id}`);
  70  |               await expect(page.locator('tbody')).not.toContainText(`#${input.foreignOrderId}`);
  71  |               break;
  72  |             }
  73  |             case 'status': {
  74  |               await openProfile(page, input.orders);
  75  |               const badge = page.locator('tbody tr').first().locator('span');
  76  |               await expect.soft(badge).toHaveText(input.label);
  77  |               await expect(badge).toHaveClass(new RegExp(input.classToken));
  78  |               break;
  79  |             }
  80  |             case 'shipping-no-cancel':
  81  |             case 'final-no-cancel': {
  82  |               await openProfile(page, input.orders);
  83  |               const orderRow = page.locator('tbody tr').first();
  84  |               await expect.soft(orderRow.locator('span')).toHaveText(input.label);
> 85  |               await expect(orderRow.getByRole('button')).toHaveCount(0);
      |                                                          ^ Error: expect(locator).toHaveCount(expected) failed
  86  |               break;
  87  |             }
  88  |             case 'formatting': {
  89  |               await openProfile(page, input.orders);
  90  |               const orderRow = page.locator('tbody tr').first();
  91  |               await expect.soft(orderRow).toContainText(moneyPattern(dataset.expectedTotal));
  92  |               await expect.soft(orderRow).not.toContainText(/Invalid Date/i);
  93  |               await expect(orderRow.locator('td').nth(1)).not.toBeEmpty();
  94  |               break;
  95  |             }
  96  |             default:
  97  |               throw new Error(`Unsupported action: ${row.action}`);
  98  |           }
  99  |         });
  100 |       }
  101 |     });
  102 |   }
  103 | });
  104 | 
```