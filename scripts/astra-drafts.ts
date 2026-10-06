import { readFile, writeFile } from 'node:fs/promises';
import { call, loadStage, stage4Input } from './astra-batch.ts';
import type { Draft } from '../src/data/replay/types.ts';

const stages = process.argv.slice(2).map(Number);
if (!stages.length || !stages.every(n => Number.isInteger(n) && n >= 1 && n <= 8)) throw new Error('Supply stage numbers 1–8');
await Promise.all(stages.map(async n => {
  const path = `src/data/saved-runs/stage-${n}.json`;
  let saved: any;
  try {
    saved = JSON.parse(await readFile(path, 'utf8'));
    if (!saved.capped_ledger) throw new Error('No validated capped ledger');
    const stage = n === 4 ? await stage4Input() : await loadStage(n);
    const claims = new Set(saved.capped_ledger.map((c: any) => c.id));
    const responses = new Set(stage.response_items.map(r => r.id));
    const drafts = await Promise.all(['executive', 'engineering', 'customer'].map(async audience => {
      const mode = audience === 'customer' ? 'confirmed_only' : null;
      const output = await call(3, n, { audience, company: 'Northwind', mode: mode ?? 'not applicable', now: stage.at, ledger_json: JSON.stringify(saved.capped_ledger), response_items_json: JSON.stringify(stage.response_items) }, value => {
        if (!Array.isArray(value?.sections) || !value.sections.length) throw new Error('Missing sections');
        for (const section of value.sections) {
          if (typeof section.heading !== 'string' || !Array.isArray(section.sentences) || !section.sentences.length) throw new Error('Invalid section');
          for (const s of section.sentences) {
            if (typeof s.text !== 'string' || !s.text.trim() || !['fact', 'commitment'].includes(s.type) || !Array.isArray(s.claim_ids) || !Array.isArray(s.response_ids) || !s.claim_ids.every((id: string) => claims.has(id)) || !s.response_ids.every((id: string) => responses.has(id))) throw new Error('Invalid sentence/citation');
          }
        }
      }, saved.timings);
      return { audience, policy_mode: mode, as_of: stage.at, source: 'astra_saved', generated_at: new Date().toISOString(), sections: output.sections.map((s: any) => ({ ...s, sentences: s.sentences.map((x: any) => ({ ...x, verify: null })) })) } as Draft;
    }));
    saved.drafts = { executive: drafts[0], engineering: drafts[1], customer: { confirmed_only: drafts[2], early_incident: null } };
    saved.verify = { pass: false, status: 'pending', reason: 'Awaiting code verification and Astra support check' };
  } catch (error: any) {
    if (!saved) { console.error(`Stage ${n}: ${error.message}`); return; }
    saved.verify = { pass: false, status: 'failed', reason: error.message };
  }
  await writeFile(path, JSON.stringify(saved, null, 2) + '\n');
}));
