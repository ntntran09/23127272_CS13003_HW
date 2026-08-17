#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLAN_DIR = path.join(ROOT, 'plans');
const DATE = '20260817';
const STUDENT = '23127272';

const scenarios = [
  {
    type: 'Load',
    listener: { name: 'Aggregate Report', gui: 'StatVisualizer' },
    groups: [{ name: 'Expected admin load', threads: 20, ramp: 30, delay: 0, duration: 180 }],
  },
  {
    type: 'Stress',
    listener: { name: 'Summary Report', gui: 'SummaryReport' },
    groups: [
      { name: 'Stage 1 - 25 VU', threads: 25, ramp: 20, delay: 0, duration: 300 },
      { name: 'Stage 2 - add 25 VU', threads: 25, ramp: 20, delay: 90, duration: 210 },
      { name: 'Stage 3 - add 50 VU', threads: 50, ramp: 20, delay: 180, duration: 120 },
    ],
  },
  {
    type: 'Spike',
    listener: { name: 'View Results Tree', gui: 'ViewResultsFullVisualizer' },
    groups: [
      { name: 'Baseline and recovery - 15 VU', threads: 15, ramp: 20, delay: 0, duration: 240 },
      { name: 'Sudden spike - add 120 VU', threads: 120, ramp: 1, delay: 90, duration: 60 },
    ],
  },
];

const endurance = {
  type: 'Endurance',
  listener: { name: 'Response Time Graph', gui: 'RespTimeGraphVisualizer' },
  groups: [{ name: 'Sustained candidate threshold - 25 VU', threads: 25, ramp: 30, delay: 0, duration: 900 }],
};

const x = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function arg(name, value) {
  return `<elementProp name="${x(name)}" elementType="Argument"><stringProp name="Argument.name">${x(name)}</stringProp><stringProp name="Argument.value">${x(value)}</stringProp><stringProp name="Argument.metadata">=</stringProp></elementProp>`;
}

function httpDefaults() {
  return `<ConfigTestElement guiclass="HttpDefaultsGui" testclass="ConfigTestElement" testname="HTTP Request Defaults" enabled="true">
    <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true"><collectionProp name="Arguments.arguments"/></elementProp>
    <stringProp name="HTTPSampler.domain">\${__P(host,127.0.0.1)}</stringProp>
    <stringProp name="HTTPSampler.port">\${__P(port,3000)}</stringProp>
    <stringProp name="HTTPSampler.protocol">http</stringProp>
    <stringProp name="HTTPSampler.contentEncoding">UTF-8</stringProp>
    <stringProp name="HTTPSampler.connect_timeout">5000</stringProp>
    <stringProp name="HTTPSampler.response_timeout">15000</stringProp>
  </ConfigTestElement><hashTree/>`;
}

function headers() {
  return `<HeaderManager guiclass="HeaderPanel" testclass="HeaderManager" testname="JSON and JWT headers" enabled="true">
    <collectionProp name="HeaderManager.headers">
      <elementProp name="Content-Type" elementType="Header"><stringProp name="Header.name">Content-Type</stringProp><stringProp name="Header.value">application/json</stringProp></elementProp>
      <elementProp name="Authorization" elementType="Header"><stringProp name="Header.name">Authorization</stringProp><stringProp name="Header.value">Bearer \${auth_token}</stringProp></elementProp>
    </collectionProp>
  </HeaderManager><hashTree/>`;
}

function csvData() {
  return `<CSVDataSet guiclass="TestBeanGUI" testclass="CSVDataSet" testname="Unique admin order rows" enabled="true">
    <stringProp name="delimiter">,</stringProp>
    <stringProp name="fileEncoding">UTF-8</stringProp>
    <stringProp name="filename">../data/admin-orders.csv</stringProp>
    <boolProp name="ignoreFirstLine">true</boolProp>
    <boolProp name="quotedData">true</boolProp>
    <boolProp name="recycle">false</boolProp>
    <stringProp name="shareMode">shareMode.all</stringProp>
    <boolProp name="stopThread">true</boolProp>
    <stringProp name="variableNames">admin_email,admin_password,order_id,current_status,next_status</stringProp>
  </CSVDataSet><hashTree/>`;
}

function timer(base, range) {
  if (!base && !range) return '';
  return `<UniformRandomTimer guiclass="UniformRandomTimerGui" testclass="UniformRandomTimer" testname="Human think time ${base}-${base + range} ms" enabled="true"><stringProp name="ConstantTimer.delay">${base}</stringProp><stringProp name="RandomTimer.range">${range}</stringProp></UniformRandomTimer><hashTree/>`;
}

function assertion(name, script) {
  return `<JSR223Assertion guiclass="TestBeanGUI" testclass="JSR223Assertion" testname="${x(name)}" enabled="true">
    <stringProp name="cacheKey">true</stringProp><stringProp name="filename"></stringProp><stringProp name="parameters"></stringProp>
    <stringProp name="script">${x(script)}</stringProp><stringProp name="scriptLanguage">groovy</stringProp>
  </JSR223Assertion><hashTree/>`;
}

function extractor() {
  return `<JSONPostProcessor guiclass="JSONPostProcessorGui" testclass="JSONPostProcessor" testname="Extract per-iteration JWT" enabled="true">
    <stringProp name="JSONPostProcessor.referenceNames">auth_token</stringProp>
    <stringProp name="JSONPostProcessor.jsonPathExprs">$.token</stringProp>
    <stringProp name="JSONPostProcessor.match_numbers">1</stringProp>
    <stringProp name="JSONPostProcessor.defaultValues">TOKEN_NOT_FOUND</stringProp>
  </JSONPostProcessor><hashTree/>`;
}

function sampler({ name, method, route, body, think = [0, 0], children = '' }) {
  const bodyArgs = body === undefined ? '' : `<elementProp name="" elementType="HTTPArgument"><boolProp name="HTTPArgument.always_encode">false</boolProp><stringProp name="Argument.value">${x(body)}</stringProp><stringProp name="Argument.metadata">=</stringProp></elementProp>`;
  return `<HTTPSamplerProxy guiclass="HttpTestSampleGui" testclass="HTTPSamplerProxy" testname="${x(name)}" enabled="true">
    <elementProp name="HTTPsampler.Arguments" elementType="Arguments" guiclass="HTTPArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true"><collectionProp name="Arguments.arguments">${bodyArgs}</collectionProp></elementProp>
    <stringProp name="HTTPSampler.path">${x(route)}</stringProp><stringProp name="HTTPSampler.method">${method}</stringProp>
    <boolProp name="HTTPSampler.follow_redirects">true</boolProp><boolProp name="HTTPSampler.auto_redirects">false</boolProp>
    <boolProp name="HTTPSampler.use_keepalive">true</boolProp><boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>
    <boolProp name="HTTPSampler.postBodyRaw">${body === undefined ? 'false' : 'true'}</boolProp>
  </HTTPSamplerProxy><hashTree>${timer(...think)}${children}</hashTree>`;
}

const okJson = (extra = '') => `if (!prev.isSuccessful() || prev.getResponseCode() != '200') { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('Expected HTTP 200, got ' + prev.getResponseCode()); return }; def data = new groovy.json.JsonSlurper().parseText(prev.getResponseDataAsString()); ${extra}`;

function workflow() {
  const login = sampler({
    name: '01 Auth - POST /api/login', method: 'POST', route: '/api/login',
    body: '{"email":"${admin_email}","password":"${admin_password}"}',
    children: extractor() + assertion('Login returns token and admin role', okJson("if (!data.token || data.user?.role != 'admin' || vars.get('auth_token') == 'TOKEN_NOT_FOUND') { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('Missing token or role is not admin') }")),
  });
  const profile = sampler({
    name: '02 Auth - GET /api/users/me', method: 'GET', route: '/api/users/me', think: [200, 300],
    children: assertion('Profile confirms admin identity', okJson("if (data.role != 'admin' || data.email != vars.get('admin_email')) { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('Authenticated identity/role mismatch') }")),
  });
  const listBefore = sampler({
    name: '03 Read - GET /api/admin/orders (before)', method: 'GET', route: '/api/admin/orders', think: [500, 700],
    children: assertion('Order pool contains eligible row', okJson("if (!(data instanceof List) || !data.any { String.valueOf(it.id) == vars.get('order_id') && it.status == vars.get('current_status') }) { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('CSV order missing or current status mismatch') }")),
  });
  const products = sampler({
    name: '04 Read - GET /api/products', method: 'GET', route: '/api/products', think: [250, 350],
    children: assertion('Products returns non-empty array', okJson("if (!(data instanceof List) || data.isEmpty()) { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('Product list empty/not array') }")),
  });
  const categories = sampler({
    name: '05 Read - GET /api/categories', method: 'GET', route: '/api/categories', think: [250, 350],
    children: assertion('Categories returns non-empty array', okJson("if (!(data instanceof List) || data.isEmpty()) { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('Category list empty/not array') }")),
  });
  const update = sampler({
    name: '06 Transaction - PUT /api/admin/orders/{id}/status', method: 'PUT', route: '/api/admin/orders/${order_id}/status',
    body: '{"status":"${next_status}"}', think: [600, 600],
    children: assertion('Status update reports business success', okJson("if (data.message != 'Order status updated') { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('Update response did not confirm success') }")),
  });
  const listAfter = sampler({
    name: '07 Read - GET /api/admin/orders (verify)', method: 'GET', route: '/api/admin/orders', think: [300, 400],
    children: assertion('Re-read proves requested transition', okJson("if (!(data instanceof List) || !data.any { String.valueOf(it.id) == vars.get('order_id') && it.status == vars.get('next_status') }) { AssertionResult.setFailure(true); AssertionResult.setFailureMessage('Updated order/status not observed') }")),
  });
  return login + profile + listBefore + products + categories + update + listAfter;
}

function threadGroup(g) {
  return `<ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="${x(g.name)}" enabled="true">
    <stringProp name="ThreadGroup.on_sample_error">continue</stringProp>
    <elementProp name="ThreadGroup.main_controller" elementType="LoopController" guiclass="LoopControlPanel" testclass="LoopController" testname="Loop Controller" enabled="true"><boolProp name="LoopController.continue_forever">false</boolProp><stringProp name="LoopController.loops">-1</stringProp></elementProp>
    <stringProp name="ThreadGroup.num_threads">${g.threads}</stringProp><stringProp name="ThreadGroup.ramp_time">${g.ramp}</stringProp>
    <boolProp name="ThreadGroup.scheduler">true</boolProp><stringProp name="ThreadGroup.duration">${g.duration}</stringProp><stringProp name="ThreadGroup.delay">${g.delay}</stringProp>
    <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
  </ThreadGroup><hashTree>${csvData()}${workflow()}</hashTree>`;
}

function listener(l) {
  return `<ResultCollector guiclass="${l.gui}" testclass="ResultCollector" testname="${x(l.name)}" enabled="true"><boolProp name="ResultCollector.error_logging">false</boolProp><objProp><name>saveConfig</name><value class="SampleSaveConfiguration"><time>true</time><latency>true</latency><timestamp>true</timestamp><success>true</success><label>true</label><code>true</code><message>true</message><threadName>true</threadName><dataType>true</dataType><encoding>false</encoding><assertions>true</assertions><subresults>true</subresults><responseData>false</responseData><samplerData>false</samplerData><xml>false</xml><fieldNames>true</fieldNames><responseHeaders>false</responseHeaders><requestHeaders>false</requestHeaders><responseDataOnError>false</responseDataOnError><saveAssertionResultsFailureMessage>true</saveAssertionResultsFailureMessage><assertionsResultsToSave>0</assertionsResultsToSave><bytes>true</bytes><sentBytes>true</sentBytes><url>true</url><threadCounts>true</threadCounts><idleTime>true</idleTime><connectTime>true</connectTime></value></objProp><stringProp name="filename"></stringProp></ResultCollector><hashTree/>`;
}

function plan(s) {
  const stem = `${STUDENT}_${s.type}_${DATE}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3"><hashTree>
  <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="${stem}" enabled="true">
    <stringProp name="TestPlan.comments">Scenario D - Admin order fulfillment. Restart and seed the SUT before every measured run.</stringProp>
    <boolProp name="TestPlan.functional_mode">false</boolProp><boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
    <elementProp name="TestPlan.user_defined_variables" elementType="Arguments" guiclass="ArgumentsPanel" testclass="Arguments" testname="User Defined Variables" enabled="true"><collectionProp name="Arguments.arguments">${arg('scenario', s.type)}${arg('student_id', STUDENT)}</collectionProp></elementProp>
  </TestPlan><hashTree>${httpDefaults()}${headers()}${s.groups.map(threadGroup).join('')}${listener(s.listener)}</hashTree>
</hashTree></jmeterTestPlan>\n`;
}

fs.mkdirSync(PLAN_DIR, { recursive: true });
for (const scenario of scenarios) {
  const file = path.join(PLAN_DIR, `${STUDENT}_${scenario.type}_${DATE}.jmx`);
  fs.writeFileSync(file, plan(scenario));
  process.stdout.write(`${file}\n`);
}

{
  const file = path.join(PLAN_DIR, `${STUDENT}_${endurance.type}_${DATE}.jmx`);
  fs.writeFileSync(file, plan(endurance));
  process.stdout.write(`${file}\n`);
}

if (process.argv.includes('--smoke')) {
  const smoke = {
    ...scenarios[0],
    type: 'Smoke',
    listener: { name: 'Smoke Summary', gui: 'SummaryReport' },
    groups: [{ name: 'Smoke - 1 VU', threads: 1, ramp: 1, delay: 0, duration: 8 }],
  };
  const file = path.join(PLAN_DIR, `${STUDENT}_Smoke_${DATE}.jmx`);
  fs.writeFileSync(file, plan(smoke));
  process.stdout.write(`${file}\n`);
}
