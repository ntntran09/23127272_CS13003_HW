#!/usr/bin/env node
/**
 * validate-test-plan.js — structural review of JMeter .jmx plans.
 *
 * Checks the properties a performance plan needs in order to measure anything:
 * bounded thread groups, external data, think time, real assertions, correlation,
 * a distinct result view per plan in a family, and a naming stem that lets plan,
 * raw log, and report be matched later.
 *
 * Usage:
 *   node validate-test-plan.js <plan.jmx> [more-plans.jmx ...]
 *
 * Options:
 *   --name-pattern <regex>  Test-plan name pattern. Default: ^.+_.+_\d{8}$
 *   --json                  Emit JSON only, no human-readable summary.
 *   --allow-shared-view     Do not fail when two plans reuse a listener class.
 *
 * Exit code 0 when every plan passes, 1 when any check fails, 2 on usage error.
 * No third-party dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/* ------------------------------------------------------------------ parsing */

// A .jmx is XML, but we only need element names, testname attributes, and the
// <stringProp name="...">value</stringProp> children each element owns. A full
// XML parser would be a dependency; a scan over tags is enough and cannot be
// tripped by the subset of XML JMeter writes.

function readPlan(file) {
  const xml = fs.readFileSync(file, 'utf8');
  if (!/<jmeterTestPlan/.test(xml)) {
    throw new Error(`${file} is not a JMeter test plan (no <jmeterTestPlan> root)`);
  }
  return xml;
}

const TAG = /<([A-Za-z][\w.$]*)\b([^>]*?)(\/?)>/g;

/** Every element in document order, with its attributes and its own props. */
function elements(xml) {
  const out = [];
  let m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(xml)) !== null) {
    const [, name, rawAttrs, selfClose] = m;
    if (name === 'jmeterTestPlan' || name === 'hashTree') continue;
    if (/^(stringProp|boolProp|intProp|longProp|doubleProp|collectionProp|elementProp|objProp|name|value)$/.test(name)) continue;
    out.push({
      name,
      attrs: parseAttrs(rawAttrs),
      start: m.index,
      end: selfClose ? m.index + m[0].length : findClose(xml, name, m.index + m[0].length),
    });
  }
  for (const el of out) el.body = xml.slice(el.start, el.end);
  return out;
}

function parseAttrs(raw) {
  const attrs = {};
  const re = /([\w:.-]+)\s*=\s*"([^"]*)"/g;
  let a;
  while ((a = re.exec(raw)) !== null) attrs[a[1]] = decode(a[2]);
  return attrs;
}

function findClose(xml, name, from) {
  const open = new RegExp(`<${escapeRe(name)}\\b`, 'g');
  const close = new RegExp(`</${escapeRe(name)}>`, 'g');
  let depth = 1;
  let cursor = from;
  while (depth > 0) {
    close.lastIndex = cursor;
    const c = close.exec(xml);
    if (!c) return xml.length;
    open.lastIndex = cursor;
    let o = open.exec(open.input === xml ? xml : xml);
    let nested = 0;
    while (o && o.index < c.index) {
      nested += 1;
      open.lastIndex = o.index + 1;
      o = open.exec(xml);
    }
    depth += nested - 1;
    cursor = c.index + c[0].length;
  }
  return cursor;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decode(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Props declared directly by an element, excluding those of nested elements. */
function propsOf(el, allElements) {
  const inner = allElements.filter((o) => o !== el && o.start > el.start && o.end <= el.end);
  let body = el.body;
  // Blank out nested elements so their props are not attributed to the parent.
  for (const child of inner) {
    const rel = child.start - el.start;
    body = body.slice(0, rel) + ' '.repeat(child.end - child.start) + body.slice(child.end - el.start);
  }
  const props = {};
  const re = /<(?:string|bool|int|long|double)Prop\s+name="([^"]+)"\s*>([\s\S]*?)<\/(?:string|bool|int|long|double)Prop>/g;
  let p;
  while ((p = re.exec(body)) !== null) props[p[1]] = decode(p[2]).trim();
  const empty = /<(?:string|bool|int|long|double)Prop\s+name="([^"]+)"\s*\/>/g;
  while ((p = empty.exec(body)) !== null) if (!(p[1] in props)) props[p[1]] = '';
  return props;
}

/** Props anywhere inside an element, including nested elementProp trees. */
function allPropsIn(el) {
  const props = {};
  const re = /<(?:string|bool|int|long|double)Prop\s+name="([^"]+)"\s*>([\s\S]*?)<\/(?:string|bool|int|long|double)Prop>/g;
  let p;
  while ((p = re.exec(el.body)) !== null) {
    const key = p[1];
    const val = decode(p[2]).trim();
    if (!(key in props)) props[key] = [];
    props[key].push(val);
  }
  return props;
}

/* ------------------------------------------------------------- classification */

const THREAD_GROUPS = /ThreadGroup$|ThreadGroup\b|ConcurrencyThreadGroup|SteppingThreadGroup|UltimateThreadGroup|ArrivalsThreadGroup/;
const TIMERS = /Timer$/;
const ASSERTIONS = /Assertion$/;
const EXTRACTORS = /Extractor$|RegexExtractor|JSONPostProcessor|BoundaryExtractor|XPath2Extractor/;
const SAMPLERS = /HTTPSamplerProxy|HTTPSampler$|JSR223Sampler|DebugSampler/;

function classify(xml, file, opts) {
  const els = elements(xml);
  const byName = (re) => els.filter((e) => re.test(e.name));

  const testPlanEl = els.find((e) => e.name === 'TestPlan');
  const threadGroups = byName(THREAD_GROUPS).filter((e) => e.name !== 'ThreadGroupGui');
  const samplers = byName(SAMPLERS);
  const timers = byName(TIMERS);
  const assertions = byName(ASSERTIONS);
  const extractors = byName(EXTRACTORS);
  const dataSets = els.filter((e) => e.name === 'CSVDataSet');
  const listeners = els.filter((e) => e.name === 'ResultCollector');

  return {
    file,
    planName: testPlanEl ? testPlanEl.attrs.testname : null,
    threadGroups: threadGroups.map((tg) => {
      const p = propsOf(tg, els);
      const loops = allPropsIn(tg)['LoopController.loops'];
      return {
        name: tg.attrs.testname || tg.name,
        type: tg.name,
        threads: p['ThreadGroup.num_threads'] ?? p['ConcurrencyThreadGroup.TargetLevel'] ?? null,
        rampUp: p['ThreadGroup.ramp_time'] ?? p['ConcurrencyThreadGroup.RampUp'] ?? null,
        scheduler: p['ThreadGroup.scheduler'] === 'true',
        duration: p['ThreadGroup.duration'] ?? p['ConcurrencyThreadGroup.Hold'] ?? null,
        startDelay: p['ThreadGroup.delay'] ?? null,
        loops: loops ? loops[0] : null,
        infiniteLoop: !!loops && (loops[0] === '-1' || loops[0] === ''),
      };
    }),
    samplers: samplers.map((s) => {
      const p = propsOf(s, els);
      return {
        name: s.attrs.testname || s.name,
        method: p['HTTPSampler.method'] || null,
        path: p['HTTPSampler.path'] || null,
        body: (allPropsIn(s)['Argument.value'] || []).join('\n'),
      };
    }),
    timers: timers.map((t) => ({ name: t.attrs.testname || t.name, type: t.name })),
    assertions: assertions.map((a) => {
      const p = propsOf(a, els);
      const patterns = (allPropsIn(a)[''] || []).concat(allPropsIn(a)['-1'] || []);
      return {
        name: a.attrs.testname || a.name,
        type: a.name,
        field: p['Assertion.test_field'] || null,
        // 2 = contains, 8 = substring, 1 = matches, 16 = equals (Assertion.test_type bitmask)
        testType: p['Assertion.test_type'] || null,
        patterns,
        raw: a.body,
      };
    }),
    extractors: extractors.map((e) => {
      const p = propsOf(e, els);
      return {
        name: e.attrs.testname || e.name,
        type: e.name,
        variable: p['JSONPostProcessor.referenceNames'] || p['RegexExtractor.refname'] || p['BoundaryExtractor.refname'] || null,
        defaultValue:
          p['JSONPostProcessor.defaultValues'] ??
          p['RegexExtractor.default'] ??
          p['BoundaryExtractor.default'] ??
          null,
      };
    }),
    dataSets: dataSets.map((d) => {
      const p = propsOf(d, els);
      return {
        name: d.attrs.testname || d.name,
        filename: p['filename'] || null,
        variableNames: p['variableNames'] || '',
        recycle: p['recycle'] === 'true',
        stopThread: p['stopThread'] === 'true',
        shareMode: p['shareMode'] || null,
      };
    }),
    listeners: listeners.map((l) => ({
      name: l.attrs.testname || l.name,
      guiclass: l.attrs.guiclass || null,
      filename: propsOf(l, els)['filename'] || '',
    })),
    variablesUsed: uniq((xml.match(/\$\{(?!__)[A-Za-z_][\w]*\}/g) || []).map((v) => v.slice(2, -1))),
    opts,
  };
}

function uniq(a) {
  return [...new Set(a)];
}

/* ------------------------------------------------------------------- checks */

function checkPlan(plan, family) {
  const problems = [];
  const notes = [];
  const fail = (code, message) => problems.push({ code, message });

  /* naming */
  if (!plan.planName) {
    fail('NAME_MISSING', 'Test plan has no testname attribute.');
  } else if (!family.namePattern.test(plan.planName)) {
    fail('NAME_PATTERN', `Test plan name "${plan.planName}" does not match ${family.namePattern}.`);
  }
  const stem = path.basename(plan.file).replace(/\.jmx$/i, '');
  if (plan.planName && plan.planName !== stem) {
    notes.push(`Filename stem "${stem}" differs from the internal test-plan name "${plan.planName}"; log and report names should follow one of them consistently.`);
  }

  /* thread groups */
  if (plan.threadGroups.length === 0) {
    fail('NO_THREAD_GROUP', 'Plan declares no thread group, so it applies no load.');
  }
  for (const tg of plan.threadGroups) {
    const bounded = (tg.scheduler && Number(tg.duration) > 0) || (tg.loops && tg.loops !== '-1' && Number(tg.loops) > 0);
    if (!bounded) {
      fail('UNBOUNDED_THREAD_GROUP', `Thread group "${tg.name}" has neither a positive scheduler duration nor a bounded loop count; the run would never stop on its own.`);
    }
    if (Number(tg.threads) > 0 && Number(tg.rampUp) >= 0) {
      const rate = Number(tg.rampUp) > 0 ? Number(tg.threads) / Number(tg.rampUp) : Infinity;
      tg.arrivalsPerSecond = rate === Infinity ? 'all at once' : Number(rate.toFixed(2));
    }
    if (Number(tg.threads) > 1 && Number(tg.rampUp) === 0) {
      notes.push(`Thread group "${tg.name}" starts ${tg.threads} threads with zero ramp-up. Intentional for a spike cohort; a defect in a load plan.`);
    }
  }

  /* samplers */
  if (plan.samplers.length === 0) {
    fail('NO_SAMPLER', 'Plan contains no HTTP sampler.');
  }

  /* external data */
  if (plan.dataSets.length === 0) {
    fail('NO_DATA_SET', 'Plan reads no CSV data set, so every thread sends identical values.');
  }
  for (const ds of plan.dataSets) {
    if (!ds.filename) {
      fail('DATA_SET_NO_FILE', `Data set "${ds.name}" has no filename.`);
      continue;
    }
    const resolved = path.isAbsolute(ds.filename)
      ? ds.filename
      : path.resolve(path.dirname(plan.file), ds.filename);
    if (!fs.existsSync(resolved)) {
      fail('DATA_FILE_MISSING', `Data set "${ds.name}" points at ${ds.filename}, which does not exist (resolved to ${resolved}).`);
    } else {
      const rows = fs.readFileSync(resolved, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '').length;
      ds.rowCount = ds.variableNames ? rows : Math.max(0, rows - 1);
      if (ds.rowCount < 2) {
        fail('DATA_FILE_THIN', `Data set "${ds.name}" supplies ${ds.rowCount} usable row(s); threads cannot be differentiated.`);
      }
      if (!ds.recycle && !ds.stopThread) {
        notes.push(`Data set "${ds.name}" neither recycles nor stops threads at end of file; threads will silently reuse the last row once it is exhausted.`);
      }
    }
  }

  /* think time */
  if (plan.timers.length === 0) {
    fail('NO_TIMER', 'Plan contains no timer, so threads issue requests back to back with zero think time.');
  } else if (uniq(plan.timers.map((t) => t.type)).length === 1 && plan.samplers.length > 3 && plan.timers.length === 1) {
    notes.push('A single timer covers every sampler. Real users do not pause identically after a list, a search, and a checkout.');
  }

  /* assertions */
  if (plan.assertions.length === 0) {
    fail('NO_ASSERTION', 'Plan has samplers but no assertion; failed responses would be recorded as successes.');
  }
  const contentAsserted = plan.assertions.some((a) => {
    const field = a.field || '';
    return /response_data|Assertion\.response_data/.test(field) || /JSONPathAssertion|JSR223Assertion|SizeAssertion/.test(a.type);
  });
  if (plan.assertions.length > 0 && !contentAsserted) {
    fail('STATUS_ONLY_ASSERTIONS', 'Every assertion inspects the response code only. A 200 carrying an empty or error body would pass.');
  }
  if (plan.assertions.length < Math.ceil(plan.samplers.length / 2)) {
    notes.push(`${plan.assertions.length} assertion(s) cover ${plan.samplers.length} sampler(s); most steps are unverified.`);
  }

  /* correlation */
  const extracted = new Set(plan.extractors.map((e) => e.variable).filter(Boolean));
  const dataVars = new Set(
    plan.dataSets.flatMap((d) => (d.variableNames || '').split(',').map((s) => s.trim()).filter(Boolean))
  );
  const unresolved = plan.variablesUsed.filter((v) => !extracted.has(v) && !dataVars.has(v));
  if (plan.extractors.length === 0) {
    fail('NO_EXTRACTOR', 'Plan extracts nothing from a response, so no step depends on the previous one; this is a set of independent calls, not a workflow.');
  }
  for (const e of plan.extractors) {
    if (e.defaultValue === null || e.defaultValue === '') {
      notes.push(`Extractor "${e.name}" has no default value. A failed extraction yields an empty variable and the next request is sent malformed but may still return 2xx.`);
    } else if (!plan.assertions.some((a) => a.raw.includes(e.defaultValue))) {
      notes.push(`Extractor "${e.name}" defaults to "${e.defaultValue}", but no assertion checks for that value, so a failed extraction is invisible.`);
    }
  }

  /* data files that the plan does not actually consume */
  for (const ds of plan.dataSets) {
    const vars = (ds.variableNames || '').split(',').map((s) => s.trim()).filter(Boolean);
    const used = vars.filter((v) => plan.variablesUsed.includes(v));
    if (vars.length > 0 && used.length === 0) {
      fail('DATA_SET_UNUSED', `Data set "${ds.name}" declares ${vars.join(', ')} but the plan never references any of them; the file is decorative.`);
    }
  }

  /* listeners / result view */
  if (plan.listeners.length === 0) {
    fail('NO_LISTENER', 'Plan declares no result collector, so it produces no view of its results.');
  }

  return {
    file: plan.file,
    planName: plan.planName,
    problems,
    notes,
    summary: {
      threadGroups: plan.threadGroups,
      samplers: plan.samplers.length,
      methodsAndPaths: plan.samplers.map((s) => `${s.method || '?'} ${s.path || '?'}`),
      timers: plan.timers.map((t) => t.type),
      assertions: plan.assertions.map((a) => a.type),
      extractors: plan.extractors.map((e) => `${e.type}:${e.variable || '?'}`),
      dataSets: plan.dataSets.map((d) => ({
        file: d.filename,
        variables: d.variableNames,
        rows: d.rowCount ?? null,
        recycle: d.recycle,
        stopThread: d.stopThread,
        shareMode: d.shareMode,
      })),
      listeners: plan.listeners.map((l) => ({ view: l.guiclass || l.name, writesTo: l.filename || null })),
    },
  };
}

/* --------------------------------------------------------------------- main */

function main(argv) {
  const files = [];
  let namePattern = /^.+_.+_\d{8}$/;
  let jsonOnly = false;
  let allowSharedView = false;

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--name-pattern') {
      namePattern = new RegExp(argv[++i]);
    } else if (a === '--json') {
      jsonOnly = true;
    } else if (a === '--allow-shared-view') {
      allowSharedView = true;
    } else if (a.startsWith('--')) {
      process.stderr.write(`Unknown option ${a}\n`);
      return 2;
    } else {
      files.push(a);
    }
  }

  if (files.length === 0) {
    process.stderr.write('Usage: node validate-test-plan.js <plan.jmx> [more-plans.jmx ...]\n');
    return 2;
  }

  const results = [];
  for (const file of files) {
    let plan;
    try {
      plan = classify(readPlan(file), file, {});
    } catch (err) {
      results.push({ file, planName: null, problems: [{ code: 'UNREADABLE', message: err.message }], notes: [], summary: null });
      continue;
    }
    results.push(checkPlan(plan, { namePattern }));
  }

  /* family-level: each plan should present a different result view */
  if (!allowSharedView && results.length > 1) {
    const seen = new Map();
    for (const r of results) {
      if (!r.summary) continue;
      for (const l of r.summary.listeners) {
        if (seen.has(l.view)) {
          r.problems.push({
            code: 'DUPLICATE_VIEW',
            message: `Result view "${l.view}" is already used by ${seen.get(l.view)}; the family shows the same report three times.`,
          });
        } else {
          seen.set(l.view, path.basename(r.file));
        }
      }
    }
  }

  const failed = results.filter((r) => r.problems.length > 0);
  const report = {
    checked: results.length,
    failed: failed.length,
    namePattern: String(namePattern),
    plans: results,
  };

  if (jsonOnly) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return failed.length > 0 ? 1 : 0;
  }

  for (const r of results) {
    process.stdout.write(`\n${path.basename(r.file)}  [${r.planName || 'unnamed'}]\n`);
    if (r.summary) {
      for (const tg of r.summary.threadGroups) {
        const arrivals = tg.arrivalsPerSecond !== undefined ? `, arrivals ${tg.arrivalsPerSecond}/s` : '';
        process.stdout.write(
          `  thread group "${tg.name}": ${tg.threads} threads, ramp ${tg.rampUp}s, ` +
            `${tg.scheduler ? `duration ${tg.duration}s` : `loops ${tg.loops}`}` +
            `${tg.startDelay && tg.startDelay !== '0' ? `, delayed ${tg.startDelay}s` : ''}${arrivals}\n`
        );
      }
      process.stdout.write(`  samplers: ${r.summary.methodsAndPaths.join(' | ')}\n`);
      process.stdout.write(`  timers: ${r.summary.timers.join(', ') || 'none'}\n`);
      process.stdout.write(`  assertions: ${r.summary.assertions.join(', ') || 'none'}\n`);
      process.stdout.write(`  extractors: ${r.summary.extractors.join(', ') || 'none'}\n`);
      for (const d of r.summary.dataSets) {
        process.stdout.write(
          `  data: ${d.file} [${d.variables}] rows=${d.rows} recycle=${d.recycle} stopThread=${d.stopThread} share=${d.shareMode}\n`
        );
      }
      process.stdout.write(`  views: ${r.summary.listeners.map((l) => l.view).join(', ')}\n`);
    }
    for (const n of r.notes) process.stdout.write(`  NOTE  ${n}\n`);
    for (const p of r.problems) process.stdout.write(`  FAIL  [${p.code}] ${p.message}\n`);
    if (r.problems.length === 0) process.stdout.write('  OK\n');
  }

  process.stdout.write(`\n${results.length - failed.length}/${results.length} plan(s) passed.\n`);
  return failed.length > 0 ? 1 : 0;
}

process.exit(main(process.argv.slice(2)));
