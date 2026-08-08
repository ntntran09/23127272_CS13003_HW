const { test, expect } = require('@playwright/test');
const cases = require('../data/fr14-category-management.json');
const { ADMIN_URL, createMockAdminApi } = require('../helpers/sut');

async function login(page, input) {
  await page.goto(ADMIN_URL);
  await page.getByPlaceholder('Email').fill(input.email || 'admin@eshop.com');
  await page.getByPlaceholder('Password').fill(input.password || 'Admin123!');
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
    test(`${row.id} ${row.title}`, async ({ page }) => {
      test.info().annotations.push(
        { type: 'requirements', description: row.requirementIds.join(', ') },
        { type: 'expected', description: row.expected },
      );

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
          await createMockAdminApi(page);
          await login(page, row.input);
          await expect.soft(page.getByRole('heading', { name: 'EShop Admin' })).toBeVisible();
          await expect(page.getByText('Danh mục', { exact: true })).toBeVisible();
          break;
        }
        case 'invalid-login': {
          await createMockAdminApi(page);
          await login(page, row.input);
          await expect.soft(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
          await expect(page.getByRole('heading', { name: 'EShop Admin' })).toHaveCount(0);
          break;
        }
        case 'non-admin-login': {
          await createMockAdminApi(page);
          await login(page, row.input);
          await expect.soft(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
          await expect(page.getByText('Danh mục', { exact: true })).toHaveCount(0);
          break;
        }
        case 'category-view': {
          await openCategories(page, row.input.categories);
          await expect.soft(page.getByPlaceholder('Tên danh mục mới')).toBeVisible();
          await expect.soft(page.getByRole('button', { name: 'Thêm mới' })).toBeVisible();
          await expect(page.locator('table')).toBeVisible();
          break;
        }
        case 'table-columns': {
          await openCategories(page, row.input.categories);
          const headers = page.locator('thead th');
          await expect.soft(headers).toHaveCount(3);
          await expect.soft(headers.nth(0)).toHaveText('ID');
          await expect.soft(headers.nth(1)).toContainText('Tên Danh Mục');
          await expect(headers.nth(2)).toContainText('Hành động');
          break;
        }
        case 'add-category': {
          await openCategories(page, row.input.categories);
          const nameInput = page.getByPlaceholder('Tên danh mục mới');
          await nameInput.fill(row.input.name);
          await page.getByRole('button', { name: 'Thêm mới' }).click();
          await expect.soft(page.locator('tbody tr', { hasText: row.input.name })).toHaveCount(1);
          await expect(nameInput).toHaveValue('');
          break;
        }
        case 'reject-category': {
          const state = await openCategories(page, row.input.categories);
          const nameInput = page.getByPlaceholder('Tên danh mục mới');
          if (row.input.name) await nameInput.fill(row.input.name);
          await page.getByRole('button', { name: 'Thêm mới' }).click();
          expect.soft(state.postCount, 'Invalid category must not trigger POST /api/categories').toBe(0);
          await expect(page.locator('tbody tr')).toHaveCount(0);
          break;
        }
        case 'safe-rendering': {
          await openCategories(page, row.input.categories);
          await page.getByPlaceholder('Tên danh mục mới').fill(row.input.name);
          await page.getByRole('button', { name: 'Thêm mới' }).click();
          const matchingRow = page.locator('tbody tr', { hasText: row.input.name });
          await expect.soft(matchingRow).toHaveCount(1);
          await expect.soft(matchingRow).toContainText(row.input.name);
          await expect(matchingRow.locator('img')).toHaveCount(0);
          break;
        }
        case 'delete-category': {
          const state = await openCategories(page, row.input.categories);
          const deleteRow = page.locator('tbody tr', { hasText: `#${row.input.deleteId}` });
          await deleteRow.getByRole('button', { name: 'Xóa' }).click();
          expect.soft(state.deleteCount).toBe(1);
          await expect.soft(page.locator('tbody')).not.toContainText(`#${row.input.deleteId}`);
          await expect(page.locator('tbody')).toContainText('Keep me');
          break;
        }
        default:
          throw new Error(`Unsupported action: ${row.action}`);
      }
    });
  }
});
