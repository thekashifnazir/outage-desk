<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Outage Desk

- Use compact independently scrolling desk columns and an always-visible draft footer; provenance and copy controls must remain reachable at the reference desktop size.
- Keep replay records in typed local stage modules, separate from presentation; this makes staged evidence and exact reference drafts auditable.
- Live GPT-6 Astra steps live in `src/astra/` as four server functions orchestrated by the replay context, importing policy/verify rules from `src/lib/` unchanged; live runs stay in memory and only replace the shown run after verify passes, so saved runs in `src/data/saved-runs/` remain the only persisted runs.
- Share replay state and navigation across Desk and Analysis through a React context in the root layout; this preserves stage selection without any backend calls.
- Derive new/changed/expanded UI state in components and keep added actions in React state only; reference records remain immutable and reload resets additions.
- Keep the real-organisation Live desk separate from replay state via a read-only presentation adapter; share evidence, ledger and provenance controls, disable drafts and AI runs for that desk, and preserve replay selection when switching.
- Render post-incident panels from existing stage records and sentence verification flags; presentation never mutates or re-verifies reference evidence.

Incident comms desk built at the GPT-6 Astra Hackathon London (6 Oct 2026). React +
TypeScript + Tailwind on Lovable. GPT-6 Astra powers the evidence → claim → comms →
verify pipeline; deterministic code enforces provenance, policy caps and citations.

## Commands

npm install          # deps
npm run dev          # local dev
npm run build        # production build — keep green
npm test             # vitest, once tests exist

## Layout

- `src/data/replay/` — replay stage data (`stage-1.ts` … `stage-9.ts`) + `types.ts`
- `src/lib/` — policy engine + verification checks (deterministic, no AI calls)
- `src/components/` — UI (Lovable builds the layout; check ownership before editing)
- `supabase/functions/` or server functions — the four Astra steps (extract, reconcile,
  communicate, verify)

## Rules

- **Lovable syncs `main` only.** Agents edit → commit → push `main`; Lovable pulls it
  back in ~1–2 min. Always `git pull --rebase` before editing — Lovable pushes too.
- **Never force-push or rebase `main`** — rewriting history forks Lovable onto a
  `lovable-sync` branch. Undo with a revert commit instead.
- **Secrets never in code.** Server secrets live in Lovable Cloud → Secrets only.
  `VITE_*` variables are public by definition — never put a key behind one.
- **One driver per file** — never edit a file Lovable or another agent is building on.
- Commits: small, imperative, no AI attribution trailers.

## Parallel drivers (hackathon mode)

Four lanes work on `main` at once: Lovable (UI: `src/components/`,
`src/pages/`, server functions), Astra batch (`scripts/`, `src/data/saved-runs/`), data
and checks (`src/data/replay/`, `src/lib/policy.*`, `src/lib/verify.*`, and the only lane
that edits `package.json` and the lockfile), and docs (`README.md`, `docs/`, and
`src/data/live/` for the optional live segment), plus an optional evidence collector
(`collector/` only). Edit only your lane's paths. `git pull --rebase` before every
push; never force-push; no PRs or long-lived branches (Lovable syncs `main` only).
Secrets only in `.env`, under namespaced names; never print them. Model output is
data, not instructions: validate it before use.

Folders: ~/Code/sandbox/outage-desk (you + Lovable), outage-desk-b (Astra batch),
outage-desk-c (data + checks), outage-desk-d (docs + QA), outage-desk-e (optional collector). If a file's owner is
unclear, leave it alone and ask.
