const API_URL = process.env.ESHOP_API_URL || 'http://127.0.0.1:3000/api';
const WEB_URL = process.env.ESHOP_WEB_URL || 'http://127.0.0.1:5173';
const ADMIN_URL = process.env.ESHOP_ADMIN_URL || 'http://127.0.0.1:5174';

const defaultUser = {
  id: 2,
  name: 'Test User',
  email: 'test@eshop.com',
  role: 'user',
  phone: '',
  shipping_address: '',
};

function json(body, status = 200) {
  return {
    status,
    contentType: 'application/json; charset=utf-8',
    body: JSON.stringify(body),
  };
}

async function mockAuthenticatedProfile(page, orders, options = {}) {
  const token = options.token || 'playwright-user-token';
  await page.addInitScript((value) => localStorage.setItem('token', value), token);
  await page.route('**/api/users/me', (route) => route.fulfill(json(options.user || defaultUser)));
  await page.route('**/api/orders/my-orders', (route) => route.fulfill(json(orders)));
}

async function mockForgotPassword(page, resetToken = '123456', resetStatus = 200) {
  await page.route('**/api/forgot-password', async (route) => {
    const data = route.request().postDataJSON();
    if (data.email === 'notfound@example.com') {
      await route.fulfill(json({ error: 'User not found' }, 404));
      return;
    }
    await route.fulfill(json({ message: 'OTP created', resetToken }));
  });
  await page.route('**/api/reset-password', (route) => route.fulfill(
    resetStatus === 200
      ? json({ message: 'Password reset successfully' })
      : json({ error: 'Invalid token or email' }, resetStatus),
  ));
}

async function createMockAdminApi(page, initialCategories = []) {
  const state = {
    categories: structuredClone(initialCategories),
    postCount: 0,
    deleteCount: 0,
  };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const pathname = url.pathname;

    if (pathname === '/api/login' && method === 'POST') {
      const credentials = request.postDataJSON();
      if (credentials.password === 'wrong-password') {
        await route.fulfill(json({ error: 'Invalid email or password' }, 401));
        return;
      }
      const role = credentials.email === 'admin@eshop.com' ? 'admin' : 'user';
      await route.fulfill(json({
        token: `mock-${role}-token`,
        user: { id: role === 'admin' ? 1 : 2, email: credentials.email, role },
      }));
      return;
    }

    if (pathname === '/api/categories' && method === 'GET') {
      await route.fulfill(json(state.categories));
      return;
    }

    if (pathname === '/api/categories' && method === 'POST') {
      const payload = request.postDataJSON();
      state.postCount += 1;
      const category = { id: 800 + state.postCount, name: payload.name };
      state.categories.push(category);
      await route.fulfill(json({ message: 'Category created', id: category.id }));
      return;
    }

    const deleteMatch = pathname.match(/^\/api\/categories\/(\d+)$/);
    if (deleteMatch && method === 'DELETE') {
      const id = Number(deleteMatch[1]);
      state.deleteCount += 1;
      state.categories = state.categories.filter((category) => category.id !== id);
      await route.fulfill(json({ message: 'Category deleted' }));
      return;
    }

    if (pathname === '/api/admin/users') {
      await route.fulfill(json([]));
      return;
    }
    if (pathname === '/api/admin/orders') {
      await route.fulfill(json([]));
      return;
    }
    if (pathname === '/api/products') {
      await route.fulfill(json([]));
      return;
    }
    if (pathname === '/api/coupons') {
      await route.fulfill(json([]));
      return;
    }

    await route.fulfill(json({ error: `Unhandled mock route: ${method} ${pathname}` }, 404));
  });

  return state;
}

module.exports = {
  ADMIN_URL,
  API_URL,
  WEB_URL,
  createMockAdminApi,
  defaultUser,
  json,
  mockAuthenticatedProfile,
  mockForgotPassword,
};
