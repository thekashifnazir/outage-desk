import { readdir, readFile, writeFile } from 'node:fs/promises';

let changedSentences = 0;
export function cleanSentences(value: any): void {
  if (!value || typeof value !== 'object') return;
  if (typeof value.text === 'string' && ['fact', 'commitment'].includes(value.type) && Array.isArray(value.claim_ids) && Array.isArray(value.response_ids)) {
    const cleaned = value.text.replace(/\[C-\d+\]/g, '').replace(/[ \t]+([,.!?;:])/g, '$1').replace(/[ \t]{2,}/g, ' ').trim();
    if (cleaned !== value.text) changedSentences++;
    value.text = cleaned;
  }
  Object.values(value).forEach(cleanSentences);
  // Report counts describe the displayed draft, including archived verification reports.
  if (value.draft?.sections && typeof value.word_count === 'number') {
    value.word_count = value.draft.sections.flatMap((s: any) => s.sentences).reduce((n: number, s: any) => n + (s.text.trim().match(/\S+/g)?.length ?? 0), 0);
    value.over_limit = value.word_count > value.word_limit;
  }
}
if (import.meta.main) {
  for (const name of await readdir('src/data/saved-runs')) {
    if (!name.endsWith('.json')) continue;
    const path = `src/data/saved-runs/${name}`;
    const value = JSON.parse(await readFile(path, 'utf8'));
    cleanSentences(value);
    if (name === 'stage-3.json') {
      const actual = value.capped_ledger.find((c: any) => c.id === 'C-005')?.class;
      value.golden_check = { pass: false, claim_id: 'C-005', expected_class: 'CONFLICTING', actual_class: actual, at: '18:11' };
      value.verify.pass = false;
      value.verify.status = 'failed';
      value.verify.reason = `Golden mismatch: C-005 should be CONFLICTING at 18:11; saved ledger is ${actual}. Use reference data.`;
    }
    await writeFile(path, JSON.stringify(value, null, 2) + '\n');
  }
  console.log(`Removed inline claim IDs from ${changedSentences} sentence copies; stage 3 marked failed.`);
}
