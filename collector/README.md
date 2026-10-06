# Public-page evidence collector — Step 0

Uses the public-beta **Agents API**, **GPT-6 Astra**, and OpenAI-hosted
`computer_use`. The app's package manifest is untouched; dependencies live here.

From the repository root:

```sh
npm ci --prefix collector --cache /tmp/outagedesk-collector-npm-cache --ignore-scripts --no-audit --no-fund
node --env-file=.env.local collector/step-zero.mjs
```

The one explicitly authorized retry was run with:

```sh
node --env-file=.env.local collector/step-zero.mjs --retry-once --deadline=2026-10-06T19:28:00+01:00
```

`--retry-once` refuses to run again when its run report already exists. An
absolute deadline aborts observation and requests cancellation before cleanup.
Raw final output is printed and saved before validation, with keys redacted.
Retry metadata uses separate files so the first failure is preserved.

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

## One authorized retry

2026-10-06, before the 19:28 London deadline: the exact host remained allowed
and its browser origin request was approved. The agent's raw final output was:

```text
The browser displayed “Site Unavailable” and “Unable to access this site.” I could not observe Google Cloud status content, so no Evidence item was captured.
```

Elapsed: **58.602 seconds**. Parsing failed because this is plain text, not
Evidence JSON. The raw response is preserved in `out/step-0-retry-raw.txt`, with
metadata and browser activity in `out/step-0-retry-run.json`. The session was
deleted. No valid evidence was captured; collection stopped without another
retry or any ASOS run.

## Current documentation consulted before implementation

- [Agents API overview](https://developers.openai.com/api/docs/guides/agents-api/overview)
- [Agents API quickstart](https://developers.openai.com/api/docs/guides/agents-api/quickstart)
- [Agents API computer use](https://developers.openai.com/api/docs/guides/agents-api/tools/computer-use)
- [Hosted network restrictions](https://developers.openai.com/api/docs/guides/agents-api/environments/openai-hosted#control-network-access)
