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

// Account registry that stands in for the backend user table. A test never tells
// the fixture whether an email is registered; the fixture answers from this
// registry, so an "unregistered email" case cannot pass by construction.
const defaultResetAccounts = {
  'test@eshop.com': '123456',
  'admin@eshop.com': '111222',
  'customer.support@eshop.com': '987654',
};

async function mockForgotPassword(page, options = {}) {
  const { accounts = defaultResetAccounts, resetStatus = 200 } = options;
  const state = { otpRequests: 0, issuedTokens: [], rejectedEmails: [] };
  await page.route('**/api/forgot-password', async (route) => {
    const data = route.request().postDataJSON();
    const email = data && data.email;
    state.otpRequests += 1;
    if (!Object.prototype.hasOwnProperty.call(accounts, email)) {
      state.rejectedEmails.push(email);
      await route.fulfill(json({ error: 'User not found' }, 404));
      return;
    }
    state.issuedTokens.push(accounts[email]);
    await route.fulfill(json({ message: 'OTP created', resetToken: accounts[email] }));
  });
  await page.route('**/api/reset-password', (route) => route.fulfill(
    resetStatus === 200
      ? json({ message: 'Password reset successfully' })
      : json({ error: 'Invalid token or email' }, resetStatus),
  ));
  return state;
}

const defaultUsers = {
  'admin@eshop.com': { id: 1, password: 'Admin123!', role: 'admin' },
  'test@eshop.com': { id: 2, password: 'Test1234!', role: 'user' },
};

async function createMockAdminApi(page, initialCategories = [], options = {}) {
  const users = options.users || defaultUsers;
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
      const account = users[credentials.email];
      if (!account || account.password !== credentials.password) {
        await route.fulfill(json({ error: 'Invalid email or password' }, 401));
        return;
      }
      await route.fulfill(json({
        token: `mock-${account.role}-token`,
        user: { id: account.id, email: credentials.email, role: account.role },
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
  defaultResetAccounts,
  defaultUser,
  json,
  mockAuthenticatedProfile,
  mockForgotPassword,
};
