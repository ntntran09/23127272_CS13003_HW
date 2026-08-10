# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fr03-password-reset.spec.js >> FR-03 Forgot password and password reset >> FR03-AUTO-001 Forgot-password page exposes the two-step contract >> FR03-AUTO-001-01 Guest opens the two-step contract
- Location: tests\fr03-password-reset.spec.js:32:9

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main')
Expected pattern: /1\s*\/\s*2/
Received string:  "Quên Mật KhẩuNhập Email của bạnLấy mã OTP"
Timeout: 3000ms

Call log:
  - Expect "soft toContainText" with timeout 3000ms
  - waiting for locator('main')
    10 × locator resolved to <main class="flex-grow p-4 container mx-auto max-w-5xl">…</main>
       - unexpected value "Quên Mật KhẩuNhập Email của bạnLấy mã OTP"

```

```yaml
- main:
  - heading "Quên Mật Khẩu" [level=2]
  - text: Nhập Email của bạn
  - textbox
  - button "Lấy mã OTP"
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('main').getByRole('link', { name: /login|đăng nhập/i }).or(locator('main').getByRole('button', { name: /login|đăng nhập/i }))
Expected: visible
Timeout: 3000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 3000ms
  - waiting for locator('main').getByRole('link', { name: /login|đăng nhập/i }).or(locator('main').getByRole('button', { name: /login|đăng nhập/i }))

```

```yaml
- banner:
  - link "EShop":
    - /url: /
  - navigation:
    - link "Giỏ hàng":
      - /url: /cart
    - link "Đăng nhập":
      - /url: /login
    - link "Đăng ký":
      - /url: /register
- main:
  - heading "Quên Mật Khẩu" [level=2]
  - text: Nhập Email của bạn
  - textbox
  - button "Lấy mã OTP"
- contentinfo: © 2026 EShop SUT. Dành cho mục đích kiểm thử.
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | const cases = require('../data/fr03-password-reset.json');
  3   | const { WEB_URL, defaultResetAccounts, mockForgotPassword } = require('../helpers/sut');
  4   | 
  5   | // The account registry is a backend stand-in, never a per-case answer: the OTP a
  6   | // test expects is the one the registry issues for the requested email.
  7   | function accountsFor(row, dataset) {
  8   |   return dataset.accounts || row.accounts || defaultResetAccounts;
  9   | }
  10  | 
  11  | // FR-03 requires "Back to login"; the requirement does not fix the element type,
  12  | // so accept either a link or a button and let the destination be the oracle.
  13  | function backToLogin(page) {
  14  |   const scope = page.locator('main');
  15  |   return scope
  16  |     .getByRole('link', { name: /login|đăng nhập/i })
  17  |     .or(scope.getByRole('button', { name: /login|đăng nhập/i }));
  18  | }
  19  | 
  20  | async function openStepTwo(page, accounts, input) {
  21  |   await mockForgotPassword(page, { accounts });
  22  |   await page.goto(`${WEB_URL}/forgot-password`);
  23  |   await page.locator('form input').first().fill(input.email);
  24  |   await page.locator('form button[type="submit"]').click();
  25  |   await expect(page.locator('form input')).toHaveCount(2);
  26  | }
  27  | 
  28  | test.describe('FR-03 Forgot password and password reset', () => {
  29  |   for (const row of cases) {
  30  |     test.describe(`${row.id} ${row.title}`, () => {
  31  |       for (const dataset of row.datasets) {
  32  |         test(`${dataset.id} ${dataset.title}`, async ({ page }) => {
  33  |           test.info().annotations.push(
  34  |             { type: 'requirements', description: row.requirementIds.join(', ') },
  35  |             { type: 'expected', description: dataset.expected },
  36  |           );
  37  | 
  38  |           const input = dataset.input;
  39  |           const accounts = accountsFor(row, dataset);
  40  |           const issuedOtp = accounts[input.email];
  41  |           const dialogs = [];
  42  |           page.on('dialog', async (dialog) => {
  43  |             dialogs.push(dialog.message());
  44  |             await dialog.accept();
  45  |           });
  46  | 
  47  |           switch (row.action) {
  48  |             case 'page-contract': {
  49  |               await page.goto(`${WEB_URL}/forgot-password`);
  50  |               await expect.soft(page.getByRole('heading', { name: /quên mật khẩu|forgot password/i })).toBeVisible();
  51  |               await expect.soft(page.locator('main')).toContainText(/1\s*\/\s*2/);
  52  |               await expect.soft(page.locator('form input')).toHaveCount(1);
  53  |               await expect.soft(page.locator('form button[type="submit"]')).toBeVisible();
> 54  |               await expect(backToLogin(page)).toBeVisible();
      |                                               ^ Error: expect(locator).toBeVisible() failed
  55  |               break;
  56  |             }
  57  |             case 'login-entry': {
  58  |               await page.goto(`${WEB_URL}/login`);
  59  |               await page.locator('a[href="/forgot-password"]').click();
  60  |               await expect(page).toHaveURL(/\/forgot-password$/);
  61  |               await expect(page.locator('form input')).toHaveCount(1);
  62  |               break;
  63  |             }
  64  |             case 'request-otp': {
  65  |               await openStepTwo(page, accounts, input);
  66  |               await expect.soft(page.locator('main')).toContainText(/2\s*\/\s*2/);
  67  |               await expect(page.locator('form')).toContainText(new RegExp(`(?:^|\\D)${issuedOtp}(?:\\D|$)`));
  68  |               break;
  69  |             }
  70  |             case 'unregistered-email': {
  71  |               const fixture = await mockForgotPassword(page, { accounts });
  72  |               await page.goto(`${WEB_URL}/forgot-password`);
  73  |               await page.locator('form input').fill(input.email);
  74  |               await page.locator('form button[type="submit"]').click();
  75  |               await expect.soft(page.locator('form input')).toHaveCount(1);
  76  |               await expect.soft(page.locator('main .bg-red-100')).toBeVisible();
  77  |               await expect.soft(page.locator('main')).not.toContainText(/\d{4,}/);
  78  |               expect.soft(fixture.issuedTokens, 'No OTP may be issued for an unregistered email').toHaveLength(0);
  79  |               expect(dialogs, 'Errors must be inline rather than browser alert dialogs').toHaveLength(0);
  80  |               break;
  81  |             }
  82  |             case 'email-type': {
  83  |               await page.goto(`${WEB_URL}/forgot-password`);
  84  |               const email = page.locator('form input').first();
  85  |               await expect.soft(email).toHaveAttribute('type', 'email');
  86  |               await email.fill(input.email);
  87  |               expect(await email.evaluate((element) => element.checkValidity())).toBe(false);
  88  |               break;
  89  |             }
  90  |             case 'empty-email': {
  91  |               await page.goto(`${WEB_URL}/forgot-password`);
  92  |               const email = page.locator('form input').first();
  93  |               await expect.soft(email).toHaveAttribute('required', '');
  94  |               await email.fill(input.email);
  95  |               expect(await email.evaluate((element) => element.checkValidity())).toBe(false);
  96  |               await page.locator('form button[type="submit"]').click();
  97  |               await expect(page.locator('form input')).toHaveCount(1);
  98  |               break;
  99  |             }
  100 |             case 'otp-contract': {
  101 |               await openStepTwo(page, accounts, input);
  102 |               await expect.soft(page.locator('form label').first()).toContainText(/6/);
  103 |               // The issued OTP must appear verbatim: a 6-digit regex alone would
  104 |               // also accept a truncated or re-generated token.
  105 |               await expect(page.locator('form')).toContainText(new RegExp(`(?:^|\\D)${issuedOtp}(?:\\D|$)`));
  106 |               break;
  107 |             }
  108 |             case 'password-fields': {
  109 |               await openStepTwo(page, accounts, input);
  110 |               const passwords = page.locator('input[type="password"]');
  111 |               await expect(passwords).toHaveCount(2);
  112 |               break;
  113 |             }
  114 |             case 'confirmation-required': {
  115 |               await openStepTwo(page, accounts, input);
  116 |               const passwords = page.locator('input[type="password"]');
  117 |               await expect.soft(passwords).toHaveCount(2);
  118 |               await expect(passwords.nth(1)).toHaveAttribute('required', '');
  119 |               break;
  120 |             }
  121 |             case 'valid-reset': {
  122 |               let resetRequests = 0;
  123 |               await mockForgotPassword(page, { accounts });
  124 |               await page.route('**/api/reset-password', async (route) => {
  125 |                 resetRequests += 1;
  126 |                 await route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' });
  127 |               });
  128 |               await page.goto(`${WEB_URL}/forgot-password`);
  129 |               await page.locator('form input').fill(input.email);
  130 |               await page.locator('form button[type="submit"]').click();
  131 |               const inputs = page.locator('form input');
  132 |               // Step 2 must expose OTP + new password + confirmation. Assert the
  133 |               // contract, then keep driving so the submit outcome is observable
  134 |               // even when the confirmation field is missing.
  135 |               await expect.soft(inputs, 'Step 2 must expose OTP, new password, and confirmation').toHaveCount(3);
  136 |               await inputs.nth(0).fill(issuedOtp);
  137 |               await inputs.nth(1).fill(input.newPassword);
  138 |               if (await inputs.count() > 2) await inputs.nth(2).fill(input.confirmPassword);
  139 |               await page.locator('form button[type="submit"]').click();
  140 |               await expect.soft(page).toHaveURL(/\/login$/);
  141 |               expect(resetRequests).toBe(1);
  142 |               break;
  143 |             }
  144 |             case 'mismatched-confirmation': {
  145 |               let resetRequests = 0;
  146 |               await mockForgotPassword(page, { accounts });
  147 |               await page.route('**/api/reset-password', async (route) => {
  148 |                 resetRequests += 1;
  149 |                 await route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"unexpected"}' });
  150 |               });
  151 |               await page.goto(`${WEB_URL}/forgot-password`);
  152 |               await page.locator('form input').fill(input.email);
  153 |               await page.locator('form button[type="submit"]').click();
  154 |               const inputs = page.locator('form input');
```