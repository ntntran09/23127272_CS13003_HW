const { test, expect } = require('@playwright/test');
const cases = require('../data/fr11-order-history.json');
const { WEB_URL, json, mockAuthenticatedProfile } = require('../helpers/sut');

async function openProfile(page, orders) {
  await mockAuthenticatedProfile(page, orders);
  await page.goto(`${WEB_URL}/profile`);
  await expect(page.locator('main')).toBeVisible();
}

test.describe('FR-11 User order history', () => {
  for (const row of cases) {
    test(`${row.id} ${row.title}`, async ({ page }) => {
      test.info().annotations.push(
        { type: 'requirements', description: row.requirementIds.join(', ') },
        { type: 'expected', description: row.expected },
      );

      switch (row.action) {
        case 'guest-gate': {
          await page.goto(`${WEB_URL}/profile`);
          await expect(page.locator('main')).toContainText(/đăng nhập/i);
          await expect(page.locator('tbody tr')).toHaveCount(0);
          break;
        }
        case 'expired-token': {
          await page.addInitScript((token) => localStorage.setItem('token', token), row.input.token);
          await page.route('**/api/users/me', (route) => route.fulfill(json({ error: 'Forbidden' }, 403)));
          await page.goto(`${WEB_URL}/profile`);
          await expect(page.locator('tbody tr')).toHaveCount(0);
          await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
          break;
        }
        case 'empty-orders': {
          await openProfile(page, row.input.orders);
          await expect(page.locator('tbody tr')).toHaveCount(0);
          await expect(page.locator('main')).toContainText(/chưa có.*đơn hàng/i);
          break;
        }
        case 'one-order': {
          await openProfile(page, row.input.orders);
          const rows = page.locator('tbody tr');
          await expect.soft(page.locator('thead th')).toHaveCount(5);
          await expect.soft(rows).toHaveCount(1);
          await expect.soft(rows.first()).toContainText('#101');
          await expect.soft(rows.first()).toContainText(/300[.,]000\s*₫/);
          await expect(rows.first().locator('span')).toContainText('Chờ xác nhận');
          break;
        }
        case 'many-orders': {
          await openProfile(page, row.input.orders);
          await expect(page.locator('tbody tr')).toHaveCount(row.input.orders.length);
          await expect(page.locator('tbody')).toContainText('#102');
          await expect(page.locator('tbody')).toContainText('#103');
          break;
        }
        case 'ownership': {
          await openProfile(page, row.input.orders);
          await expect.soft(page.locator('tbody')).toContainText(`#${row.input.orders[0].id}`);
          await expect(page.locator('tbody')).not.toContainText(`#${row.input.foreignOrderId}`);
          break;
        }
        case 'status': {
          await openProfile(page, row.input.orders);
          const badge = page.locator('tbody tr').first().locator('span');
          await expect.soft(badge).toHaveText(row.input.label);
          await expect(badge).toHaveClass(new RegExp(row.input.classToken));
          break;
        }
        case 'shipping-no-cancel':
        case 'final-no-cancel': {
          await openProfile(page, row.input.orders);
          const orderRow = page.locator('tbody tr').first();
          await expect.soft(orderRow.locator('span')).toHaveText(row.input.label);
          await expect(orderRow.getByRole('button')).toHaveCount(0);
          break;
        }
        case 'formatting': {
          await openProfile(page, row.input.orders);
          const orderRow = page.locator('tbody tr').first();
          await expect.soft(orderRow).toContainText(/1[.,]234[.,]567[.,]890\s*₫/);
          await expect.soft(orderRow).not.toContainText(/Invalid Date/i);
          await expect(orderRow.locator('td').nth(1)).not.toBeEmpty();
          break;
        }
        default:
          throw new Error(`Unsupported action: ${row.action}`);
      }
    });
  }
});
