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
