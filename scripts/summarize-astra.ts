import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadStage } from './astra-batch.ts';
import type { Claim } from '../src/data/replay/types.ts';

const normalize = (text: string | null) => (text ?? '').normalize('NFKC').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
// Conservative, reproducible content equality. Do not treat ID/class alone as a claim match.
const fingerprint = (c: Claim) => JSON.stringify([normalize(c.statement), normalize(c.subject), c.class, c.unknown_kind]);
function compare(reference: Claim[], generated: Claim[]) {
  const activeReference = reference.filter(c => !c.superseded_by);
  const activeGenerated = generated.filter(c => !c.superseded_by);
  const used = new Set<string>();
  const rows = activeReference.map(ref => {
    const exact = activeGenerated.find(c => !used.has(c.id) && fingerprint(c) === fingerprint(ref));
    if (exact) used.add(exact.id);
    const sameId = activeGenerated.find(c => c.id === ref.id);
    return { reference_id: ref.id, reference_statement: ref.statement, reference_class: ref.class,
      matches: !!exact, matched_generated_id: exact?.id ?? null,
      same_id_class_matches: sameId?.class === ref.class,
      same_id_generated_statement: sameId?.statement ?? null,
      same_id_generated_class: sameId?.class ?? null };
  });
  return {
    claims_matching_reference: rows.filter(r => r.matches).length,
    reference_claim_count: activeReference.length,
    generated_claim_count: activeGenerated.length,
    same_id_class_match_count: rows.filter(r => r.same_id_class_matches).length,
    reference_retired_count: reference.length - activeReference.length,
    generated_retired_count: generated.length - activeGenerated.length,
    unmatched_generated_ids: activeGenerated.filter(c => !used.has(c.id)).map(c => c.id), rows,
  };
}
function timingSummary(timings: any[]) {
  const sum = (step: string) => timings.filter(t => t.step === step).reduce((n, t) => n + t.seconds, 0);
  const max = (step: string) => Math.max(0, ...timings.filter(t => t.step === step).map(t => t.seconds));
  return { extract_seconds: sum('EXTRACT'), reconcile_seconds: sum('RECONCILE'), policy_seconds: timings.some(t => t.step === 'POLICY') ? sum('POLICY') : null,
    communicate_parallel_seconds: max('COMMUNICATE'), verify_parallel_seconds: max('VERIFY'),
    tokens: timings.reduce((n, t) => n + (t.tokens?.total_tokens ?? 0), 0), timings };
}
const rows = [];
let replayTokens = 0;
for (let stage = 1; stage <= 9; stage++) {
  const saved = JSON.parse(await readFile(`src/data/saved-runs/stage-${stage}.json`, 'utf8'));
  const reference = await loadStage(stage);
  const timing = timingSummary(saved.timings);
  replayTokens += timing.tokens;
  const failures = (saved.verify.audiences ?? []).flatMap((a: any) => a.error ? [a.error] : a.draft.sections.flatMap((section: any) => section.sentences.filter((s: any) => s.verify?.pass === false).map((s: any) => `${a.audience}: ${s.verify.reason} — ${s.text}`)));
  if (saved.verify.reason) failures.unshift(saved.verify.reason);
  rows.push({ stage, status: saved.verify.status, pass: saved.verify.pass,
    ...compare(reference.claims, saved.capped_ledger ?? []),
    reference_ledger_sha256: createHash('sha256').update(JSON.stringify(reference.claims)).digest('hex'),
    ...timing, failures });
}
let live: any = null;
try {
  const saved = JSON.parse(await readFile('src/data/saved-runs/live-asos.json', 'utf8'));
  live = { segment: 'live-asos', snapshot: saved.snapshot, status: saved.status, ...timingSummary(saved.timings), comparison: saved.comparison ?? null };
} catch (error: any) { if (error.code !== 'ENOENT') throw error; }
const result = {
  generated_at: new Date().toISOString(),
  claim_match_method: 'Conservative exact content match after case/whitespace/curly-apostrophe normalization: statement, subject, class and unknown_kind must agree. IDs may differ. One generated claim can match at most one reference claim. Superseded claims are excluded from both active-ledger counts. Paraphrases, splits and merges count as nonmatches; this is not a semantic accuracy score. Same-ID/class counts are separate diagnostics and are not claim matches.',
  total_tokens: replayTokens + (live?.tokens ?? 0), replay_total_tokens: replayTokens, live_total_tokens: live?.tokens ?? 0,
  timing_note: 'Communication and verification timings show slowest audience call; extraction/reconciliation sum attempts. Full per-call timings are included. Policy timing was not recorded for the earlier replay run (null). Step-zero usage is already included in stage 4 and is not counted twice.',
  stages: rows, live_asos: live,
};
await writeFile('src/data/saved-runs/summary.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ total_tokens: result.total_tokens, replay_total_tokens: replayTokens, live_total_tokens: result.live_total_tokens, stages: rows.map(r => ({ stage: r.stage, matches: r.claims_matching_reference, reference: r.reference_claim_count, same_id_class: r.same_id_class_match_count, tokens: r.tokens })) }, null, 2));
