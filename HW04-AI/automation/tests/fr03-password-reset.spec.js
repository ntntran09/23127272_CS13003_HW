const { test, expect } = require('@playwright/test');
const cases = require('../data/fr03-password-reset.json');
const { WEB_URL, mockForgotPassword } = require('../helpers/sut');

async function openStepTwo(page, input) {
  await mockForgotPassword(page, { resetToken: input.resetToken });
  await page.goto(`${WEB_URL}/forgot-password`);
  await page.locator('form input').first().fill(input.email);
  await page.locator('form button[type="submit"]').click();
  await expect(page.locator('form input')).toHaveCount(2);
}

test.describe('FR-03 Forgot password and password reset', () => {
  for (const row of cases) {
    test.describe(`${row.id} ${row.title}`, () => {
      for (const dataset of row.datasets) {
        test(`${dataset.id} ${dataset.title}`, async ({ page }) => {
          test.info().annotations.push(
            { type: 'requirements', description: row.requirementIds.join(', ') },
            { type: 'expected', description: dataset.expected },
          );

          const input = dataset.input;
          const dialogs = [];
          page.on('dialog', async (dialog) => {
            dialogs.push(dialog.message());
            await dialog.accept();
          });

          switch (row.action) {
            case 'page-contract': {
              await page.goto(`${WEB_URL}/forgot-password`);
              await expect.soft(page.locator('main h1')).toHaveCount(1);
              await expect.soft(page.locator('main')).toContainText(/1\s*\/\s*2/);
              await expect.soft(page.locator('form input')).toHaveCount(1);
              await expect.soft(page.locator('form button[type="submit"]')).toBeVisible();
              await expect(page.locator('main').getByRole('link', { name: /login|đăng nhập/i })).toBeVisible();
              break;
            }
            case 'login-entry': {
              await page.goto(`${WEB_URL}/login`);
              await page.locator('a[href="/forgot-password"]').click();
              await expect(page).toHaveURL(/\/forgot-password$/);
              await expect(page.locator('form input')).toHaveCount(1);
              break;
            }
            case 'request-otp': {
              await openStepTwo(page, input);
              await expect.soft(page.locator('main')).toContainText(/2\s*\/\s*2/);
              await expect(page.locator('form')).toContainText(new RegExp(`(?:^|\\D)${input.resetToken}(?:\\D|$)`));
              break;
            }
            case 'unregistered-email': {
              await mockForgotPassword(page, { unregisteredEmails: [input.email] });
              await page.goto(`${WEB_URL}/forgot-password`);
              await page.locator('form input').fill(input.email);
              await page.locator('form button[type="submit"]').click();
              await expect.soft(page.locator('form input')).toHaveCount(1);
              await expect.soft(page.locator('main .bg-red-100')).toBeVisible();
              expect(dialogs, 'Errors must be inline rather than browser alert dialogs').toHaveLength(0);
              break;
            }
            case 'email-type': {
              await page.goto(`${WEB_URL}/forgot-password`);
              const email = page.locator('form input').first();
              await expect.soft(email).toHaveAttribute('type', 'email');
              await email.fill(input.email);
              expect(await email.evaluate((element) => element.checkValidity())).toBe(false);
              break;
            }
            case 'empty-email': {
              await page.goto(`${WEB_URL}/forgot-password`);
              const email = page.locator('form input').first();
              await expect.soft(email).toHaveAttribute('required', '');
              await email.fill(input.email);
              expect(await email.evaluate((element) => element.checkValidity())).toBe(false);
              await page.locator('form button[type="submit"]').click();
              await expect(page.locator('form input')).toHaveCount(1);
              break;
            }
            case 'otp-contract': {
              await openStepTwo(page, input);
              await expect.soft(page.locator('form label').first()).toContainText(/6/);
              await expect(page.locator('form')).toContainText(/(?:^|\D)\d{6}(?:\D|$)/);
              break;
            }
            case 'password-fields': {
              await openStepTwo(page, input);
              const passwords = page.locator('input[type="password"]');
              await expect(passwords).toHaveCount(2);
              break;
            }
            case 'confirmation-required': {
              await openStepTwo(page, input);
              const passwords = page.locator('input[type="password"]');
              await expect.soft(passwords).toHaveCount(2);
              await expect(passwords.nth(1)).toHaveAttribute('required', '');
              break;
            }
            case 'valid-reset': {
              let resetRequests = 0;
              await mockForgotPassword(page, { resetToken: input.resetToken });
              await page.route('**/api/reset-password', async (route) => {
                resetRequests += 1;
                await route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' });
              });
              await page.goto(`${WEB_URL}/forgot-password`);
              await page.locator('form input').fill(input.email);
              await page.locator('form button[type="submit"]').click();
              const inputs = page.locator('form input');
              await inputs.nth(0).fill(input.resetToken);
              await inputs.nth(1).fill(input.newPassword);
              await expect.soft(page.locator('input[type="password"]')).toHaveCount(2);
              if (await inputs.count() > 2) await inputs.nth(2).fill(input.confirmPassword);
              await page.locator('form button[type="submit"]').click();
              await expect.soft(page).toHaveURL(/\/login$/);
              expect(resetRequests).toBe(1);
              break;
            }
            case 'mismatched-confirmation': {
              let resetRequests = 0;
              await mockForgotPassword(page, { resetToken: input.resetToken });
              await page.route('**/api/reset-password', async (route) => {
                resetRequests += 1;
                await route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"unexpected"}' });
              });
              await page.goto(`${WEB_URL}/forgot-password`);
              await page.locator('form input').fill(input.email);
              await page.locator('form button[type="submit"]').click();
              const inputs = page.locator('form input');
              await expect(page.locator('input[type="password"]')).toHaveCount(2);
              await inputs.nth(0).fill(input.resetToken);
              await inputs.nth(1).fill(input.newPassword);
              await inputs.nth(2).fill(input.confirmPassword);
              await page.locator('form button[type="submit"]').click();
              expect(resetRequests).toBe(0);
              await expect(page.locator('main .bg-red-100')).toBeVisible();
              break;
            }
            case 'back-to-login': {
              await page.goto(`${WEB_URL}/forgot-password`);
              const back = page.locator('main').getByRole('link', { name: /login|đăng nhập/i });
              await expect(back).toBeVisible();
              await back.click();
              await expect(page).toHaveURL(/\/login$/);
              break;
            }
            default:
              throw new Error(`Unsupported action: ${row.action}`);
          }
        });
      }
    });
  }
});
