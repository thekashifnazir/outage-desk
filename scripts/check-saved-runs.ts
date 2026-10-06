import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadStage } from './astra-batch.ts';
import { verifyDraft } from '../src/lib/verify.ts';
import { applyPolicy } from '../src/lib/policy.ts';
for (let n = 1; n <= 9; n++) {
  const saved = JSON.parse(await readFile(`src/data/saved-runs/stage-${n}.json`, 'utf8'));
  const reference = await loadStage(n);
  assert.equal(saved.stage, n);
  assert.ok(saved.extract && saved.reconcile && saved.capped_ledger);
  assert.deepEqual(saved.capped_ledger, applyPolicy(saved.reconcile.claims, reference.evidence, { now: reference.at }));
  assert.equal(new Set(saved.reconcile.claims.map((c: any) => c.id)).size, saved.reconcile.claims.length);
  assert.ok(saved.timings.every((t: any) => Number.isFinite(t.seconds) && t.seconds >= 0));
  if (n === 9) {
    assert.deepEqual(saved.drafts, reference.drafts);
    assert.equal(saved.verify.status, 'not_applicable');
    continue;
  }
  const stage = { ...reference, claims: saved.capped_ledger };
  const drafts = [saved.drafts.executive, saved.drafts.engineering, saved.drafts.customer.confirmed_only];
  for (const d of drafts) {
    assert.equal(d.source, 'astra_saved');
    assert.ok(Number.isFinite(Date.parse(d.generated_at)));
    assert.ok(d.sections.flatMap((s: any) => s.sentences).every((s: any) => typeof s.verify?.pass === 'boolean'));
  }
  assert.equal(saved.verify.pass, drafts.every(d => verifyDraft(d, stage).pass));
  // An injected missing citation must never pass, even when the model says it does.
  const tampered = structuredClone(drafts[0]);
  const sentence = tampered.sections[0].sentences[0];
  sentence.type = 'fact'; sentence.claim_ids = ['C-NOT-REAL']; sentence.response_ids = []; sentence.verify = { pass: true, reason: null };
  assert.equal(verifyDraft(tampered, stage).pass, false);
}
console.log('PASS: all 9 saved runs, current policy results, reference stage 9, combined verification, and missing-citation rejection');
