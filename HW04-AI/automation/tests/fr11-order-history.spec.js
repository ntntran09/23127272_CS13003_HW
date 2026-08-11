const { test, expect } = require('@playwright/test');
const cases = require('../data/fr11-order-history.json');
const { WEB_URL, defaultUser, json, mockAuthenticatedProfile } = require('../helpers/sut');

// Match the whole money cell. A substring match over the row is not usable here:
// a <tr> concatenates cells without separators ("8/8/20261.000 ₫"), so "1 ₫"
// would also match "21 ₫" and a wrong amount would still pass.
function moneyPattern(expectedTotal) {
  return new RegExp('^\\s*' + expectedTotal.split('.').join('[.,]') + '\\s*₫\\s*$');
}

function totalCell(row) {
  return row.locator('td').nth(2);
}

// requireMain is a precondition for well-formed data only. Malformed-data cases
// must not assert it here: if the row crashes the component, `main` is gone and
// the failure has to be reported against the requirement, not the helper.
async function openProfile(page, orders, { requireMain = true } = {}) {
  await mockAuthenticatedProfile(page, orders);
  await page.goto(`${WEB_URL}/profile`);
  if (requireMain) await expect(page.locator('main')).toBeVisible();
}

test.describe('FR-11 User order history', () => {
  for (const row of cases) {
    test.describe(`${row.id} ${row.title}`, () => {
      for (const dataset of row.datasets) {
        test(`${dataset.id} ${dataset.title}`, async ({ page }) => {
          test.info().annotations.push(
            { type: 'requirements', description: row.requirementIds.join(', ') },
            { type: 'expected', description: dataset.expected },
          );

          const input = dataset.input;

          switch (row.action) {
            case 'guest-gate': {
              await page.goto(`${WEB_URL}/profile`);
              await expect(page.locator('main')).toContainText(/đăng nhập/i);
              await expect(page.locator('tbody tr')).toHaveCount(0);
              break;
            }
            case 'expired-token': {
              await page.addInitScript((token) => localStorage.setItem('token', token), input.token);
              await page.route('**/api/users/me', (route) => route.fulfill(json({ error: 'Forbidden' }, 403)));
              await page.goto(`${WEB_URL}/profile`);
              await expect(page.locator('tbody tr')).toHaveCount(0);
              await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBeNull();
              break;
            }
            case 'empty-orders': {
              await openProfile(page, input.orders);
              await expect(page.locator('tbody tr')).toHaveCount(0);
              await expect(page.locator('main')).toContainText(/chưa có.*đơn hàng/i);
              break;
            }
            case 'one-order': {
              await openProfile(page, input.orders);
              const order = input.orders[0];
              const rows = page.locator('tbody tr');
              await expect.soft(page.locator('thead th')).toHaveCount(5);
              await expect.soft(rows).toHaveCount(1);
              await expect.soft(rows.first()).toContainText(`#${order.id}`);
              await expect.soft(totalCell(rows.first())).toHaveText(moneyPattern(dataset.expectedTotal));
              await expect(rows.first().locator('span')).toContainText(dataset.expectedLabel);
              break;
            }
            case 'many-orders': {
              await openProfile(page, input.orders);
              await expect(page.locator('tbody tr')).toHaveCount(input.orders.length);
              for (const order of input.orders) {
                await expect(page.locator('tbody')).toContainText(`#${order.id}`);
              }
              break;
            }
            case 'ownership': {
              // The fixture deliberately serves mixed data (DT-FR11-007/008): the
              // response contains another user's order, so ownership filtering has
              // to be enforced by the SUT rather than by the fixture.
              await openProfile(page, input.orders);
              const owned = input.orders.filter((order) => order.user_id === defaultUser.id);
              const foreign = input.orders.filter((order) => order.user_id !== defaultUser.id);
              const body = page.locator('tbody');
              await expect.soft(page.locator('tbody tr')).toHaveCount(owned.length);
              for (const order of owned) {
                await expect.soft(body).toContainText(`#${order.id}`);
              }
              for (const order of foreign) {
                await expect.soft(body).not.toContainText(`#${order.id}`);
              }
              await expect(body).not.toContainText(dataset.foreignTotal);
              break;
            }
            case 'status': {
              await openProfile(page, input.orders);
              const badge = page.locator('tbody tr').first().locator('span');
              await expect.soft(badge).toHaveText(input.label);
              await expect(badge).toHaveClass(new RegExp(input.classToken));
              break;
            }
            case 'shipping-no-cancel':
            case 'final-no-cancel': {
              await openProfile(page, input.orders);
              const orderRow = page.locator('tbody tr').first();
              await expect.soft(orderRow.locator('span')).toHaveText(input.label);
              await expect(orderRow.getByRole('button')).toHaveCount(0);
              break;
            }
            case 'malformed-status': {
              await openProfile(page, input.orders, { requireMain: false });
              // A malformed status must not take the page down. statusLabel()
              // ends in status.toUpperCase(), so a null status unmounts the
              // whole profile tree and leaves no row to inspect.
              await expect.soft(page.locator('main'), 'Malformed data must not unmount the profile page').toBeVisible();
              const rows = page.locator('tbody tr');
              await expect.soft(rows).toHaveCount(input.orders.length);
              if (await rows.count() === 0) break;
              const badge = rows.first().locator('span');
              const label = ((await badge.textContent()) || '').trim();
              expect.soft(label, 'Status badge must not be empty').not.toBe('');
              // FR-11 requires a Vietnamese label. An enum echoed back in upper
              // case is the raw code, which is what DT-FR11-015 forbids.
              expect(label, 'Status must render a Vietnamese fallback, not the raw code')
                .not.toMatch(/^[A-Z][A-Z0-9 _-]*$/);
              break;
            }
            case 'malformed-total': {
              await openProfile(page, input.orders, { requireMain: false });
              await expect.soft(page.locator('main'), 'Malformed data must not unmount the profile page').toBeVisible();
              const rows = page.locator('tbody tr');
              await expect.soft(rows).toHaveCount(input.orders.length);
              if (await rows.count() === 0) break;
              // The money cell is the oracle, anchored at both ends: the SUT
              // renders `Number(total || 0).toLocaleString() + " ₫"`, so an
              // invalid amount reaching the cell verbatim is the defect.
              await expect(totalCell(rows.first()), 'Invalid total must not render as a normal amount')
                .not.toHaveText(moneyPattern(dataset.forbiddenTotal));
              break;
            }
            case 'formatting': {
              await openProfile(page, input.orders);
              const orderRow = page.locator('tbody tr').first();
              await expect.soft(totalCell(orderRow)).toHaveText(moneyPattern(dataset.expectedTotal));
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
  }
});
