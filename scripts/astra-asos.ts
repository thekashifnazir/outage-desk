import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { candidate, reconcile, call } from './astra-batch.ts';
import { applyPolicy } from '../src/lib/policy.ts';
import type { Evidence } from '../src/data/replay/types.ts';

const prep = process.env.PREP || '/Users/kash/Code/sandbox/outage-desk-prep';
const source = `${prep}/replay/asos-2026-10-06.md`;
const doc = await readFile(source, 'utf8');
const rows = doc.split('\n').filter(line => /^\| A-\d\d \|/.test(line)).map(line => line.split('|').slice(1, -1).map(x => x.trim()));
if (rows.length !== 14 || new Set(rows.map(r => r[0])).size !== 14) throw new Error('Expected A-01 through A-14 exactly once');
const evidence: Evidence[] = rows.map(([id, at, kind, origin, excerpt]) => ({
  id, at, kind: kind as Evidence['kind'], origin, excerpt,
  provider: kind === 'provider_official' ? 'ASOS' : null,
  channel: kind === 'provider_official' ? 'report' : null,
  url: id === 'A-11' ? 'https://www.tradingview.com/news/reuters.com,2026-10-06:newsml_RSF8604Xa:0-reg-asos-plc-update-regarding-cyber-incident/' : null,
  arrived_via: 'manual', fictional: false,
}));
const ids = new Set(evidence.map(e => e.id));
const saved: any = {
  segment: 'live-asos', snapshot: 2, model: 'gpt-6-astra', source: 'astra_saved', generated_at: new Date().toISOString(),
  captured_at: '2026-10-06T17:00:00+01:00', captured_at_precision: 'approximate, per prep document',
  source_document: 'replay/asos-2026-10-06.md', source_sha256: createHash('sha256').update(doc).digest('hex'),
  evidence, initial_ledger: [], extract: null, reconcile: null, capped_ledger: null, timings: [], status: 'pending',
  policy_note: 'All 14 items belong to captured snapshot 2. Approximate source times are preserved; no replay-date filtering is applied. This avoids interpreting morning/day/August as June 2025.',
};
const output = 'src/data/saved-runs/live-asos.json';
try {
  saved.extract = await call(1, 'live-asos', {
    now: '2026-10-06 17:00 BST (approximate snapshot capture)',
    company_context: 'ASOS. Real-company incident, ledger only. Every claim names who is saying it. Items A-01–A-10 came from search-result summaries; A-11–A-14 were read in the original articles. A-10 is a separate July 2026 incident, not the current incident. Times are approximate BST on 6 October 2026 except A-10 (August 2026). No facts outside the evidence are available.',
    evidence_lines: evidence.map(e => `${e.id} | ${e.at} | ${e.kind} | ${e.origin} | ${e.excerpt}`).join('\n'),
  }, value => {
    if (!Array.isArray(value?.claims) || !value.claims.length) throw new Error('Expected nonempty claims');
    value.claims.forEach((c: any) => candidate(c, ids));
  }, saved.timings);
  await writeFile(output, JSON.stringify(saved, null, 2) + '\n');
  saved.reconcile = await call(2, 'live-asos', { now: '2026-10-06 17:00 BST', ledger_json: '[]', next_id: 'C-001', candidates_json: JSON.stringify(saved.extract.claims) }, value => reconcile(value, ids), saved.timings);
  const start = performance.now();
  saved.capped_ledger = applyPolicy(saved.reconcile.claims, evidence);
  saved.timings.push({ step: 'POLICY', stage: 'live-asos', seconds: (performance.now() - start) / 1000, tokens: null });
  saved.status = 'complete';
} catch (error: any) {
  saved.status = 'failed'; saved.error = String(error.message).replaceAll(process.env.OUTAGEDESK_OPENAI_API_KEY!, '[REDACTED]');
  process.exitCode = 1;
}
saved.total_tokens = saved.timings.reduce((n: number, t: any) => n + (t.tokens?.total_tokens ?? 0), 0);
await writeFile(output, JSON.stringify(saved, null, 2) + '\n');
console.log(JSON.stringify({ segment: saved.segment, status: saved.status, claims: saved.capped_ledger?.length ?? 0, total_tokens: saved.total_tokens, error: saved.error }));
