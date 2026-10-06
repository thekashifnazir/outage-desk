import { stages } from "@/data/replay";
import type { Change, Claim, Draft, Stage } from "@/data/replay/types";
import { applyPolicy, filterEvidenceAt, replayTime } from "@/lib/policy";
import { verifyDraft } from "@/lib/verify";
import { callAstra } from "./gateway.server";
import { COMMUNICATE_PROMPT, EXTRACT_PROMPT, RECONCILE_PROMPT, VERIFY_PROMPT } from "./prompts";
import {
  classes,
  communicateSchema,
  extractSchema,
  reconcileSchema,
  supportSchema,
  type StepTiming,
} from "./schemas";

const COMPANY_CONTEXT =
  "Northwind. Customer app: Cloud Run + Firestore + Firebase Auth, us-central1 only, no second region. Staff tools behind Cloudflare Access.";

const fill = (template: string, params: Record<string, string>) =>
  template.replace(/\{([a-z_]+)\}/g, (match, name: string) => params[name] ?? match);
const fail = (ok: unknown, message: string) => {
  if (!ok) throw new Error(message);
};

export function stageAt(n: number): Stage {
  const stage = stages[n - 1];
  if (!stage || n === 9) throw new Error("Live runs cover stages 1–8.");
  return stage;
}

export async function runExtract(n: number) {
  const stage = stageAt(n);
  const previous = new Set(n > 1 ? stages[n - 2]!.evidence.map((e) => e.id) : []);
  const fresh = filterEvidenceAt(stage.evidence, stage.at).filter((e) => !previous.has(e.id));
  const freshIds = new Set(fresh.map((e) => e.id));
  const prompt = fill(EXTRACT_PROMPT, {
    now: stage.at,
    company_context: COMPANY_CONTEXT,
    evidence_lines: fresh.map((e) => `${e.id} | ${e.at} | ${e.kind} | ${e.origin} | ${e.excerpt}`).join("\n"),
  });
  const { value, attempts, seconds } = await callAstra(prompt, extractSchema, (v) => {
    for (const c of v.claims) {
      fail(c.statement.trim(), "Empty statement");
      fail(c.source_ids.every((id) => freshIds.has(id)), "source_ids must be ids from EVIDENCE");
      fail(!c.estimate || freshIds.has(c.estimate.source_id), "estimate.source_id must be from EVIDENCE");
    }
  });
  const timing: StepTiming = { step: "EXTRACT", audience: null, attempts, seconds };
  return { claims: value.claims, fresh: fresh.length, total: stage.evidence.length, timing };
}

const num = (id: string) => Number(id.split("-")[1]) || 0;
const fmt = (n: number) => `C-${String(n).padStart(3, "0")}`;

export async function runReconcile(n: number, previousLedger: Claim[], candidates: unknown[]) {
  const stage = stageAt(n);
  const cutoff = replayTime(stage.at);
  const evidenceAt = new Map(stage.evidence.map((e) => [e.id, replayTime(e.at)]));
  const timely = (id: string) => evidenceAt.has(id) && evidenceAt.get(id)! <= cutoff;
  // Every id ever used: reference ledgers and change rows up to the previous stage, plus the live ledger.
  const used = new Set<string>(previousLedger.map((c) => c.id));
  for (const s of stages.slice(0, n - 1)) {
    s.claims.forEach((c) => used.add(c.id));
    s.changes.forEach((c) => used.add(c.claim_id));
  }
  const prevIds = new Set(previousLedger.map((c) => c.id));
  const nextId = fmt(Math.max(0, ...[...used].map(num)) + 1);
  const prompt =
    fill(RECONCILE_PROMPT, {
      now: stage.at,
      ledger_json: JSON.stringify(previousLedger),
      next_id: nextId,
      candidates_json: JSON.stringify(candidates),
    }) +
    `\n\nEach ledger claim must be a complete object with: id, statement, subject, unknown_kind, class, proposed_class (copy class if you have no other proposal), source_ids, provider_wording, settled_by, estimate, first_seen (time, e.g. "${stage.at}"), superseded_by, contradiction_sides (array of {label, source_ids} for CONFLICTING claims, else null; use it instead of contradiction_group), history (array of {stage, class, statement, because}; this is stage ${n}).`;

  const check = (v: { claims: Claim[]; changes: { claim_id: string; change: string; from: string | null; to: string | null; because: string[] }[] }) => {
    const ids = new Set<string>();
    for (const c of v.claims) {
      fail(/^C-\d+$/.test(c.id) && !ids.has(c.id), `Invalid or duplicate claim id ${c.id}`);
      ids.add(c.id);
      fail(c.source_ids.every(timely), `${c.id} cites a source that doesn't exist or is after ${stage.at}`);
      for (const h of c.history) fail(h.because.every(timely), `${c.id} history cites an unknown or future source`);
    }
    const kinds = new Set<string>();
    for (const c of v.claims.filter((c) => c.class === "UNKNOWN")) {
      fail(!c.source_ids.length, `UNKNOWN claim ${c.id} must have no source_ids`);
      const kind = c.unknown_kind ?? "unspecified";
      fail(!kinds.has(kind), `More than one UNKNOWN claim for ${kind}`);
      kinds.add(kind);
    }
    const isClass = (x: string | null) => x === null || (classes as readonly string[]).includes(x);
    for (const ch of v.changes) {
      if (ch.change === "MERGED") {
        fail(!ids.has(ch.claim_id), `MERGED claim ${ch.claim_id} is still in the ledger`);
        fail(ch.to !== null && ids.has(ch.to), `MERGED ${ch.claim_id} must name the id it merged into`);
        fail(isClass(ch.from), `Change ${ch.claim_id}: from must be a class name`);
      } else fail(isClass(ch.from) && isClass(ch.to), `Change ${ch.claim_id}: from/to must be class names`);
      fail(ch.because.every(timely), `Change ${ch.claim_id} cites an unknown or future source`);
    }
  };

  const { value, attempts, seconds } = await callAstra(prompt, reconcileSchema, check as never, "medium");

  // Ids are assigned by code: renumber any new claim that reuses a previously used id.
  let next = Math.max(0, ...[...used].map(num), ...value.claims.map((c) => num(c.id))) + 1;
  const rename = new Map<string, string>();
  for (const c of value.claims) {
    if (!prevIds.has(c.id) && used.has(c.id)) rename.set(c.id, fmt(next++));
  }
  const map = (id: string | null) => (id && rename.get(id)) || id;
  const claims: Claim[] = value.claims.map((c) => ({ ...c, id: map(c.id)!, superseded_by: map(c.superseded_by) }));
  const changes = value.changes.map((ch) => ({
    ...ch,
    claim_id: rename.has(ch.claim_id) && ch.change !== "MERGED" ? rename.get(ch.claim_id)! : ch.claim_id,
    to: ch.change === "MERGED" ? map(ch.to) : ch.to,
  })) as unknown as Change[];

  // Policy check (deterministic code from src/lib/policy.ts): cap classes by provenance.
  const policyStart = Date.now();
  const capped = applyPolicy(claims, stage.evidence, { now: stage.at });
  const timings: StepTiming[] = [
    { step: "RECONCILE", audience: null, attempts, seconds },
    { step: "POLICY", audience: null, attempts: 1, seconds: (Date.now() - policyStart) / 1000 },
  ];
  return { ledger: capped, changes, renumbered: Object.fromEntries(rename), timings };
}

export async function runCommunicate(
  n: number,
  ledger: Claim[],
  audience: Draft["audience"],
  mode: Draft["policy_mode"],
) {
  const stage = stageAt(n);
  const claimIds = new Set(ledger.map((c) => c.id));
  const responseIds = new Set(stage.response_items.map((r) => r.id));
  const prompt = fill(COMMUNICATE_PROMPT, {
    audience,
    company: "Northwind",
    mode: mode ?? "not applicable",
    now: stage.at,
    ledger_json: JSON.stringify(ledger),
    response_items_json: JSON.stringify(stage.response_items),
  });
  const { value, attempts, seconds } = await callAstra(prompt, communicateSchema, (v) => {
    fail(v.sections.length, "Missing sections");
    for (const s of v.sections) {
      fail(s.sentences.length, `Section "${s.heading}" has no sentences`);
      for (const x of s.sentences) {
        fail(x.text.trim(), "Empty sentence");
        fail(x.claim_ids.every((id) => claimIds.has(id)), `Unknown claim id in "${x.text}"`);
        fail(x.response_ids.every((id) => responseIds.has(id)), `Unknown response id in "${x.text}"`);
      }
    }
  });
  const draft: Draft = {
    audience,
    policy_mode: mode,
    as_of: stage.at,
    source: "astra_live",
    generated_at: new Date().toISOString(),
    sections: value.sections.map((s) => ({ ...s, sentences: s.sentences.map((x) => ({ ...x, verify: null })) })),
  };
  const timing: StepTiming = { step: "COMMUNICATE", audience: mode ? `${audience} · ${mode}` : audience, attempts, seconds };
  return { draft, timing };
}

export async function runVerify(n: number, ledger: Claim[], drafts: Draft[]) {
  const base = stageAt(n);
  const stage: Stage = { ...base, claims: ledger };
  const timings: StepTiming[] = [];
  // Code rules first (src/lib/verify.ts), then the GPT-6 Astra support check.
  const codeStart = Date.now();
  const coded = drafts.map((d) =>
    verifyDraft({ ...d, sections: d.sections.map((s) => ({ ...s, sentences: s.sentences.map((x) => ({ ...x, verify: null })) })) }, stage),
  );
  timings.push({ step: "VERIFY_CODE", audience: null, attempts: 1, seconds: (Date.now() - codeStart) / 1000 });
  const results = await Promise.all(
    coded.map(async (result) => {
      const draft = result.draft;
      const sentences = draft.sections.flatMap((s) => s.sentences);
      const prompt = fill(VERIFY_PROMPT, {
        ledger_json: JSON.stringify(ledger),
        response_items_json: JSON.stringify(base.response_items),
        draft_json: JSON.stringify({
          audience: draft.audience,
          policy_mode: draft.policy_mode,
          sentences: sentences.map((s, i) => ({ sentence_index: i, text: s.text, type: s.type, claim_ids: s.claim_ids, response_ids: s.response_ids })),
        }),
      }) + "\n\nsentence_index is zero-based; return exactly one result per sentence.";
      const { value, attempts, seconds } = await callAstra(prompt, supportSchema, (v) => {
        fail(v.results.length === sentences.length, "Expected one result per sentence");
        const seen = new Set<number>();
        for (const r of v.results) {
          fail(r.sentence_index >= 0 && r.sentence_index < sentences.length && !seen.has(r.sentence_index), "Invalid sentence_index (zero-based, unique)");
          fail(r.supported || r.problem, "Unsupported results need a problem");
          seen.add(r.sentence_index);
        }
      });
      timings.push({ step: "VERIFY", audience: draft.policy_mode ? `${draft.audience} · ${draft.policy_mode}` : draft.audience, attempts, seconds });
      for (const r of value.results) {
        const s = sentences[r.sentence_index]!;
        if (!r.supported)
          s.verify = { pass: false, reason: [s.verify?.pass === false ? s.verify.reason : null, `GPT-6 Astra: ${r.problem}`].filter(Boolean).join("; ") };
      }
      return verifyDraft(draft, stage);
    }),
  );
  return {
    pass: results.every((r) => r.pass),
    drafts: results.map((r) => r.draft),
    summary: results.map((r) => ({ audience: r.draft.audience, policy_mode: r.draft.policy_mode, verified: r.verified, total: r.total, word_count: r.word_count, word_limit: r.word_limit })),
    timings,
  };
}
