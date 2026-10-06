import { readFile, writeFile } from 'node:fs/promises';
import { stage5 } from '../src/data/replay/stage-5.ts';

// Run: node --env-file=.env.local scripts/astra-step-zero.ts
// EXTRACT returns candidate fields, not a complete persisted Claim ledger.
const prep = process.env.PREP || '/Users/kash/Code/sandbox/outage-desk-prep';
const key = process.env.OUTAGEDESK_OPENAI_API_KEY;
if (!key) throw new Error('OUTAGEDESK_OPENAI_API_KEY is missing from .env.local');
const spec = await readFile(`${prep}/docs/12-astra-steps.md`, 'utf8');
const template = spec.split('## Step 1: EXTRACT')[1].split('```')[1].trim();
const ids = ['S8', 'S9', 'S12', 'S7', 'S11', 'M1', 'S10'];
// Stage 4 is not yet checked in. These exact register items are also in stage 5.
const evidence = ids.map(id => {
  const item = stage5.evidence.find(e => e.id === id);
  if (!item) throw new Error(`Missing stage 4 evidence ${id}`);
  return item;
});
const prompt = template.replace('{now}', '2025-06-12T18:51:00Z')
  .replace('{company_context}', 'Northwind. Customer app: Cloud Run + Firestore + Firebase Auth, us-central1 only, no second region. Staff tools behind Cloudflare Access.')
  .replace('{evidence_lines}', evidence.map(e => `${e.id} | ${e.at} | ${e.kind} | ${e.origin} | ${e.excerpt}`).join('\n'));
const classes = ['CONFIRMED', 'REPORTED', 'CONFLICTING', 'UNCONFIRMED', 'UNKNOWN'];
const nullableString = (v: unknown) => v === null || typeof v === 'string';
function validate(value: any) {
  if (!value || !Array.isArray(value.claims) || !value.claims.length) throw new Error('claims must be a nonempty array');
  for (const c of value.claims) {
    if (typeof c.statement !== 'string' || !c.statement.trim() || !nullableString(c.subject)
      || ![null, 'cause', 'recovery', 'scope', 'data'].includes(c.unknown_kind)
      || !classes.includes(c.proposed_class) || !Array.isArray(c.source_ids)
      || !c.source_ids.every((id: unknown) => typeof id === 'string' && ids.includes(id))
      || !nullableString(c.provider_wording) || !nullableString(c.settled_by)
      || !(c.estimate === null || (c.estimate && ['speaker', 'said', 'at', 'source_id'].every(k => typeof c.estimate[k] === 'string') && ids.includes(c.estimate.source_id)))) {
      throw new Error('Candidate does not match EXTRACT fields from Claim');
    }
  }
}
const timings: any[] = [];
for (let attempt = 1; attempt <= 2; attempt++) {
  const start = performance.now();
  let response;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-6-astra', input: prompt, reasoning: { effort: 'low' }, text: { format: { type: 'json_object' } }, store: false }),
      signal: AbortSignal.timeout(600_000),
    });
  } catch (error: any) {
    console.error(JSON.stringify({ step: 'EXTRACT', stage: 4, seconds: (performance.now() - start) / 1000, error: error.message, cause: error.cause?.code }));
    process.exit(1);
  }
  const body = await response.json();
  const timing = { step: 'EXTRACT', stage: 4, attempt, seconds: (performance.now() - start) / 1000, tokens: body.usage ?? null };
  timings.push(timing);
  console.log(JSON.stringify(timing));
  if (!response.ok) {
    // API errors may echo credentials; redact the secret before logging.
    console.error(`HTTP ${response.status}: ${JSON.stringify(body.error ?? body).replaceAll(key, '[REDACTED]')}`);
    process.exit(1);
  }
  try {
    if (body.status !== 'completed') throw new Error(`Response status: ${body.status}`);
    const raw = body.output.flatMap((item: any) => item.content ?? []).filter((item: any) => item.type === 'output_text').map((item: any) => item.text).join('');
    const output = JSON.parse(raw);
    validate(output);
    await writeFile('src/data/saved-runs/step-0-stage-4.json', JSON.stringify({ stage: 4, model: 'gpt-6-astra', generated_at: new Date().toISOString(), extract: output, timings, schema_valid: true }, null, 2) + '\n');
    console.log(`STEP 0 PASSED: ${output.claims.length} schema-valid candidate claims`);
    break;
  } catch (error: any) {
    console.error(`Validation attempt ${attempt}: ${error.message}`);
    if (attempt === 2) {
      await writeFile('src/data/saved-runs/step-0-stage-4.json', JSON.stringify({ stage: 4, schema_valid: false, error: error.message, timings }, null, 2) + '\n');
      process.exitCode = 1;
    }
  }
}
