#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const CSV = path.resolve(__dirname, '..', 'data', 'admin-orders.csv');

function args(argv) {
  const o = { base: 'http://127.0.0.1:3000', iterations: 5, out: path.resolve(__dirname, '..', 'data', 'admin-baseline.json') };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--base') o.base = argv[++i]; else if (argv[i] === '--iterations') o.iterations = Number(argv[++i]); else if (argv[i] === '--out') o.out = path.resolve(argv[++i]); else throw new Error(`Unknown option ${argv[i]}`);
  }
  return o;
}

function timed(base, method, route, body, token) {
  const url = new URL(route, base); const payload = body === undefined ? null : Buffer.from(JSON.stringify(body)); const headers = {};
  if (payload) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = payload.length; } if (token) headers.Authorization = `Bearer ${token}`;
  const start = process.hrtime.bigint();
  return new Promise((resolve, reject) => { const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname, method, headers }, (res) => { const chunks = []; res.on('data', (c) => chunks.push(c)); res.on('end', () => { const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6; const text = Buffer.concat(chunks).toString('utf8'); let json; try { json = JSON.parse(text); } catch {} resolve({ status: res.statusCode, elapsedMs, bytes: Buffer.byteLength(text), json, text }); }); }); req.on('error', reject); if (payload) req.write(payload); req.end(); });
}

const percentile = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.ceil(p / 100 * s.length) - 1]; };
const round = (n) => Math.round(n * 100) / 100;

async function main() {
  const o = args(process.argv.slice(2));
  const rows = fs.readFileSync(CSV, 'utf8').trim().split(/\r?\n/).slice(1, o.iterations + 1).map((line) => { const [email, password, orderId, current, next] = line.split(','); return { email, password, orderId, current, next }; });
  if (rows.length < o.iterations) throw new Error(`CSV has only ${rows.length} rows.`);
  const stats = new Map(); const workflows = [];
  const step = async (label, method, route, body, token, check) => { const r = await timed(o.base, method, route, body, token); r.ok = r.status === 200 && check(r.json); if (!r.ok) throw new Error(`${label} failed: HTTP ${r.status} ${r.text.slice(0, 300)}`); if (!stats.has(label)) stats.set(label, []); stats.get(label).push(r); return r; };
  for (const row of rows) {
    const start = process.hrtime.bigint();
    const login = await step('01 login', 'POST', '/api/login', { email: row.email, password: row.password }, null, (j) => j?.token && j?.user?.role === 'admin');
    const token = login.json.token;
    await step('02 profile', 'GET', '/api/users/me', undefined, token, (j) => j?.role === 'admin' && j?.email === row.email);
    await step('03 orders before', 'GET', '/api/admin/orders', undefined, token, (j) => Array.isArray(j) && j.some((v) => String(v.id) === row.orderId && v.status === row.current));
    await step('04 products', 'GET', '/api/products', undefined, token, (j) => Array.isArray(j) && j.length > 0);
    await step('05 categories', 'GET', '/api/categories', undefined, token, (j) => Array.isArray(j) && j.length > 0);
    await step('06 update status', 'PUT', `/api/admin/orders/${row.orderId}/status`, { status: row.next }, token, (j) => j?.message === 'Order status updated');
    await step('07 orders verify', 'GET', '/api/admin/orders', undefined, token, (j) => Array.isArray(j) && j.some((v) => String(v.id) === row.orderId && v.status === row.next));
    workflows.push(Number(process.hrtime.bigint() - start) / 1e6);
  }
  const output = { base: o.base, iterations: rows.length, measuredWith: 'one virtual user, sequential, no think time, after Scenario D seed', steps: {}, workflow: { meanMs: round(workflows.reduce((a, b) => a + b) / workflows.length), p95Ms: round(percentile(workflows, 95)), maxMs: round(Math.max(...workflows)) } };
  for (const [label, values] of stats) { const times = values.map((v) => v.elapsedMs); output.steps[label] = { samples: times.length, meanMs: round(times.reduce((a, b) => a + b) / times.length), p95Ms: round(percentile(times, 95)), maxMs: round(Math.max(...times)), meanBytes: Math.round(values.reduce((a, b) => a + b.bytes, 0) / values.length) }; }
  fs.writeFileSync(o.out, `${JSON.stringify(output, null, 2)}\n`); process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main().catch((error) => { process.stderr.write(`${error.stack || error}\n`); process.exit(1); });
