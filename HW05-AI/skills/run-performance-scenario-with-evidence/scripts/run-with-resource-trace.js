#!/usr/bin/env node
/**
 * run-with-resource-trace.js — run a load tool while sampling the system under
 * test, so the resource figures and the load figures come from one wall-clock
 * window and can be checked against each other afterwards.
 *
 * Usage:
 *   node run-with-resource-trace.js --label <stem> --out <dir> [target] [options] -- <command ...>
 *
 * Target (exactly one; --port is the reliable one — a runtime that forks shows
 * several processes with the same name and only one is holding the socket):
 *   --pid <n>           watch this process id
 *   --port <n>          watch whichever process is listening on this TCP port
 *   --name <process>    watch the single process with this name; fails if ambiguous
 *
 * Options:
 *   --interval <ms>     sampling period, default 1000
 *   --note <text>       free-text note recorded in the run metadata (repeatable)
 *   --no-fail           always exit 0; the metadata still records the tool's code
 *
 * Writes <out>/<label>.resources.csv and <out>/<label>.run.json.
 * Exits with the load tool's exit code unless --no-fail. No dependencies.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const WINDOWS = process.platform === 'win32';

/* ------------------------------------------------------------------- args */

function parseArgs(argv) {
  const opts = { interval: 1000, notes: [], failOnError: true };
  const sep = argv.indexOf('--');
  if (sep === -1) usage('Missing "--" separator before the load-tool command.');
  const flags = argv.slice(0, sep);
  opts.command = argv.slice(sep + 1);
  if (opts.command.length === 0) usage('No load-tool command given after "--".');

  for (let i = 0; i < flags.length; i += 1) {
    const a = flags[i];
    const next = () => {
      const v = flags[++i];
      if (v === undefined) usage(`Option ${a} needs a value.`);
      return v;
    };
    switch (a) {
      case '--label': opts.label = next(); break;
      case '--out': opts.out = next(); break;
      case '--pid': opts.pid = Number(next()); break;
      case '--port': opts.port = Number(next()); break;
      case '--name': opts.name = next(); break;
      case '--interval': opts.interval = Number(next()); break;
      case '--note': opts.notes.push(next()); break;
      case '--no-fail': opts.failOnError = false; break;
      default: usage(`Unknown option ${a}`);
    }
  }
  if (!opts.label) usage('--label is required.');
  if (!opts.out) usage('--out is required.');
  const targets = [opts.pid, opts.port, opts.name].filter((v) => v !== undefined);
  if (targets.length !== 1) usage('Give exactly one of --pid, --port, --name.');
  return opts;
}

function usage(message) {
  process.stderr.write(`${message}\nSee the header of this file for usage.\n`);
  process.exit(2);
}

/* --------------------------------------------------------- target resolution */

function resolvePid(opts) {
  if (opts.pid) {
    if (!processAlive(opts.pid)) fail(`No process with pid ${opts.pid} is running.`);
    return { pid: opts.pid, how: `--pid ${opts.pid}` };
  }
  if (opts.port) {
    const pids = pidsOnPort(opts.port);
    if (pids.length === 0) fail(`No process is listening on port ${opts.port}.`);
    if (pids.length > 1) fail(`Several processes are listening on port ${opts.port}: ${pids.join(', ')}. Pass --pid.`);
    return { pid: pids[0], how: `listening on port ${opts.port}` };
  }
  const pids = pidsByName(opts.name);
  if (pids.length === 0) fail(`No process named "${opts.name}" is running.`);
  if (pids.length > 1) {
    fail(
      `${pids.length} processes are named "${opts.name}" (${pids.join(', ')}). ` +
        'Watching the wrong one measures nothing. Use --port to pick the one holding the socket, or --pid.'
    );
  }
  return { pid: pids[0], how: `only process named ${opts.name}` };
}

function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

function pidsOnPort(port) {
  if (WINDOWS) {
    const r = spawnSync(
      'powershell',
      ['-NoProfile', '-Command',
        `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
        'Select-Object -ExpandProperty OwningProcess -Unique'],
      { encoding: 'utf8' }
    );
    return parsePids(r.stdout);
  }
  const r = spawnSync('sh', ['-c', `lsof -nP -iTCP:${port} -sTCP:LISTEN -t 2>/dev/null`], { encoding: 'utf8' });
  return parsePids(r.stdout);
}

function pidsByName(name) {
  const base = name.replace(/\.(exe|bat|cmd)$/i, '');
  if (WINDOWS) {
    const r = spawnSync(
      'powershell',
      ['-NoProfile', '-Command', `Get-Process -Name '${base}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id`],
      { encoding: 'utf8' }
    );
    return parsePids(r.stdout);
  }
  const r = spawnSync('sh', ['-c', `pgrep -x ${base} 2>/dev/null`], { encoding: 'utf8' });
  return parsePids(r.stdout);
}

function parsePids(stdout) {
  return [...new Set((stdout || '').split(/\r?\n/).map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0))];
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

/* ------------------------------------------------------------------ sampler */

const CSV_HEADER = 'iso,epochMs,cpuSeconds,cpuPercent,workingSetBytes,privateBytes\n';

/**
 * One long-lived shell loop emits CSV rows. Spawning a probe per sample would
 * put the sampler's own start-up cost on the machine being measured.
 */
function startSampler(pid, intervalMs, csvPath) {
  fs.writeFileSync(csvPath, CSV_HEADER);
  const sink = fs.createWriteStream(csvPath, { flags: 'a' });

  let child;
  if (WINDOWS) {
    const ps = `
$ErrorActionPreference = 'Stop'
$target = ${pid}
$cores = [Environment]::ProcessorCount
$prevCpu = $null
$prevTime = $null
while ($true) {
  try { $p = Get-Process -Id $target -ErrorAction Stop } catch { break }
  $now = [DateTime]::UtcNow
  $cpu = $p.CPU
  if ($null -eq $cpu) { $cpu = 0 }
  $pct = ''
  if ($null -ne $prevCpu) {
    $dt = ($now - $prevTime).TotalSeconds
    if ($dt -gt 0) { $pct = [math]::Round((($cpu - $prevCpu) / $dt / $cores) * 100, 2) }
  }
  '{0},{1},{2},{3},{4},{5}' -f $now.ToString('o'), [int64](([DateTimeOffset]$now).ToUnixTimeMilliseconds()), [math]::Round($cpu,3), $pct, $p.WorkingSet64, $p.PrivateMemorySize64
  $prevCpu = $cpu
  $prevTime = $now
  Start-Sleep -Milliseconds ${intervalMs}
}`;
    child = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { windowsHide: true });
  } else {
    const sh = `
prev_cpu=""
prev_t=""
cores=$(getconf _NPROCESSORS_ONLN 2>/dev/null || echo 1)
while kill -0 ${pid} 2>/dev/null; do
  now_ms=$(date +%s%3N)
  read cpu_time rss < <(ps -o cputime=,rss= -p ${pid} | awk '{print $1, $2}')
  secs=$(echo "$cpu_time" | awk -F: '{n=NF; s=0; m=1; for(i=n;i>=1;i--){s+=$i*m; m*=60} print s}')
  pct=""
  if [ -n "$prev_cpu" ]; then
    pct=$(awk -v c="$secs" -v p="$prev_cpu" -v t="$now_ms" -v pt="$prev_t" -v k="$cores" \
      'BEGIN{d=(t-pt)/1000; if(d>0) printf "%.2f", ((c-p)/d/k)*100}')
  fi
  iso=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
  echo "$iso,$now_ms,$secs,$pct,$((rss*1024)),$((rss*1024))"
  prev_cpu=$secs
  prev_t=$now_ms
  sleep $(awk -v i=${intervalMs} 'BEGIN{printf "%.3f", i/1000}')
done`;
    child = spawn('bash', ['-c', sh]);
  }

  child.stdout.on('data', (chunk) => sink.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(`[sampler] ${chunk}`));
  return { child, sink };
}

/* -------------------------------------------------------------- trace stats */

function summariseTrace(csvPath) {
  const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '');
  const rows = lines.slice(1).map((l) => l.split(','));
  if (rows.length === 0) return { samples: 0 };
  const num = (v) => (v === undefined || v === '' ? null : Number(v));
  const cpu = rows.map((r) => num(r[3])).filter((v) => v !== null && Number.isFinite(v));
  const mem = rows.map((r) => num(r[4])).filter((v) => v !== null && Number.isFinite(v));
  const epochs = rows.map((r) => num(r[1])).filter((v) => v !== null);
  const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
  const tenth = Math.max(1, Math.floor(mem.length / 10));
  return {
    samples: rows.length,
    firstSampleMs: epochs[0] ?? null,
    lastSampleMs: epochs[epochs.length - 1] ?? null,
    coveredSeconds: epochs.length > 1 ? Math.round((epochs[epochs.length - 1] - epochs[0]) / 1000) : 0,
    cpuPercent: { mean: round(mean(cpu)), peak: cpu.length ? round(Math.max(...cpu)) : null },
    memoryBytes: {
      mean: mem.length ? Math.round(mean(mem)) : null,
      ceiling: mem.length ? Math.max(...mem) : null,
      first: mem[0] ?? null,
      last: mem[mem.length - 1] ?? null,
      // A soak's verdict lives in the difference between these two, not the mean.
      firstTenthMean: Math.round(mean(mem.slice(0, tenth))),
      lastTenthMean: Math.round(mean(mem.slice(-tenth))),
    },
  };
}

function round(v) {
  return v === null ? null : Math.round(v * 100) / 100;
}

/* --------------------------------------------------------------------- main */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  fs.mkdirSync(opts.out, { recursive: true });

  const target = resolvePid(opts);
  const csvPath = path.join(opts.out, `${opts.label}.resources.csv`);
  const metaPath = path.join(opts.out, `${opts.label}.run.json`);

  process.stdout.write(`Watching pid ${target.pid} (${target.how}), sampling every ${opts.interval} ms.\n`);
  process.stdout.write(`Running: ${opts.command.join(' ')}\n\n`);

  const sampler = startSampler(target.pid, opts.interval, csvPath);
  const startedAt = new Date();

  const code = await new Promise((resolve) => {
    const child = spawn(opts.command[0], opts.command.slice(1), { stdio: 'inherit', shell: WINDOWS });
    child.on('error', (err) => {
      process.stderr.write(`Failed to start load tool: ${err.message}\n`);
      resolve(127);
    });
    child.on('close', resolve);
  });

  const finishedAt = new Date();
  sampler.child.kill();
  await new Promise((r) => setTimeout(r, 300));
  sampler.sink.end();
  await new Promise((r) => sampler.sink.on('close', r));

  const trace = summariseTrace(csvPath);
  const meta = {
    label: opts.label,
    command: opts.command,
    exitCode: code,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationSeconds: Math.round((finishedAt - startedAt) / 1000),
    watched: { pid: target.pid, resolvedBy: target.how, samplingIntervalMs: opts.interval },
    environment: {
      hostname: os.hostname(),
      platform: `${os.platform()} ${os.release()}`,
      arch: os.arch(),
      cpuModel: os.cpus()[0] ? os.cpus()[0].model : null,
      cpuCount: os.cpus().length,
      totalMemoryBytes: os.totalmem(),
      nodeVersion: process.version,
      loadGeneratorOnSameHost: true,
    },
    resourceTrace: trace,
    notes: opts.notes,
    artefacts: { resourceCsv: path.resolve(csvPath) },
  };
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

  process.stdout.write(`\nLoad tool exited ${code}.\n`);
  if (trace.samples === 0) {
    process.stdout.write('WARNING: the resource trace is empty. The watched process was gone or unreadable; the run has no resource evidence.\n');
  } else {
    const mb = (b) => (b === null ? '?' : `${(b / 1048576).toFixed(1)} MB`);
    process.stdout.write(
      `Resource trace: ${trace.samples} samples over ${trace.coveredSeconds}s, ` +
        `CPU peak ${trace.cpuPercent.peak}% (mean ${trace.cpuPercent.mean}%), ` +
        `memory ceiling ${mb(trace.memoryBytes.ceiling)} ` +
        `(first tenth ${mb(trace.memoryBytes.firstTenthMean)} -> last tenth ${mb(trace.memoryBytes.lastTenthMean)})\n`
    );
    if (trace.coveredSeconds < meta.durationSeconds - 2) {
      process.stdout.write(
        `WARNING: the trace covers ${trace.coveredSeconds}s of a ${meta.durationSeconds}s run. ` +
          'It does not prove what happened at peak load.\n'
      );
    }
  }
  process.stdout.write(`Metadata: ${metaPath}\n`);

  process.exit(opts.failOnError ? code : 0);
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(2);
});
