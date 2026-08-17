#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const DATA_FILE = path.resolve(__dirname, '..', 'data', 'admin-orders.csv');

function options(argv) {
  const out = { base: 'http://127.0.0.1:3000', count: 6000, concurrency: 24 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--base') out.base = argv[++i];
    else if (argv[i] === '--count') out.count = Number(argv[++i]);
    else if (argv[i] === '--concurrency') out.concurrency = Number(argv[++i]);
    else throw new Error(`Unknown option: ${argv[i]}`);
  }
  if (!Number.isInteger(out.count) || out.count < 2) throw new Error('--count must be an integer >= 2');
  return out;
}

function request(base, method, route, body, token) {
  const url = new URL(route, base);
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body));
  const headers = {};
  if (payload) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = payload.length; }
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch {}
        resolve({ status: res.statusCode, json, text });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function pool(items, limit, work) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; results[i] = await work(items[i], i); }
  });
  await Promise.all(workers);
  return results;
}

async function login(base, email, password) {
  const r = await request(base, 'POST', '/api/login', { email, password });
  if (r.status !== 200 || !r.json?.token) throw new Error(`Login failed for ${email}: HTTP ${r.status} ${r.text}`);
  return r.json;
}

async function main() {
  const o = options(process.argv.slice(2));
  const admin = await login(o.base, 'admin@eshop.com', 'Admin123!');
  const profile = await request(o.base, 'GET', '/api/users/me', undefined, admin.token);
  if (profile.status !== 200 || profile.json?.role !== 'admin') throw new Error('Default account did not pass explicit admin-role pre-check.');

  const before = await request(o.base, 'GET', '/api/admin/orders', undefined, admin.token);
  if (before.status !== 200 || !Array.isArray(before.json)) throw new Error(`Cannot list orders: HTTP ${before.status}`);
  if (before.json.length !== 0) throw new Error(`Expected a clean restart with 0 orders, found ${before.json.length}. Restart backend before seeding.`);

  const user = await login(o.base, 'test@eshop.com', 'Test1234!');
  process.stdout.write(`Creating ${o.count} pending orders with concurrency ${o.concurrency}...\n`);
  const ids = await pool(Array.from({ length: o.count }, (_, i) => i), o.concurrency, async (i) => {
    const r = await request(o.base, 'POST', '/api/checkout', {
      total_amount: 1000000 + (i % 100) * 10000,
      shipping_address: `Performance Seed ${String(i + 1).padStart(5, '0')}, HCM City`,
    }, user.token);
    if (r.status !== 200 || !Number.isInteger(r.json?.orderId)) throw new Error(`Checkout ${i + 1} failed: HTTP ${r.status} ${r.text}`);
    return r.json.orderId;
  });

  if (new Set(ids).size !== ids.length) throw new Error('SUT returned duplicate order IDs; CSV was not written.');
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const rows = ['admin_email,admin_password,order_id,current_status,next_status'];
  for (const id of ids) rows.push(`admin@eshop.com,Admin123!,${id},pending,confirmed`);
  fs.writeFileSync(DATA_FILE, `${rows.join('\n')}\n`);
  process.stdout.write(`Wrote ${ids.length} unique rows to ${DATA_FILE}\n`);
}

main().catch((error) => { process.stderr.write(`${error.stack || error}\n`); process.exit(1); });
