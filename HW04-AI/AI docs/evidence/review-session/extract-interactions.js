// Extract the human prompts and the assistant's user-facing replies from a
// Claude Code session transcript, in the shape the HW04 audit evidence uses.
const fs = require('node:fs');

const [, , inPath, outJson, outMd] = process.argv;
const lines = fs.readFileSync(inPath, 'utf8').split('\n').filter(Boolean);

function textBlocks(content) {
  if (typeof content === 'string') return [content];
  if (!Array.isArray(content)) return [];
  return content.filter((b) => b.type === 'text' && b.text).map((b) => b.text);
}

// Real user input only: drop tool results, hook output, and the reminder blocks
// the harness injects into the user turn.
function isHumanTurn(entry) {
  if (entry.type !== 'user' || !entry.message) return false;
  const c = entry.message.content;
  if (Array.isArray(c) && c.some((b) => b.type === 'tool_result')) return false;
  return true;
}

function stripReminders(text) {
  return text
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<command-[a-z-]+>[\s\S]*?<\/command-[a-z-]+>/g, '')
    .trim();
}

// A queued message that also shows up later as its own user turn was simply
// typed ahead; only a queued message with no matching turn was consumed
// mid-reply and has to be recovered from the queue record.
const realTurnPrompts = new Set();
for (const line of lines) {
  let entry;
  try { entry = JSON.parse(line); } catch { continue; }
  if (!isHumanTurn(entry)) continue;
  const p = stripReminders(textBlocks(entry.message.content).join('\n'));
  if (p) realTurnPrompts.add(p);
}

const interactions = [];
const seenQueued = new Set();
let pending = null;

function startInteraction(prompt, time) {
  if (pending) interactions.push(pending);
  pending = { tool: 'Claude (Claude Code, Opus 5)', time: time || null, prompt, output: [] };
}

for (const line of lines) {
  let entry;
  try { entry = JSON.parse(line); } catch { continue; }

  // Messages typed while a turn was still running are recorded as queue
  // operations rather than user turns. They are still real user prompts.
  if (entry.type === 'queue-operation' && entry.operation === 'enqueue') {
    const prompt = (entry.content || '').trim();
    if (prompt.includes('<task-notification') || prompt.includes('[SYSTEM NOTIFICATION - NOT USER INPUT]')) continue;
    if (realTurnPrompts.has(prompt)) continue;
    if (prompt && !seenQueued.has(prompt)) {
      seenQueued.add(prompt);
      // A mid-turn message is answered by the reply already in flight, so it
      // belongs to the pending interaction rather than opening a new one.
      if (pending) pending.prompt += `\n\n[sent mid-turn ${entry.timestamp}] ${prompt}`;
      else startInteraction(prompt, entry.timestamp);
    }
    continue;
  }

  if (isHumanTurn(entry)) {
    const prompt = stripReminders(textBlocks(entry.message.content).join('\n'));
    // Background-task notifications are harness events, not user prompts.
    if (!prompt || prompt.startsWith('<task-notification') || prompt.includes('[SYSTEM NOTIFICATION - NOT USER INPUT]')) continue;
    if (seenQueued.has(prompt)) continue;
    startInteraction(prompt, entry.timestamp);
    continue;
  }

  if (entry.type === 'assistant' && entry.message && pending) {
    for (const t of textBlocks(entry.message.content)) {
      const clean = t.trim();
      if (clean) pending.output.push(clean);
    }
  }
}
if (pending) interactions.push(pending);

const rows = interactions.map((i) => ({ ...i, output: i.output.join('\n\n') }));
fs.writeFileSync(outJson, JSON.stringify(rows, null, 2) + '\n');

const md = [
  '# Claude Chat Log – HW04 test-validity review session',
  '',
  `Session: \`31ca770b-450b-420e-b29e-2ff32504c1ea\`  `,
  `Tool: Claude (Claude Code, Opus 5)  `,
  `Date: 2026-08-11 local (Asia/Ho_Chi_Minh, UTC+7); the timestamps below are UTC, so they read 2026-08-10  `,
  `Interactions: ${rows.length}`,
  '',
  'Raw transcript: `session-2026-08-11-31ca770b-450b-420e-b29e-2ff32504c1ea.jsonl`',
  '',
];
rows.forEach((r, n) => {
  md.push(`## Interaction ${n + 1}`, '');
  md.push(`**Time:** ${r.time || 'n/a'}`, '');
  md.push('**Prompt:**', '', '```text', r.prompt, '```', '');
  md.push('**Output:**', '', r.output || '_(tool-only turn, no user-facing text)_', '');
});
fs.writeFileSync(outMd, md.join('\n'));

console.log(`interactions: ${rows.length}`);
rows.forEach((r, n) => console.log(`${n + 1}. [${r.time}] ${r.prompt.slice(0, 70).replace(/\n/g, ' ')}`));
