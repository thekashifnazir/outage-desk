# Public-page evidence collector — Step 0

Uses the public-beta **Agents API**, **GPT-6 Astra**, and OpenAI-hosted
`computer_use`. The app's package manifest is untouched; dependencies live here.

From the repository root:

```sh
npm ci --prefix collector --cache /tmp/outagedesk-collector-npm-cache --ignore-scripts --no-audit --no-fund
node --env-file=.env.local collector/step-zero.mjs
```

The script reads only `OUTAGEDESK_OPENAI_API_KEY` from the process environment.
Never create, print, or commit an env file. The key is not sent into the agent's
environment. SDK retries are disabled; failures stop the run.

The hosted network permits only the exact host `status.cloud.google.com`.
Origin approvals use the same HTTPS allowlist; authentication is cancelled.
Instructions prohibit forms, downloads, external navigation, Telegram, and
leak content, and treat all page content as untrusted data. Origin/network
restrictions enforce host access; restrictions on actions within an approved
page depend on the agent following instructions.

`evidence.mjs` checks the required fields and unions in
`src/data/replay/types.ts`, plus collector requirements: an ISO capture time,
an allowed HTTPS source URL, `arrived_via: "api"`, and `fictional: false`.
Successful output is written to `out/step-0.json`; run metadata and any exact
failure are written to `out/step-0-run.json`. The session is deleted afterward.
The local validator checks structure and provenance fields; a verbatim excerpt
must come from the browser observation, not merely pass schema validation.

## First live check

2026-10-06: session creation succeeded, but the returned object failed:

```text
Evidence validation failed: Unexpected field error; Invalid kind
```

Elapsed: **67.334 seconds**. The session was deleted. No valid evidence item
was saved. Per the requested Step 0 gate, collection stopped; there is no
`out/asos.json`, and no alternative API or browser was used.

## Current documentation consulted before implementation

- [Agents API overview](https://developers.openai.com/api/docs/guides/agents-api/overview)
- [Agents API quickstart](https://developers.openai.com/api/docs/guides/agents-api/quickstart)
- [Agents API computer use](https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use)
- [Hosted network restrictions](https://developers.openai.com/api/docs/guides/agents-api/environments/openai-hosted#control-network-access)
