import { readFile, writeFile } from 'node:fs/promises';
const rows = [];
let totalTokens = 0;
for (let stage = 1; stage <= 9; stage++) {
  const saved = JSON.parse(await readFile(`src/data/saved-runs/stage-${stage}.json`, 'utf8'));
  const timings = saved.timings as any[];
  const sum = (step: string) => timings.filter(t => t.step === step).reduce((n, t) => n + t.seconds, 0);
  const max = (step: string) => Math.max(0, ...timings.filter(t => t.step === step).map(t => t.seconds));
  const tokens = timings.reduce((n, t) => n + (t.tokens?.total_tokens ?? 0), 0);
  totalTokens += tokens;
  const failures = (saved.verify.audiences ?? []).flatMap((a: any) => a.error ? [a.error] : a.draft.sections.flatMap((section: any) => section.sentences.filter((s: any) => s.verify?.pass === false).map((s: any) => `${a.audience}: ${s.verify.reason} — ${s.text}`)));
  rows.push({ stage, status: saved.verify.status, pass: saved.verify.pass, extract_seconds: sum('EXTRACT'), reconcile_seconds: sum('RECONCILE'), communicate_parallel_seconds: max('COMMUNICATE'), verify_parallel_seconds: max('VERIFY'), tokens, failures });
}
const result = { generated_at: new Date().toISOString(), total_tokens: totalTokens, timing_note: 'Communication and verification timings show slowest audience call; extraction/reconciliation sum attempts. These are API call times, not end-to-end wall time.', stages: rows };
await writeFile('src/data/saved-runs/summary.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
