const { test, expect } = require('@playwright/test');
const cases = require('../data/fr14-category-management.json');
const { ADMIN_URL, createMockAdminApi } = require('../helpers/sut');

async function login(page, input) {
  await page.goto(ADMIN_URL);
  await page.getByPlaceholder('Email').fill(input.email);
  await page.getByPlaceholder('Password').fill(input.password);
  await page.getByRole('button', { name: 'Login' }).click();
}

async function openCategories(page, categories = []) {
  const state = await createMockAdminApi(page, categories);
  await login(page, { email: 'admin@eshop.com', password: 'Admin123!' });
  await expect(page.getByRole('heading', { name: 'EShop Admin' })).toBeVisible();
  await page.getByText('Danh mục', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Quản lý Danh mục' })).toBeVisible();
  return state;
}

test.describe('FR-14 Category management', () => {
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
            case 'auth-gate': {
              await page.goto(ADMIN_URL);
              await expect.soft(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
              await expect.soft(page.getByPlaceholder('Email')).toBeVisible();
              await expect(page.getByRole('heading', { name: 'Quản lý Danh mục' })).toHaveCount(0);
              break;
            }
            case 'admin-login': {
              await createMockAdminApi(page, [], { users: row.mockUsers });
              await login(page, input);
              await expect.soft(page.getByRole('heading', { name: 'EShop Admin' })).toBeVisible();
              await expect(page.getByText('Danh mục', { exact: true })).toBeVisible();
              break;
            }
            case 'invalid-login': {
              await createMockAdminApi(page, [], { users: row.mockUsers });
              await login(page, input);
              await expect.soft(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
              await expect.soft(page.getByRole('heading', { name: 'EShop Admin' })).toHaveCount(0);
              // Staying on the login screen is not enough: management must stay
              // unreachable even if the form silently refused to submit.
              await expect(page.getByText('Danh mục', { exact: true })).toHaveCount(0);
              break;
            }
            case 'non-admin-login': {
              await createMockAdminApi(page, [], { users: row.mockUsers });
              await login(page, input);
              await expect.soft(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
              await expect(page.getByText('Danh mục', { exact: true })).toHaveCount(0);
              break;
            }
            case 'category-view': {
              await openCategories(page, input.categories);
              await expect.soft(page.getByPlaceholder('Tên danh mục mới')).toBeVisible();
              await expect.soft(page.getByRole('button', { name: 'Thêm mới' })).toBeVisible();
              await expect(page.locator('table')).toBeVisible();
              break;
            }
            case 'table-columns': {
              await openCategories(page, input.categories);
              const headers = page.locator('thead th');
              await expect.soft(headers).toHaveCount(3);
              await expect.soft(headers.nth(0)).toHaveText('ID');
              await expect.soft(headers.nth(1)).toContainText('Tên Danh Mục');
              await expect(headers.nth(2)).toContainText('Hành động');
              break;
            }
            case 'add-category': {
              if (dataset.expectedLength !== undefined) {
                expect(input.name, 'Boundary length in the data file must match its declared length').toHaveLength(dataset.expectedLength);
              }
              await openCategories(page, input.categories);
              const nameInput = page.getByPlaceholder('Tên danh mục mới');
              await nameInput.fill(input.name);
              await page.getByRole('button', { name: 'Thêm mới' }).click();
              await expect.soft(page.locator('tbody tr', { hasText: input.name })).toHaveCount(1);
              await expect(nameInput).toHaveValue('');
              break;
            }
            case 'reject-category': {
              const state = await openCategories(page, input.categories);
              const nameInput = page.getByPlaceholder('Tên danh mục mới');
              if (input.name) await nameInput.fill(input.name);
              await page.getByRole('button', { name: 'Thêm mới' }).click();
              expect.soft(state.postCount, 'Invalid category must not trigger POST /api/categories').toBe(0);
              await expect(page.locator('tbody tr')).toHaveCount(0);
              break;
            }
            case 'safe-rendering': {
              await openCategories(page, input.categories);
              await page.getByPlaceholder('Tên danh mục mới').fill(input.name);
              await page.getByRole('button', { name: 'Thêm mới' }).click();
              const matchingRow = page.locator('tbody tr', { hasText: input.name });
              await expect.soft(matchingRow).toHaveCount(1);
              await expect.soft(matchingRow).toContainText(input.name);
              // Assert the tag the payload would create, not a fixed 'img', and
              // fail if the payload managed to raise a dialog.
              await expect.soft(page.locator(`tbody ${dataset.forbiddenTag}`)).toHaveCount(0);
              expect(dialogs, 'Category text must never execute as markup or script').toHaveLength(0);
              break;
            }
            case 'delete-category': {
              const state = await openCategories(page, input.categories);
              const deleteRow = page.locator('tbody tr', { hasText: `#${input.deleteId}` });
              await deleteRow.getByRole('button', { name: 'Xóa' }).click();
              expect.soft(state.deleteCount).toBe(1);
              await expect.soft(page.locator('tbody')).not.toContainText(`#${input.deleteId}`);
              await expect(page.locator('tbody')).toContainText(dataset.keepName);
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
