#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const CSV = path.resolve(__dirname, '..', 'data', 'admin-orders.csv');
const base = process.argv[2] || 'http://127.0.0.1:3000';

function request(method, route, body, token) {
  const url = new URL(route, base);
  const payload = body === undefined ? null : Buffer.from(JSON.stringify(body));
  const headers = {};
  if (payload) { headers['Content-Type'] = 'application/json'; headers['Content-Length'] = payload.length; }
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: url.hostname, port: url.port, path: url.pathname, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => { const text = Buffer.concat(chunks).toString('utf8'); let json; try { json = JSON.parse(text); } catch {} resolve({ status: res.statusCode, json, text }); });
    });
    req.on('error', reject); if (payload) req.write(payload); req.end();
  });
}

async function main() {
  if (!fs.existsSync(CSV)) throw new Error(`Missing ${CSV}; run seed-admin-orders.js after restarting the backend.`);
  const lines = fs.readFileSync(CSV, 'utf8').trim().split(/\r?\n/).slice(1);
  const rows = lines.map((line) => { const [email, password, id, current, next] = line.split(','); return { email, password, id, current, next }; });
  const ids = rows.map((r) => r.id);
  if (new Set(ids).size !== ids.length) throw new Error('CSV contains duplicate order IDs.');
  if (rows.some((r) => r.current !== 'pending' || r.next !== 'confirmed')) throw new Error('CSV includes a transition other than pending -> confirmed.');

  const login = await request('POST', '/api/login', { email: rows[0].email, password: rows[0].password });
  if (login.status !== 200 || !login.json?.token || login.json?.user?.role !== 'admin') throw new Error(`Admin login/role pre-check failed: HTTP ${login.status}`);
  const list = await request('GET', '/api/admin/orders', undefined, login.json.token);
  if (list.status !== 200 || !Array.isArray(list.json)) throw new Error(`Order list failed: HTTP ${list.status}`);
  const state = new Map(list.json.map((o) => [String(o.id), o.status]));
  const bad = rows.filter((r) => state.get(r.id) !== r.current);
  if (bad.length) throw new Error(`${bad.length}/${rows.length} CSV orders are missing or not pending. Restart and reseed before the measured run.`);
  process.stdout.write(`PASS: ${rows.length} unique pending orders; admin role verified; base=${base}\n`);
}

main().catch((error) => { process.stderr.write(`${error.stack || error}\n`); process.exit(1); });
