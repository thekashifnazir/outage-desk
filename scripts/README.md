# Astra saved runs

Credential correction to the batch brief: use `OUTAGEDESK_OPENAI_API_KEY` from
`.env.local` for every run. Never create, print, or commit the tracked `.env` file.
No dependencies are added; Node 25 runs the TypeScript directly.

```sh
node --env-file=.env.local scripts/astra-step-zero.ts
node --env-file=.env.local scripts/astra-batch.ts 4
```

Set `PREP` to the preparation directory if it is not at the sibling
`outage-desk-prep` path. Prompt blocks are loaded verbatim and placeholders are
filled from reference evidence and ledgers. The current runtime type contract is
appended to disambiguate the older prompt's UPDATED/merge fields.

Saved results are untrusted until validated. Partial and failed results retain
`verify.pass: false`; consumers must use reference drafts unless verification
passes. Step-zero tokens are included in stage 4's totals, so do not count the
step-zero artifact a second time.

Run the complete pipeline for any stage set, with stages independent and the three
audiences concurrent:

```sh
node --env-file=.env.local scripts/run-astra.ts 1 2 3 4 5 6 7 8 9
```

Extraction and reconciliation resume from saved valid outputs. Draft generation
and verification rerun, retaining all call usage in `timings`. To regenerate a
ledger, move its saved file aside first. Each reconcile uses the preceding
**reference** stage. Stage 9 retains reference drafts and has verification status
`not_applicable`. The three generated drafts are executive, engineering and
customer confirmed-only; early-incident customer copy stays on the reference path.

Use `astra-drafts.ts` or `astra-verify.ts` with stage numbers 1–8 to run those
phases separately. Verification always runs `src/lib/verify.ts` first, followed by
Astra for every sentence, and combines both checks. Any failing audience makes the
whole stage `verify.pass: false`. Consumers must fall back to reference drafts.
The verifier source hash is recorded for reproducibility.
