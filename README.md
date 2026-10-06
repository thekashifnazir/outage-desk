# Outage Desk

When a cloud provider goes down, someone has to tell the board, the engineers and the
customers what's happening, usually before the provider explains it. Outage Desk turns
the evidence coming in into a ledger of claims labelled by certainty, then drafts an
update per audience where every sentence cites the claim behind it.

Built at the GPT-6 Astra Hackathon London, 6 October 2026. The demo replays the real
12 June 2025 Google Cloud → Cloudflare outage, stage by stage.

<!-- TODO 20:05: hero screenshot from docs/screenshots/ -->

## What it does

- Takes evidence from status pages, other companies' pages, community posts and our own
  monitoring.
- Turns it into claims, each labelled **Confirmed**, **Reported**, **Conflicting**,
  **Unconfirmed** or **Unknown**.
- Drafts three updates (executive, engineering, customer) where every sentence cites the
  claims it rests on.
- Checks each sentence against what it cites before it can be copied out.

## How it works

```
evidence ──▶ 1. extract ──▶ 2. reconcile ──▶ policy caps ──▶ 3. communicate ──▶ 4. verify
             (Astra)        (Astra)          (code only)     (Astra, ×3)        (code + Astra)
                                │                                 │
                                ▼                                 ▼
                          claim ledger                  executive · engineering · customer
```

GPT-6 Astra does four of the steps:

1. **Extract** checkable claims from raw evidence.
2. **Reconcile** them into the ledger: upgrades, merges, conflicts.
3. **Communicate**: write the executive, engineering and customer updates.
4. **Verify** that each generated sentence is supported by the claims it cites.

The policy step is deliberately not AI. A small deterministic engine caps each claim's
label by who said it, so a single private-channel post can never become Confirmed, no
matter how convincing it sounds. Model output is treated as data: it is validated
against the types before anything uses it.

<!-- TODO 20:05: reliability model (policy caps, citation checks, golden replay) -->

| Where | What |
| --- | --- |
| `src/data/replay/` | Replay stages 1–9 and the shared types |
| `src/data/saved-runs/` | Saved GPT-6 Astra runs for each stage |
| `src/lib/policy.ts` | Provenance caps and channel precedence (no AI) |
| `src/lib/verify.ts` | Sentence citation checks (no AI) |
| `src/lib/astra.*` | Server functions calling GPT-6 Astra |
| `scripts/` | Batch runner that produced the saved runs |

## How it was built tonight

<!-- TODO 20:05: final copy + commit citations -->

- **Lovable** built the whole UI from a written brief, iterated with fix prompts, synced
  to this repo and published it.
- **Codex** wrote the replay data, the policy engine, the verifier and the Astra batch
  runner, commit by commit.
- **Claude Code** wrote this README and walked the published app as the tester.

AI-assisted throughout. Pre-existing tooling is dev config only, no product code.

## Run it

```sh
npm install
npm run dev     # local dev server
npm test        # policy and verify tests
npm run build   # production build
```

Open the desk at `/?stage=1` and step through stages with the replay bar. The Analysis
page shows the pipeline, the golden replay check and the policy rules.

The live Astra calls need a Lovable AI key set as a server secret in Lovable Cloud. The
replay itself runs from the files in `src/data/` with no key.

## Roadmap

<!-- TODO 20:05 -->

## Licence

[AGPL-3.0](LICENSE)
