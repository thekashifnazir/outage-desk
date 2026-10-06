import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { call, loadStage } from './astra-batch.ts';
import { verifyDraft } from '../src/lib/verify.ts';
import type { Draft } from '../src/data/replay/types.ts';
const verifier_sha256 = createHash('sha256').update(await readFile('src/lib/verify.ts')).digest('hex');
const stages = process.argv.slice(2).map(Number);
if (!stages.length || !stages.every(n => Number.isInteger(n) && n >= 1 && n <= 8)) throw new Error('Supply stage numbers 1–8');
await Promise.all(stages.map(async n => {
  const path = `src/data/saved-runs/stage-${n}.json`;
  const saved = JSON.parse(await readFile(path, 'utf8'));
  try {
    const stage = { ...await loadStage(n), claims: saved.capped_ledger };
    const inputs: Draft[] = [saved.drafts?.executive, saved.drafts?.engineering, saved.drafts?.customer?.confirmed_only];
    if (inputs.some(d => !d)) throw new Error('Missing one or more audience drafts');
    // Run all deterministic checks before making any support-check requests.
    const codeStart = performance.now();
    const code = inputs.map(d => verifyDraft({ ...d, sections: d.sections.map(s => ({ ...s, sentences: s.sentences.map(x => ({ ...x, verify: null })) })) }, stage));
    saved.timings.push({ step: 'VERIFY_CODE', stage: n, seconds: (performance.now() - codeStart) / 1000, tokens: null });
    const results = await Promise.allSettled(code.map(async result => {
      const draft = result.draft;
      const sentences = draft.sections.flatMap(s => s.sentences);
      const support = await call(4, n, { audience: draft.audience, ledger_json: JSON.stringify(stage.claims), response_items_json: JSON.stringify(stage.response_items), draft_json: JSON.stringify(draft) }, value => {
        if (!Array.isArray(value?.results) || value.results.length !== sentences.length) throw new Error('Expected one result per sentence');
        const seen = new Set<number>();
        for (const r of value.results) {
          if (!Number.isInteger(r.sentence_index) || r.sentence_index < 0 || r.sentence_index >= sentences.length || seen.has(r.sentence_index) || typeof r.supported !== 'boolean' || !(r.problem === null || typeof r.problem === 'string') || (!r.supported && !r.problem)) throw new Error('Invalid support result (indices must be zero-based)');
          seen.add(r.sentence_index);
        }
      }, saved.timings);
      for (const r of support.results) {
        const sentence = sentences[r.sentence_index];
        if (!r.supported) sentence.verify = { pass: false, reason: [sentence.verify?.pass === false ? sentence.verify.reason : null, `Astra: ${r.problem}`].filter(Boolean).join('; ') };
      }
      return { audience: draft.audience, code_pass: result.pass, support, ...verifyDraft(draft, stage) };
    }));
    saved.verify = { pass: results.every(r => r.status === 'fulfilled' && r.value.pass), status: 'complete', verifier_sha256,
      audiences: results.map((r, i) => r.status === 'fulfilled' ? r.value : { audience: inputs[i].audience, pass: false, error: String(r.reason?.message ?? r.reason) }) };
    if (!saved.verify.pass) saved.verify.status = 'failed';
    for (const r of results) if (r.status === 'fulfilled') {
      const d = r.value.draft;
      if (d.audience === 'customer') saved.drafts.customer.confirmed_only = d;
      else saved.drafts[d.audience] = d;
    }
  } catch (error: any) { saved.verify = { pass: false, status: 'failed', reason: error.message }; }
  await writeFile(path, JSON.stringify(saved, null, 2) + '\n');
  console.log(`Stage ${n}: verify ${saved.verify.pass ? 'PASSED' : 'FAILED'}`);
}));
