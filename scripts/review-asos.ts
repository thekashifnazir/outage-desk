import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { applyPolicy } from '../src/lib/policy.ts';
import { candidate, reconcile } from './astra-batch.ts';

// Reviewed alignment for this specific saved run. Never apply it to a later run silently.
const reviewedHash = '798ce6e16a78cc9e51be5ce469881c7d21b881a783033387b96ef33c6acd05f3';
const path = 'src/data/saved-runs/live-asos.json';
const saved = JSON.parse(await readFile(path, 'utf8'));
const hash = createHash('sha256').update(JSON.stringify(saved.capped_ledger)).digest('hex');
assert.equal(hash, reviewedHash, 'Ledger changed: repeat the semantic/trap review before recording results');
assert.deepEqual(saved.initial_ledger, []);
assert.ok(!('drafts' in saved));
const ids = new Set<string>(saved.evidence.map((e: any) => e.id));
saved.extract.claims.forEach((c: any) => candidate(c, ids));
reconcile(saved.reconcile, ids);
assert.deepEqual(saved.capped_ledger, applyPolicy(saved.reconcile.claims, saved.evidence));
const prep = process.env.PREP || '/Users/kash/Code/sandbox/outage-desk-prep';
const doc = await readFile(`${prep}/replay/asos-2026-10-06.md`, 'utf8');
assert.equal(createHash('sha256').update(doc).digest('hex'), saved.source_sha256, 'Source changed since capture');
const expected = doc.split('### Snapshot 2:')[1].split('**Demo line')[0].split('\n').filter(line => line.startsWith('| ') && !line.startsWith('| Claim') && !line.startsWith('| ---')).map(line => line.split('|').slice(1, -1).map(v => v.trim()));
assert.equal(expected.length, 12);
const aligned = [['C-004'], ['C-011', 'C-021'], ['C-023'], ['C-024', 'C-025'], ['C-005'], ['C-027'], ['C-001'], ['C-029'], ['C-017'], ['C-033'], ['C-026'], ['C-007']];
const mapped = new Set(aligned.flat());
const rows = expected.map((row, index) => ({
  expected_row: index + 1, expected_statement: row[0], expected_class: row[1].replaceAll('**', ''),
  generated_ids: aligned[index], generated_claims: aligned[index].map(id => saved.capped_ledger.find((c: any) => c.id === id)),
  matches: index !== 10,
  note: index === 10 ? 'Class/formulation mismatch: C-026 is CONFIRMED that ASOS says it is too early to quantify trading impact. The golden ledger instead requires an UNKNOWN trading-impact row, which is absent.'
    : index === 1 ? 'Equivalent content and class, split into investigating (C-011) and restricted access (C-021).'
    : index === 3 ? 'Equivalent content and class, split into payment cards (C-024) and passwords (C-025); both retain ASOS does not believe.'
    : 'Same underlying assertion, attribution and class; wording may differ.',
}));
const trapNotes = [
  ['C-001', 'Attacker claim stays about ASOS’s Snowflake instance, subject ASOS, UNCONFIRMED. Snowflake platform claims cite press A-12 and describe its denial.'],
  ['C-018,C-019,C-020', 'A-10 appears only on three explicitly separate July-incident context rows; it supports no October claim.'],
  ['C-001,C-004', 'A-01 is community evidence and C-001 remains UNCONFIRMED. Confirmed notification row C-004 cites ASOS announcement A-11, not the official-app delivery as authority.'],
  ['C-007,C-008,C-009,C-010,C-014,C-031', 'Market-movement rows stay REPORTED and are not used as breach proof.'],
  ['C-001', 'The compromise allegation cites A-01 only; no relaying press is counted as independent support.'],
  ['C-001,C-027,C-028', 'No Snowflake assertion cites A-11. ASOS’s statement remains about unnamed third-party platforms.'],
  ['C-023,C-024,C-025,C-029', 'ASOS may-have wording and does-not-believe wording remain intact. Attacker payment assurance is separately UNCONFIRMED and attributed.'],
];
saved.comparison = {
  snapshot: 2, method: 'Semantic review against all 12 expected snapshot-2 propositions, allowing splits and paraphrases while requiring attribution, modality and class. Review is bound to the exact ledger SHA-256.',
  reviewed_ledger_sha256: hash, expected_claim_count: 12, matched_expected_claim_count: 11,
  rows, differences: rows.filter(r => !r.matches),
  additional_claims: saved.capped_ledger.filter((c: any) => !mapped.has(c.id)),
  policy_changes: saved.capped_ledger.filter((c: any) => c.class !== saved.reconcile.claims.find((r: any) => r.id === c.id).class).map((c: any) => ({ claim_id: c.id, from: saved.reconcile.claims.find((r: any) => r.id === c.id).class, to: c.class, statement: c.statement })),
  traps: trapNotes.map(([claim_ids, finding], index) => ({ trap: index + 1, hit: false, claim_ids: claim_ids.split(','), finding })),
  traps_pass: true, golden_pass: false,
};
saved.generation_notes = ['The initial EXTRACT context accidentally included A-14 in the earlier-summary group while also saying A-11–A-14 were read as described. The evidence row itself is verbatim and both A-14 claims remain REPORTED. The runner context is corrected for future runs.'];
await writeFile(path, JSON.stringify(saved, null, 2) + '\n');
console.log(JSON.stringify({ matched: 11, expected: 12, extra_rows: saved.comparison.additional_claims.length, trap_hits: [], policy_changes: saved.comparison.policy_changes }));
