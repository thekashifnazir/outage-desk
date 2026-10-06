import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { applyPolicy } from '../src/lib/policy.ts';
import type { Claim, Stage } from '../src/data/replay/types.ts';

const prep = process.env.PREP || '/Users/kash/Code/sandbox/outage-desk-prep';
const key = process.env.OUTAGEDESK_OPENAI_API_KEY;
if (!key) throw new Error('OUTAGEDESK_OPENAI_API_KEY must be loaded with --env-file=.env.local');
const spec = await readFile(`${prep}/docs/12-astra-steps.md`, 'utf8');
const types = await readFile('src/data/replay/types.ts', 'utf8');
const templates = [1, 2, 3, 4].map(n => spec.split(`## Step ${n}:`)[1].split('```')[1].trim());
const classes = ['CONFIRMED', 'REPORTED', 'CONFLICTING', 'UNCONFIRMED', 'UNKNOWN'];
const check = (ok: unknown, message: string) => { if (!ok) throw new Error(message); };
const str = (v: unknown) => typeof v === 'string';
const nullable = (v: unknown) => v === null || str(v);
export function candidate(c: any, evidence: Set<string>) {
  check(c && str(c.statement) && c.statement.length && nullable(c.subject), 'Invalid statement/subject');
  check([null, 'cause', 'recovery', 'scope', 'data'].includes(c.unknown_kind), 'Invalid unknown_kind');
  check(classes.includes(c.proposed_class), 'Invalid proposed_class');
  check(Array.isArray(c.source_ids) && c.source_ids.every((id: unknown) => str(id) && evidence.has(id as string)), 'Invalid source_ids');
  check(nullable(c.provider_wording) && nullable(c.settled_by), 'Invalid wording/settled_by');
  check(c.estimate === null || (c.estimate && ['speaker', 'said', 'at', 'source_id'].every(k => str(c.estimate[k])) && evidence.has(c.estimate.source_id)), 'Invalid estimate');
}
export function reconcile(value: any, evidence: Set<string>) {
  check(value && Array.isArray(value.claims) && Array.isArray(value.changes), 'Expected claims and changes');
  const seen = new Set<string>();
  for (const c of value.claims) {
    candidate(c, evidence);
    check(str(c.id) && /^C-\d+$/.test(c.id) && !seen.has(c.id), 'Invalid or duplicate claim id'); seen.add(c.id);
    check(classes.includes(c.class) && nullable(c.first_seen) && nullable(c.superseded_by), 'Invalid ledger fields');
    check(c.contradiction_sides === null || (Array.isArray(c.contradiction_sides) && c.contradiction_sides.every((s: any) => str(s.label) && Array.isArray(s.source_ids) && s.source_ids.every((id: string) => evidence.has(id)))), 'Invalid contradiction_sides');
    check(Array.isArray(c.history) && c.history.every((h: any) => Number.isInteger(h.stage) && classes.includes(h.class) && str(h.statement) && Array.isArray(h.because) && h.because.every((id: string) => evidence.has(id))), 'Invalid history');
  }
  for (const c of value.changes) {
    check(str(c.claim_id) && ['UPGRADED', 'DOWNGRADED', 'NEW', 'MERGED', 'CONFLICT'].includes(c.change), 'Invalid Change enum');
    check((c.from === null || classes.includes(c.from)) && (c.to === null || classes.includes(c.to)), 'Invalid Change from/to');
    check(Array.isArray(c.because) && c.because.every((id: string) => evidence.has(id)), 'Invalid Change citations');
  }
}
function fill(template: string, params: Record<string, string>) {
  return template.replace(/\{([a-z_]+)\}/g, (match, name) => params[name] ?? match);
}
export async function loadStage(n: number): Promise<Stage> {
  const mod = await import(pathToFileURL(resolve(`src/data/replay/stage-${n}.ts`)).href);
  return mod[`stage${n}`] ?? mod.default;
}
export async function stage4Input(): Promise<Stage> {
  try { return await loadStage(4); } catch (e: any) {
    if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
    const s = structuredClone(await loadStage(5));
    s.stage = 4; s.at = '18:51';
    s.evidence = s.evidence.filter(e => e.at <= s.at);
    s.response_items = s.response_items.filter(r => r.at <= s.at).map(r => ({ ...r,
      ...(r.decided_at && r.decided_at > s.at ? { status: 'open' as const, decision: null, decided_at: null } : {}),
      ...(r.id === 'R-15' ? { replaced_by: null } : {}),
    }));
    // Input-only fallback: never use stage 5 claims or drafts as stage 4 reference data.
    s.claims = []; s.changes = []; s.drafts = { executive: null, engineering: null, customer: { confirmed_only: null, early_incident: null } };
    return s;
  }
}
export async function call(step: number, stage: number | string, params: Record<string, string>, validate: (v: any) => void, timings: any[], revisionContext = '') {
  let issue = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const start = performance.now();
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-6-astra', store: false, reasoning: { effort: 'low' }, text: { format: { type: 'json_object' } },
        input: fill(templates[step - 1], params) + '\n\nRuntime type contract (use the applicable fields; ledger claims must be complete Claim objects):\n' + types + '\nThe runtime Change type is authoritative: do not emit UPDATED or claim IDs as from/to. Represent merges with to:null. Use contradiction_sides rather than contradiction_group.\n' + revisionContext + '\n' + (issue ? `Previous output was invalid: ${issue}. Return corrected JSON.` : '') }),
      signal: AbortSignal.timeout(600_000),
    });
    const body = await response.json();
    const timing = { step: ['EXTRACT', 'RECONCILE', 'COMMUNICATE', 'VERIFY'][step - 1], stage, audience: params.audience ?? null, attempt, seconds: (performance.now() - start) / 1000, tokens: body.usage ?? null };
    timings.push(timing); console.log(JSON.stringify(timing));
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(body.error ?? body).replaceAll(key!, '[REDACTED]')}`);
    try {
      check(body.status === 'completed', `Response status ${body.status}`);
      const raw = body.output.flatMap((o: any) => o.content ?? []).filter((c: any) => c.type === 'output_text').map((c: any) => c.text).join('');
      const result = JSON.parse(raw); validate(result); return result;
    } catch (error: any) { issue = error.message; }
  }
  throw new Error(`Invalid response after two attempts: ${issue}`);
}
async function run(n: number) {
  const file = `src/data/saved-runs/stage-${n}.json`;
  let saved: any = { stage: n, model: 'gpt-6-astra', source: 'astra_saved', generated_at: new Date().toISOString(), extract: null, reconcile: null, capped_ledger: null, drafts: null, verify: { pass: false, status: 'pending' }, timings: [] };
  try {
    try { saved = JSON.parse(await readFile(file, 'utf8')); } catch {}
    const stage = n === 4 ? await stage4Input() : await loadStage(n);
    const previous = n === 1 ? null : await loadStage(n - 1);
    const oldIds = new Set(previous?.evidence.map(e => e.id) ?? []);
    const fresh = stage.evidence.filter(e => !oldIds.has(e.id));
    const ids = new Set(stage.evidence.map(e => e.id));
    const params = { now: stage.at, company_context: 'Northwind. Customer app: Cloud Run + Firestore + Firebase Auth, us-central1 only, no second region. Staff tools behind Cloudflare Access.', evidence_lines: fresh.map(e => `${e.id} | ${e.at} | ${e.kind} | ${e.origin} | ${e.excerpt}`).join('\n') };
    if (!saved.extract) {
      if (n === 4) {
        const zero = JSON.parse(await readFile('src/data/saved-runs/step-0-stage-4.json', 'utf8'));
        check(zero.schema_valid, 'Step zero did not pass'); saved.extract = zero.extract; saved.timings.push(...zero.timings);
      } else saved.extract = await call(1, n, params, v => { check(Array.isArray(v?.claims), 'Expected claims'); v.claims.forEach((c: any) => candidate(c, new Set(fresh.map(e => e.id)))); }, saved.timings);
      await writeFile(file, JSON.stringify(saved, null, 2) + '\n');
    }
    if (!saved.reconcile) {
      const retired = (previous?.changes ?? []).map(c => c.claim_id);
      const largest = Math.max(0, ...[...(previous?.claims.map(c => c.id) ?? []), ...retired].map(id => Number(id.split('-')[1])));
      saved.reconcile = await call(2, n, { now: stage.at, ledger_json: JSON.stringify(previous?.claims ?? []), next_id: `C-${String(largest + 1).padStart(3, '0')}`, candidates_json: JSON.stringify(saved.extract.claims) }, v => reconcile(v, ids), saved.timings);
    }
    saved.capped_ledger = applyPolicy(saved.reconcile.claims as Claim[], stage.evidence, { now: stage.at });
    saved.verify = { pass: false, status: n === 9 ? 'not_applicable' : 'pending', reason: n === 9 ? 'Post-incident pack: reference drafts retained' : 'Communication and verification pending' };
    if (n === 9) saved.drafts = stage.drafts;
    saved.error = null;
  } catch (error: any) {
    saved.error = String(error.message).replaceAll(key!, '[REDACTED]');
    saved.verify = { pass: false, status: 'failed', reason: saved.error };
    console.error(`Stage ${n}: ${saved.error}`);
  }
  await writeFile(file, JSON.stringify(saved, null, 2) + '\n');
}
if (import.meta.main) {
await mkdir('src/data/saved-runs', { recursive: true });
const stages = process.argv.slice(2).map(Number);
check(stages.length && stages.every(n => Number.isInteger(n) && n >= 1 && n <= 9), 'Usage: node --env-file=.env.local scripts/astra-batch.ts 4');
await Promise.all(stages.map(run));

}
