#!/usr/bin/env node
/**
 * jtl-stats.js — recompute performance statistics from a raw CSV result log.
 *
 * The point of this tool is that every number in a report can be re-derived.
 * It reads the samples, not a summary, and it reports how each figure was
 * computed so a reader can disagree with the method rather than guess at it.
 *
 * Usage:
 *   node jtl-stats.js <run.jtl> [options]
 *
 * Options:
 *   --json                 emit the full result as JSON instead of tables
 *   --out <file>           write the JSON result to a file as well
 *   --bucket <ms>          time-series bucket width, default 1000
 *   --warmup <seconds>     exclude the first N seconds from the steady-state view
 *   --stable-window <n>    buckets a rate must hold to count as sustained, default 30
 *   --stable-error <pct>   error rate a sustained window may not exceed, default 1
 *   --check <claims.json>  verify claims against the log and exit non-zero on any failure
 *   --top <n>              per-label rows to print, default all
 *
 * Exit 0 normally; 1 when --check finds a false claim; 2 on usage or parse error.
 * No third-party dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/* --------------------------------------------------------------------- args */

function parseArgs(argv) {
  const o = { bucketMs: 1000, warmupSeconds: 0, stableWindow: 30, stableErrorPct: 1, top: Infinity };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) die(`Option ${a} needs a value.`, 2);
      return v;
    };
    switch (a) {
      case '--json': o.json = true; break;
      case '--out': o.out = next(); break;
      case '--bucket': o.bucketMs = Number(next()); break;
      case '--warmup': o.warmupSeconds = Number(next()); break;
      case '--stable-window': o.stableWindow = Number(next()); break;
      case '--stable-error': o.stableErrorPct = Number(next()); break;
      case '--check': o.check = next(); break;
      case '--top': o.top = Number(next()); break;
      default:
        if (a.startsWith('--')) die(`Unknown option ${a}`, 2);
        if (o.file) die('Give exactly one log file.', 2);
        o.file = a;
    }
  }
  if (!o.file) die('Usage: node jtl-stats.js <run.jtl> [options]', 2);
  return o;
}

function die(message, code) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

/* -------------------------------------------------------------------- parse */

const REQUIRED = ['timeStamp', 'elapsed', 'label', 'success'];

function parseLog(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (/^\s*<\?xml|<testResults/.test(text)) {
    die(
      `${file} is an XML result log. The dashboard generator and this tool both read CSV output; ` +
        'reconfigure the plan to save CSV and re-run, or convert the log before analysis.',
      2
    );
  }
  const lines = text.split(/\r?\n/).filter((l) => l !== '');
  if (lines.length < 2) die(`${file} contains ${lines.length} line(s); there are no samples to analyse.`, 2);

  const header = splitCsv(lines[0]);
  const missing = REQUIRED.filter((c) => !header.includes(c));
  if (missing.length) {
    die(`${file} has no header row with ${missing.join(', ')}. Enable "save field names" in the result collector.`, 2);
  }
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const samples = [];
  const malformed = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsv(lines[i]);
    if (cells.length < header.length) {
      // A response body containing a newline can split one sample across lines.
      malformed.push(i + 1);
      continue;
    }
    const ts = Number(cells[idx.timeStamp]);
    const elapsed = Number(cells[idx.elapsed]);
    if (!Number.isFinite(ts) || !Number.isFinite(elapsed)) {
      malformed.push(i + 1);
      continue;
    }
    samples.push({
      ts,
      elapsed,
      label: cells[idx.label],
      code: idx.responseCode !== undefined ? cells[idx.responseCode] : '',
      message: idx.responseMessage !== undefined ? cells[idx.responseMessage] : '',
      success: cells[idx.success] === 'true',
      failureMessage: idx.failureMessage !== undefined ? cells[idx.failureMessage] : '',
      latency: idx.Latency !== undefined ? Number(cells[idx.Latency]) : null,
      connect: idx.Connect !== undefined ? Number(cells[idx.Connect]) : null,
      bytes: idx.bytes !== undefined ? Number(cells[idx.bytes]) : null,
      allThreads: idx.allThreads !== undefined ? Number(cells[idx.allThreads]) : null,
    });
  }
  if (samples.length === 0) die(`${file} has a header but no readable samples.`, 2);
  return { samples, malformed, header };
}

function splitCsv(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 1; } else { quoted = false; }
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

/* ---------------------------------------------------------------- statistics */

/** Nearest-rank percentile over the sorted sample values. */
function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1];
}

function describe(samples) {
  const n = samples.length;
  const times = samples.map((s) => s.elapsed).sort((a, b) => a - b);
  const lat = samples.map((s) => s.latency).filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  const errors = samples.filter((s) => !s.success);
  const start = Math.min(...samples.map((s) => s.ts));
  const end = Math.max(...samples.map((s) => s.ts + s.elapsed));
  const spanSeconds = (end - start) / 1000;
  const sum = times.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = times.reduce((a, v) => a + (v - mean) ** 2, 0) / n;

  return {
    count: n,
    errors: errors.length,
    errorRatePct: round((errors.length / n) * 100, 3),
    min: times[0],
    max: times[n - 1],
    mean: round(mean, 2),
    stddev: round(Math.sqrt(variance), 2),
    p50: percentile(times, 50),
    p90: percentile(times, 90),
    p95: percentile(times, 95),
    p99: percentile(times, 99),
    latencyP95: lat.length ? percentile(lat, 95) : null,
    latencyMean: lat.length ? round(lat.reduce((a, b) => a + b, 0) / lat.length, 2) : null,
    firstSampleMs: start,
    lastSampleEndMs: end,
    spanSeconds: round(spanSeconds, 2),
    throughputPerSecond: spanSeconds > 0 ? round(n / spanSeconds, 2) : null,
  };
}

function histogram(samples, key) {
  const h = {};
  for (const s of samples) {
    const k = s[key] === '' ? '(empty)' : s[key];
    h[k] = (h[k] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(h).sort((a, b) => b[1] - a[1]));
}

function timeSeries(samples, bucketMs) {
  const start = Math.min(...samples.map((s) => s.ts));
  const buckets = new Map();
  for (const s of samples) {
    const b = Math.floor((s.ts - start) / bucketMs);
    if (!buckets.has(b)) buckets.set(b, []);
    buckets.get(b).push(s);
  }
  const keys = [...buckets.keys()].sort((a, b) => a - b);
  return keys.map((b) => {
    const rows = buckets.get(b);
    const times = rows.map((r) => r.elapsed).sort((a, b2) => a - b2);
    const errs = rows.filter((r) => !r.success).length;
    const threads = rows.map((r) => r.allThreads).filter((v) => Number.isFinite(v));
    return {
      offsetSeconds: round((b * bucketMs) / 1000, 3),
      epochMs: start + b * bucketMs,
      samples: rows.length,
      ratePerSecond: round(rows.length / (bucketMs / 1000), 2),
      errors: errs,
      errorRatePct: round((errs / rows.length) * 100, 2),
      meanMs: round(times.reduce((a, v) => a + v, 0) / times.length, 1),
      p95Ms: percentile(times, 95),
      maxThreads: threads.length ? Math.max(...threads) : null,
    };
  });
}

/**
 * The highest request rate the run actually held, as opposed to the highest it
 * ever touched. A single fast bucket is not capacity; a rate is only sustained
 * if it survived `window` consecutive buckets without the error rate rising.
 */
function sustainedRate(series, window, maxErrorPct) {
  if (series.length < window) {
    return { windowBuckets: window, sustainedRatePerSecond: null, reason: `run produced only ${series.length} buckets, fewer than the ${window}-bucket window` };
  }
  let best = null;
  for (let i = 0; i + window <= series.length; i += 1) {
    const slice = series.slice(i, i + window);
    if (slice.some((b) => b.errorRatePct > maxErrorPct)) continue;
    const totalSamples = slice.reduce((a, b) => a + b.samples, 0);
    const meanRate = slice.reduce((a, b) => a + b.ratePerSecond, 0) / window;
    const p95 = Math.max(...slice.map((b) => b.p95Ms));
    if (!best || meanRate > best.sustainedRatePerSecond) {
      best = {
        sustainedRatePerSecond: round(meanRate, 2),
        fromOffsetSeconds: slice[0].offsetSeconds,
        toOffsetSeconds: slice[window - 1].offsetSeconds,
        worstP95MsInWindow: p95,
        totalSamples,
      };
    }
  }
  if (!best) {
    return {
      windowBuckets: window,
      sustainedRatePerSecond: null,
      reason: `no ${window}-bucket window stayed at or below ${maxErrorPct}% errors; the run never reached a stable state`,
    };
  }
  return { windowBuckets: window, maxErrorPct, ...best };
}

/** Where added load stopped buying throughput and started buying latency. */
function saturation(series) {
  const withThreads = series.filter((b) => Number.isFinite(b.maxThreads));
  if (withThreads.length < 4) return { detected: false, reason: 'log has no allThreads column or too few buckets' };
  const peakRate = withThreads.reduce((a, b) => (b.ratePerSecond > a.ratePerSecond ? b : a));
  const after = withThreads.filter((b) => b.offsetSeconds > peakRate.offsetSeconds);
  const rising = after.filter((b) => b.maxThreads > peakRate.maxThreads && b.ratePerSecond <= peakRate.ratePerSecond);
  return {
    detected: rising.length > 0,
    peakRateBucket: { offsetSeconds: peakRate.offsetSeconds, ratePerSecond: peakRate.ratePerSecond, threads: peakRate.maxThreads, p95Ms: peakRate.p95Ms },
    bucketsWithMoreThreadsButNoMoreThroughput: rising.length,
    note: rising.length > 0
      ? `After ${peakRate.offsetSeconds}s the plan applied more threads without gaining throughput; that is the saturation point, and additional concurrency past it only adds latency.`
      : 'Throughput did not stop growing with concurrency within this run, so the ceiling was not reached. Do not quote the peak rate as capacity.',
  };
}

/** A soak's verdict is the difference between its ends, not its mean. */
function drift(series) {
  if (series.length < 10) return { measurable: false, reason: 'fewer than 10 buckets' };
  const tenth = Math.max(1, Math.floor(series.length / 10));
  const head = series.slice(0, tenth);
  const tail = series.slice(-tenth);
  const meanOf = (arr, k) => round(arr.reduce((a, b) => a + b[k], 0) / arr.length, 2);
  const firstP95 = meanOf(head, 'p95Ms');
  const lastP95 = meanOf(tail, 'p95Ms');
  return {
    measurable: true,
    tenthBuckets: tenth,
    firstTenth: { meanMs: meanOf(head, 'meanMs'), p95Ms: firstP95, ratePerSecond: meanOf(head, 'ratePerSecond'), errorRatePct: meanOf(head, 'errorRatePct') },
    lastTenth: { meanMs: meanOf(tail, 'meanMs'), p95Ms: lastP95, ratePerSecond: meanOf(tail, 'ratePerSecond'), errorRatePct: meanOf(tail, 'errorRatePct') },
    p95ChangePct: firstP95 > 0 ? round(((lastP95 - firstP95) / firstP95) * 100, 1) : null,
  };
}

function round(v, d = 2) {
  if (v === null || v === undefined || !Number.isFinite(v)) return null;
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

/* ------------------------------------------------------------------- claims */

const METRIC_ALIASES = {
  median: 'p50',
  avg: 'mean',
  average: 'mean',
  responseTime: 'mean',
  rps: 'throughputPerSecond',
  throughput: 'throughputPerSecond',
  errorRate: 'errorRatePct',
};

const OPS = {
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
};

function runChecks(claimsFile, result) {
  const claims = JSON.parse(fs.readFileSync(claimsFile, 'utf8'));
  if (!Array.isArray(claims)) die(`${claimsFile} must contain a JSON array of claims.`, 2);

  return claims.map((c, i) => {
    const id = c.id || `claim-${i + 1}`;
    const label = c.label || 'ALL';
    const metricKey = METRIC_ALIASES[c.metric] || c.metric;
    const scope =
      label === 'ALL'
        ? result.overall
        : result.byLabel[label];

    if (!scope) {
      return { id, claim: c.claim || null, label, metric: c.metric, verdict: 'UNCHECKABLE', reason: `no label "${label}" in the log; labels present: ${Object.keys(result.byLabel).join(', ')}` };
    }

    let observed = scope[metricKey];
    if (observed === undefined) {
      if (metricKey === 'maxStableRps') observed = result.sustained.sustainedRatePerSecond;
      else if (metricKey === 'peakRps') observed = result.peakBucketRatePerSecond;
    }
    if (observed === undefined || observed === null) {
      return { id, claim: c.claim || null, label, metric: c.metric, verdict: 'UNCHECKABLE', reason: `metric "${c.metric}" is not derivable from this log` };
    }

    const op = OPS[c.op];
    if (!op) return { id, claim: c.claim || null, label, metric: c.metric, verdict: 'UNCHECKABLE', reason: `unknown comparison "${c.op}"` };

    const holds = op(observed, c.value);
    return {
      id,
      claim: c.claim || `${label}.${c.metric} ${c.op} ${c.value}`,
      source: c.source || null,
      label,
      metric: c.metric,
      claimed: `${c.op} ${c.value}`,
      observed,
      verdict: holds ? 'SUPPORTED' : 'CONTRADICTED',
      citation: `${path.basename(result.file)} -> ${label === 'ALL' ? 'all samples' : `label "${label}"`}, ${metricKey} = ${observed}`,
    };
  });
}

/* --------------------------------------------------------------------- main */

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const { samples, malformed, header } = parseLog(opts.file);

  const runStart = Math.min(...samples.map((s) => s.ts));
  const steady = opts.warmupSeconds > 0
    ? samples.filter((s) => s.ts >= runStart + opts.warmupSeconds * 1000)
    : samples;
  if (steady.length === 0) die(`--warmup ${opts.warmupSeconds} excludes every sample.`, 2);

  const labels = [...new Set(samples.map((s) => s.label))];
  const byLabel = {};
  for (const l of labels) byLabel[l] = describe(samples.filter((s) => s.label === l));

  const series = timeSeries(samples, opts.bucketMs);
  const errorSamples = samples.filter((s) => !s.success);

  const result = {
    file: path.resolve(opts.file),
    generatedFrom: `${samples.length} samples${malformed.length ? `, ${malformed.length} malformed line(s) skipped` : ''}`,
    method: {
      percentile: 'nearest rank over sorted elapsed values',
      errorRate: 'share of samples whose success column is false, i.e. after assertions — not the HTTP status',
      throughput: 'sample count divided by (last sample end - first sample start)',
      bucketMs: opts.bucketMs,
    },
    columnsPresent: header,
    malformedLines: malformed,
    overall: describe(samples),
    steadyState: opts.warmupSeconds > 0 ? { warmupSecondsExcluded: opts.warmupSeconds, ...describe(steady) } : null,
    byLabel,
    responseCodes: histogram(samples, 'code'),
    errorsByLabel: errorSamples.length ? histogram(errorSamples, 'label') : {},
    errorsByCode: errorSamples.length ? histogram(errorSamples, 'code') : {},
    errorsByMessage: errorSamples.length ? histogram(errorSamples, 'failureMessage') : {},
    peakBucketRatePerSecond: series.length ? Math.max(...series.map((b) => b.ratePerSecond)) : null,
    peakConcurrentThreads: Math.max(...series.map((b) => b.maxThreads ?? 0)) || null,
    sustained: sustainedRate(series, opts.stableWindow, opts.stableErrorPct),
    saturation: saturation(series),
    drift: drift(series),
    timeSeries: series,
  };

  let checks = null;
  let failedChecks = 0;
  if (opts.check) {
    checks = runChecks(opts.check, result);
    result.claimChecks = checks;
    failedChecks = checks.filter((c) => c.verdict !== 'SUPPORTED').length;
  }

  if (opts.out) {
    fs.writeFileSync(opts.out, `${JSON.stringify(result, null, 2)}\n`);
  }

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return failedChecks > 0 ? 1 : 0;
  }

  printTables(result, opts, checks);
  return failedChecks > 0 ? 1 : 0;
}

function printTables(r, opts, checks) {
  const o = r.overall;
  const w = process.stdout.write.bind(process.stdout);

  w(`\n${path.basename(r.file)}\n`);
  w(`${r.generatedFrom}, span ${o.spanSeconds}s\n`);
  if (r.malformedLines.length) {
    w(`WARNING: ${r.malformedLines.length} line(s) could not be parsed (first at line ${r.malformedLines[0]}). A response body containing a newline splits a sample across lines; the counts below exclude them.\n`);
  }

  w('\nOVERALL\n');
  w(`  samples ${o.count}   errors ${o.errors} (${o.errorRatePct}%)\n`);
  w(`  elapsed ms: min ${o.min}  mean ${o.mean}  p50 ${o.p50}  p90 ${o.p90}  p95 ${o.p95}  p99 ${o.p99}  max ${o.max}  sd ${o.stddev}\n`);
  if (o.latencyP95 !== null) {
    w(`  latency (time to first byte) ms: mean ${o.latencyMean}  p95 ${o.latencyP95}\n`);
    const transfer = o.p95 - o.latencyP95;
    if (transfer > o.latencyP95 * 0.25) {
      w(`  NOTE: p95 exceeds latency p95 by ${transfer} ms, so a quarter or more of the cost is transferring the response, not producing it.\n`);
    }
  }
  w(`  throughput ${o.throughputPerSecond}/s over the whole run\n`);

  if (r.steadyState) {
    const s = r.steadyState;
    w(`\nSTEADY STATE (first ${s.warmupSecondsExcluded}s excluded)\n`);
    w(`  samples ${s.count}   errors ${s.errors} (${s.errorRatePct}%)   p95 ${s.p95}   throughput ${s.throughputPerSecond}/s\n`);
    if (Math.abs(s.p95 - o.p95) > o.p95 * 0.1) {
      w(`  NOTE: steady-state p95 differs from the whole-run p95 by more than 10%. Quoting the whole-run figure blends the ramp-up into the result.\n`);
    }
  }

  w('\nPER LABEL (sorted by p95)\n');
  const rows = Object.entries(r.byLabel).sort((a, b) => b[1].p95 - a[1].p95).slice(0, opts.top);
  const nameWidth = Math.max(5, ...rows.map(([l]) => l.length));
  w(`  ${'label'.padEnd(nameWidth)}  ${'n'.padStart(7)}  ${'err%'.padStart(6)}  ${'mean'.padStart(7)}  ${'p95'.padStart(7)}  ${'p99'.padStart(7)}  ${'max'.padStart(7)}  ${'rps'.padStart(7)}\n`);
  for (const [label, s] of rows) {
    w(`  ${label.padEnd(nameWidth)}  ${String(s.count).padStart(7)}  ${String(s.errorRatePct).padStart(6)}  ${String(s.mean).padStart(7)}  ${String(s.p95).padStart(7)}  ${String(s.p99).padStart(7)}  ${String(s.max).padStart(7)}  ${String(s.throughputPerSecond).padStart(7)}\n`);
  }

  w('\nRESPONSE CODES\n');
  for (const [code, n] of Object.entries(r.responseCodes)) w(`  ${code}: ${n}\n`);
  if (o.errors > 0) {
    w('\nFAILURES\n');
    for (const [k, n] of Object.entries(r.errorsByLabel)) w(`  by label   ${k}: ${n}\n`);
    for (const [k, n] of Object.entries(r.errorsByCode)) w(`  by code    ${k}: ${n}\n`);
    for (const [k, n] of Object.entries(r.errorsByMessage).slice(0, 5)) w(`  by message ${k}: ${n}\n`);
    w('  Classify each of these as service failure, exhausted test data, authentication or lockout side effect, or deliberate overload response before reporting them.\n');
  }

  w('\nRATE\n');
  w(`  peak single-bucket rate ${r.peakBucketRatePerSecond}/s   peak concurrent threads ${r.peakConcurrentThreads ?? 'n/a'}\n`);
  if (r.sustained.sustainedRatePerSecond !== null) {
    w(`  maximum sustained rate ${r.sustained.sustainedRatePerSecond}/s over ${r.sustained.windowBuckets} buckets ` +
      `(${r.sustained.fromOffsetSeconds}s-${r.sustained.toOffsetSeconds}s) at or below ${r.sustained.maxErrorPct}% errors, worst p95 in window ${r.sustained.worstP95MsInWindow} ms\n`);
    w('  The sustained rate is the capacity figure. The peak bucket is not.\n');
  } else {
    w(`  no sustained rate: ${r.sustained.reason}\n`);
  }

  w('\nSATURATION\n');
  w(`  ${r.saturation.note}\n`);

  if (r.drift.measurable) {
    const d = r.drift;
    w('\nDRIFT (first tenth vs last tenth)\n');
    w(`  p95   ${d.firstTenth.p95Ms} -> ${d.lastTenth.p95Ms} ms (${d.p95ChangePct > 0 ? '+' : ''}${d.p95ChangePct}%)\n`);
    w(`  rate  ${d.firstTenth.ratePerSecond} -> ${d.lastTenth.ratePerSecond} /s\n`);
    w(`  err%  ${d.firstTenth.errorRatePct} -> ${d.lastTenth.errorRatePct}\n`);
    if (d.p95ChangePct !== null && d.p95ChangePct > 20) {
      w('  Latency drifted upward across the run. A mean over the whole run conceals this; report the trend.\n');
    }
  }

  if (checks) {
    w('\nCLAIM CHECKS\n');
    for (const c of checks) {
      w(`  [${c.verdict}] ${c.id}: ${c.claim}\n`);
      if (c.verdict === 'UNCHECKABLE') w(`      ${c.reason}\n`);
      else w(`      claimed ${c.claimed}, log gives ${c.observed}  (${c.citation})\n`);
    }
    const bad = checks.filter((c) => c.verdict !== 'SUPPORTED').length;
    w(`  ${checks.length - bad}/${checks.length} claim(s) supported by the log.\n`);
  }

  if (opts.out) w(`\nJSON written to ${opts.out}\n`);
  w('\n');
}

process.exit(main());
