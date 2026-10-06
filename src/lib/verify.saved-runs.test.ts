import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { Change, Claim, Draft, Estimate, Evidence, Sentence } from "../data/replay/types";
import { stages } from "../data/replay";
import { applyPolicy, filterEvidenceAt } from "./policy";
import { verifyDraft } from "./verify";

// Typed runtime schemas: missing/changed contract fields also fail type-checking.
const claimClass = z.enum(["CONFIRMED", "REPORTED", "CONFLICTING", "UNCONFIRMED", "UNKNOWN"]);
const ids = z.array(z.string().min(1));
const estimateSchema: z.ZodType<Estimate> = z.object({
  speaker: z.string(),
  said: z.string(),
  at: z.string(),
  source_id: z.string(),
});
const claimSchema: z.ZodType<Claim> = z.object({
  id: z.string().min(1),
  statement: z.string().min(1),
  subject: z.string().nullable(),
  unknown_kind: z.enum(["cause", "recovery", "scope", "data"]).nullable(),
  class: claimClass,
  proposed_class: claimClass,
  source_ids: ids,
  provider_wording: z.string().nullable(),
  settled_by: z.string().nullable(),
  estimate: estimateSchema.nullable(),
  first_seen: z.string().nullable(),
  superseded_by: z.string().nullable(),
  contradiction_sides: z.array(z.object({ label: z.string(), source_ids: ids })).nullable(),
  history: z.array(
    z.object({
      stage: z.number().int().min(1).max(9),
      class: claimClass,
      statement: z.string(),
      because: ids,
    }),
  ),
});
const changeSchema: z.ZodType<Change> = z.object({
  claim_id: z.string(),
  change: z.enum(["UPGRADED", "DOWNGRADED", "NEW", "MERGED", "CONFLICT"]),
  from: claimClass.nullable(),
  to: claimClass.nullable(),
  because: ids,
});
const sentenceSchema: z.ZodType<Sentence> = z.object({
  text: z.string().min(1),
  type: z.enum(["fact", "commitment"]),
  claim_ids: ids,
  response_ids: ids,
  verify: z.object({ pass: z.boolean(), reason: z.string().nullable() }).nullable(),
});
const draftSchema: z.ZodType<Draft> = z.object({
  audience: z.enum(["executive", "engineering", "customer"]),
  policy_mode: z.enum(["confirmed_only", "early_incident"]).nullable(),
  as_of: z.string(),
  source: z.enum(["reference", "astra_saved", "astra_live"]),
  generated_at: z.string().nullable(),
  sections: z
    .array(z.object({ heading: z.string(), sentences: z.array(sentenceSchema).min(1) }))
    .min(1),
});
// Extract emits candidates, not ledger Claims. It has no assigned ids/history yet.
type Candidate = Pick<
  Claim,
  | "statement"
  | "subject"
  | "unknown_kind"
  | "proposed_class"
  | "source_ids"
  | "provider_wording"
  | "settled_by"
  | "estimate"
>;
const candidateSchema: z.ZodType<Candidate> = z.object({
  statement: z.string().min(1),
  subject: z.string().nullable(),
  unknown_kind: z.enum(["cause", "recovery", "scope", "data"]).nullable(),
  proposed_class: claimClass,
  source_ids: ids,
  provider_wording: z.string().nullable(),
  settled_by: z.string().nullable(),
  estimate: estimateSchema.nullable(),
});
const stageNumber = z.number().int().min(1).max(9);
const count = z.number().int().nonnegative();
const seconds = z.number().finite().nonnegative();
const timestamp = z.string().datetime({ offset: true });
const audience = z.enum(["executive", "engineering", "customer"]);
const timingsSchema = z.array(
  z.object({
    step: z.enum(["EXTRACT", "RECONCILE", "COMMUNICATE", "VERIFY", "VERIFY_CODE"]),
    stage: stageNumber,
    audience: audience.nullable().optional(),
    attempt: z.number().int().positive().optional(),
    seconds,
    tokens: z.object({ input_tokens: count, output_tokens: count, total_tokens: count }).nullable(),
  }),
);
const supportSchema = z.object({
  results: z.array(
    z.object({
      sentence_index: count,
      supported: z.boolean(),
      problem: z.string().nullable(),
    }),
  ),
});
const verifiedAudienceSchema = z.object({
  audience,
  code_pass: z.boolean(),
  support: supportSchema,
  draft: draftSchema,
  pass: z.boolean(),
  total: count,
  verified: count,
  excluded: count,
  word_count: count,
  word_limit: count,
  over_limit: z.boolean(),
});
const draftsSchema = z.object({
  executive: draftSchema,
  engineering: draftSchema,
  customer: z.object({ confirmed_only: draftSchema, early_incident: draftSchema.nullable() }),
});
const runSchema = z.object({
  stage: stageNumber,
  model: z.literal("gpt-6-astra"),
  source: z.literal("astra_saved"),
  generated_at: timestamp,
  extract: z.object({ claims: z.array(candidateSchema).min(1) }),
  reconcile: z.object({ claims: z.array(claimSchema).min(1), changes: z.array(changeSchema) }),
  capped_ledger: z.array(claimSchema).min(1),
  drafts: draftsSchema,
  verify: z.union([
    z.object({
      pass: z.boolean(),
      status: z.enum(["complete", "failed"]),
      reason: z.string().min(1).optional(),
      verifier_sha256: z.string().regex(/^[a-f0-9]{64}$/),
      audiences: z.array(verifiedAudienceSchema).min(3).max(4),
    }),
    z.object({
      pass: z.literal(false),
      status: z.literal("not_applicable"),
      reason: z.string().min(1),
    }),
  ]),
  golden_check: z.object({
    pass: z.boolean(), claim_id: z.string(), expected_class: claimClass,
    actual_class: claimClass, at: z.string(),
  }).optional(),
  timings: timingsSchema,
  error: z.string().nullable(),
});
const extractSchema = z.object({
  stage: stageNumber,
  model: z.literal("gpt-6-astra"),
  generated_at: timestamp,
  extract: z.object({ claims: z.array(candidateSchema).min(1) }),
  timings: timingsSchema,
  schema_valid: z.literal(true),
});
// The live capture is a ledger-only artifact, not a numbered replay stage.
const evidenceSchema: z.ZodType<Evidence> = z.object({
  id: z.string().min(1), at: z.string().min(1),
  kind: z.enum(["provider_official", "internal", "downstream_company", "community", "monitor", "press", "private_channel"]),
  origin: z.string(), provider: z.string().nullable(),
  channel: z.enum(["status_page", "social", "support", "blog", "report"]).nullable(),
  excerpt: z.string(), url: z.string().url().nullable(),
  arrived_via: z.enum(["replay", "api", "archive", "manual"]), fictional: z.boolean(),
});
const liveSchema = z.object({
  segment: z.literal("live-asos"), snapshot: z.literal(2),
  model: z.literal("gpt-6-astra"), source: z.literal("astra_saved"),
  generated_at: timestamp, captured_at: timestamp,
  evidence: z.array(evidenceSchema).length(14), initial_ledger: z.array(claimSchema).length(0),
  extract: z.object({ claims: z.array(candidateSchema).min(1) }),
  reconcile: z.object({ claims: z.array(claimSchema).min(1), changes: z.array(changeSchema) }),
  capped_ledger: z.array(claimSchema).min(1), status: z.literal("complete"),
  draft: z.never().optional(), drafts: z.never().optional(),
  timings: z.array(z.object({
    step: z.enum(["EXTRACT", "RECONCILE", "POLICY"]), stage: z.literal("live-asos"),
    seconds, tokens: z.object({ input_tokens: count, output_tokens: count, total_tokens: count }).nullable(),
  })).min(3),
  total_tokens: count,
});
function checkLiveRun(input: unknown) {
  const run = liveSchema.parse(input);
  const allowed = new Set(run.evidence.map(e => e.id));
  expect([...allowed].sort()).toEqual(Array.from({ length: 14 }, (_, i) => `A-${String(i + 1).padStart(2, "0")}`));
  const checkRefs = (refs: string[]) => expect(refs.filter(id => !allowed.has(id))).toEqual([]);
  for (const claim of [...run.extract.claims, ...run.reconcile.claims, ...run.capped_ledger]) {
    checkRefs([...claim.source_ids, ...(claim.estimate ? [claim.estimate.source_id] : [])]);
  }
  for (const ledger of [run.reconcile.claims, run.capped_ledger]) {
    const ids = new Set(ledger.map(c => c.id));
    expect(ids.size).toBe(ledger.length);
    for (const claim of ledger) {
      if (claim.superseded_by) expect(ids.has(claim.superseded_by)).toBe(true);
      claim.history.forEach(h => checkRefs(h.because));
      claim.contradiction_sides?.forEach(side => checkRefs(side.source_ids));
    }
  }
  run.reconcile.changes.forEach(c => checkRefs(c.because));
  // Approximate live timestamps are not June-2025 replay timestamps.
  expect(run.capped_ledger).toEqual(applyPolicy(run.reconcile.claims, run.evidence));
  expect(run.total_tokens).toBe(run.timings.reduce((sum, t) => sum + (t.tokens?.total_tokens ?? 0), 0));
  expect(new Set(run.timings.map(t => t.step))).toEqual(new Set(["EXTRACT", "RECONCILE", "POLICY"]));
}
const summarySchema = z.object({
  generated_at: timestamp,
  total_tokens: count,
  timing_note: z.string(),
  stages: z
    .array(
      z.object({
        stage: stageNumber,
        status: z.enum(["complete", "failed", "not_applicable"]),
        pass: z.boolean(),
        extract_seconds: seconds,
        reconcile_seconds: seconds,
        communicate_parallel_seconds: seconds,
        verify_parallel_seconds: seconds,
        tokens: count,
        failures: z.array(z.string()),
      }),
    )
    .min(1),
});

const directory = resolve(import.meta.dirname, "../data/saved-runs");
function filesIn(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .flatMap((entry) => {
      const child = resolve(path, entry.name);
      return entry.isDirectory() ? filesIn(child) : [child];
    })
    .sort();
}
const files = filesIn(directory);
const read = (file: string): unknown => JSON.parse(readFileSync(file, "utf8"));
const reference = (n: number) => {
  const stage = stages.find((stage) => stage.stage === n);
  expect(stage, `No reference stage ${n}`).toBeDefined();
  return stage!;
};
function checkSources(claims: readonly Candidate[], n: number) {
  const stage = reference(n);
  const allowed = new Set(filterEvidenceAt(stage.evidence, stage.at).map((e) => e.id));
  for (const claim of claims) {
    const refs = [...claim.source_ids, ...(claim.estimate ? [claim.estimate.source_id] : [])];
    expect(
      refs.filter((id) => !allowed.has(id)),
      `Unknown/future evidence for: ${claim.statement}`,
    ).toEqual([]);
  }
}
function checkLedger(claims: readonly Claim[], n: number) {
  checkSources(claims, n);
  const claimIds = new Set(claims.map((claim) => claim.id));
  expect(claimIds.size, "Duplicate ledger ids").toBe(claims.length);
  for (const claim of claims) {
    if (claim.superseded_by)
      expect(claimIds.has(claim.superseded_by), `${claim.id}: missing superseded_by target`).toBe(
        true,
      );
    checkSources(
      [
        ...claim.history.map((h) => ({
          ...claim,
          statement: h.statement,
          source_ids: h.because,
          estimate: null,
        })),
        ...(claim.contradiction_sides ?? []).map((side) => ({
          ...claim,
          source_ids: side.source_ids,
          estimate: null,
        })),
      ],
      n,
    );
    expect(
      claim.history.every((h) => h.stage <= n),
      `${claim.id}: future history`,
    ).toBe(true);
  }
}
function checkRunPolicy(input: unknown) {
  const run = runSchema.parse(input);
  const stage = reference(run.stage);
  expect(run.error, "Saved run has an error").toBeNull();
  checkSources(run.extract.claims, run.stage);
  checkLedger(run.reconcile.claims, run.stage);
  checkLedger(run.capped_ledger, run.stage);
  for (const change of run.reconcile.changes)
    checkSources(
      [{ ...run.extract.claims[0]!, source_ids: change.because, estimate: null }],
      run.stage,
    );
  expect(run.capped_ledger, "Saved ledger differs from the current policy output").toEqual(
    applyPolicy(run.reconcile.claims, stage.evidence, { now: stage.at }),
  );
  expect(
    run.timings.every((t) => t.stage === run.stage),
    "Timing belongs to another stage",
  ).toBe(true);
  return run;
}
function checkRunVerify(input: unknown) {
  const run = runSchema.parse(input);
  const stage = reference(run.stage);
  const slots: [Draft["audience"], Draft["policy_mode"], Draft][] = [
    ["executive", null, run.drafts.executive],
    ["engineering", null, run.drafts.engineering],
    ["customer", "confirmed_only", run.drafts.customer.confirmed_only],
  ];
  if (run.drafts.customer.early_incident)
    slots.push(["customer", "early_incident", run.drafts.customer.early_incident]);
  // Stage 9 explicitly stores the reference pack, whose ids refer to the golden ledger.
  // It is still verified below; a source label alone cannot bypass the saved ledger.
  const fallback = run.stage === 9 && run.verify.status === "not_applicable";
  if (fallback) expect(run.drafts).toEqual(stage.drafts);
  const context = fallback ? stage : { ...stage, claims: run.capped_ledger };
  if ("audiences" in run.verify) {
    expect(
      run.verify.audiences.map((r) => `${r.audience}/${r.draft.policy_mode}`).sort(),
      "Verification reports must match the stored draft slots exactly",
    ).toEqual(slots.map(([audience, mode]) => `${audience}/${mode}`).sort());
  }
  const failures: string[] = [];
  for (const [audience, mode, draft] of slots) {
    expect([draft.audience, draft.policy_mode, draft.as_of]).toEqual([audience, mode, stage.at]);
    if (!fallback) {
      expect(draft.source).toBe("astra_saved");
      timestamp.parse(draft.generated_at);
    }
    const result = verifyDraft(draft, context);
    for (const section of result.draft.sections)
      for (const sentence of section.sentences) {
        if (!sentence.verify?.pass)
          failures.push(
            `${audience}/${mode ?? "internal"}: ${sentence.verify?.reason} — ${sentence.text}`,
          );
      }
    expect(
      draft.sections.flatMap((s) => s.sentences).every((s) => s.verify !== null),
      `${audience}: missing saved sentence verification`,
    ).toBe(true);
    if ("audiences" in run.verify) {
      const report = run.verify.audiences.find(
        (r) => r.audience === audience && r.draft.policy_mode === mode,
      );
      expect(report, `${audience}/${mode}: missing verification report`).toBeDefined();
      if (report) {
        expect(report.draft, "Report draft differs from saved draft").toEqual(draft);
        const sentences = draft.sections.flatMap((s) => s.sentences);
        const indices = report.support.results.map((s) => s.sentence_index).sort((a, b) => a - b);
        expect(indices, "Support results must cover each sentence exactly once").toEqual(
          sentences.map((_, i) => i),
        );
        for (const support of report.support.results) {
          if (!support.supported)
            failures.push(`${audience}: Astra support failed: ${support.problem}`);
        }
        expect([
          report.pass,
          report.total,
          report.verified,
          report.excluded,
          report.word_count,
          report.word_limit,
          report.over_limit,
        ]).toEqual([
          result.pass,
          result.total,
          result.verified,
          result.excluded,
          result.word_count,
          result.word_limit,
          result.over_limit,
        ]);
        const unchecked: Draft = {
          ...draft,
          sections: draft.sections.map((s) => ({
            ...s,
            sentences: s.sentences.map((sentence) => ({ ...sentence, verify: null })),
          })),
        };
        expect(report.code_pass).toBe(verifyDraft(unchecked, context).pass);
      }
    }
  }
  if (run.golden_check?.pass === false) {
    expect(run.verify).toMatchObject({ status: "failed", pass: false });
    expect(run.golden_check.actual_class).not.toBe(run.golden_check.expected_class);
    expect(stage.claims.find(c => c.id === run.golden_check!.claim_id)?.class).toBe(run.golden_check.expected_class);
    expect(run.capped_ledger.find(c => c.id === run.golden_check!.claim_id)?.class).toBe(run.golden_check.actual_class);
  }
  if (run.verify.status === "failed") {
    // Failed artifacts are retained for fallback; their failures must not become passes.
    expect(run.verify.pass).toBe(false);
    expect(failures.length > 0 || !!run.verify.reason, "Failed run needs a diagnostic").toBe(true);
    return;
  }
  expect(failures, "Saved sentences must pass code and stored support verification").toEqual([]);
  if (!fallback) expect(run.verify).toMatchObject({ status: "complete", pass: true });
}

// Discover all artifacts recursively, so adding a new file cannot evade these checks.
describe("Every saved-run artifact", () => {
  it("contains saved runs", () => expect(files.length).toBeGreaterThan(0));
  describe.each(files.map((file) => ({ file, name: relative(directory, file) })))(
    "$name",
    ({ file, name }) => {
      const match = /^(?:step-0-)?stage-([1-9])\.json$/.exec(name);
      const step0 = name.startsWith("step-0-");
      it("matches its typed artifact contract", () => {
        const data = read(file);
        if (name === "live-asos.json") liveSchema.parse(data);
        else if (name === "summary.json") summarySchema.parse(data);
        else {
          expect(match, "Unrecognized saved-run artifact").not.toBeNull();
          const run = (step0 ? extractSchema : runSchema).parse(data);
          expect(run.stage).toBe(Number(match![1]));
        }
      });
      it("passes current policy and evidence provenance", () => {
        const data = read(file);
        if (name === "live-asos.json") {
          checkLiveRun(data);
        } else if (name === "summary.json") {
          const summary = summarySchema.parse(data);
          expect(new Set(summary.stages.map((s) => s.stage)).size).toBe(summary.stages.length);
          expect(summary.stages.map((s) => s.stage).sort()).toEqual(
            files
              .filter((f) => /^stage-[1-9]\.json$/.test(relative(directory, f)))
              .map((f) => Number(/stage-(\d)/.exec(f)![1]))
              .sort(),
          );
          for (const row of summary.stages)
            checkRunPolicy(read(resolve(directory, `stage-${row.stage}.json`)));
        } else if (step0) {
          const run = extractSchema.parse(data);
          checkSources(run.extract.claims, run.stage);
          // Candidate proposals may be capped; only the derived ledger is authoritative.
          const claims: Claim[] = run.extract.claims.map((c, i) => ({
            ...c,
            id: `C-${i + 1}`,
            class: c.proposed_class,
            first_seen: null,
            superseded_by: null,
            contradiction_sides: null,
            history: [],
          }));
          const stage = reference(run.stage);
          const capped = applyPolicy(claims, stage.evidence, { now: stage.at });
          expect(capped).toHaveLength(claims.length);
          capped.forEach((c) => claimSchema.parse(c));
        } else checkRunPolicy(data);
      });
      it("validates verification status or ledger-only data", () => {
        const data = read(file);
        if (name === "live-asos.json") {
          checkLiveRun(data);
        } else if (name === "summary.json") {
          const summary = summarySchema.parse(data);
          for (const row of summary.stages) {
            const input = read(resolve(directory, `stage-${row.stage}.json`));
            const run = runSchema.parse(input);
            expect([row.status, row.pass]).toEqual([run.verify.status, run.verify.pass]);
            checkRunVerify(input);
          }
        } else if (step0) {
          // Extraction artifacts contain no sentences; any added draft field must be checked.
          expect(
            Object.keys(data as object).some((key) => ["draft", "drafts", "verify"].includes(key)),
            "Step-zero artifacts must not hide unchecked drafts",
          ).toBe(false);
        } else checkRunVerify(data);
      });
    },
  );
});

// Prove malformed data and forged passes fail without changing the checked-in files.
describe("Saved-run rejection controls", () => {
  const good = () => read(resolve(directory, "stage-2.json"));
  it("accepts a fully verified run", () => {
    checkRunPolicy(good());
    checkRunVerify(good());
  });
  it("rejects a missing required type field", () => {
    const input = good() as z.infer<typeof runSchema>;
    Reflect.deleteProperty(input.capped_ledger[0]!, "proposed_class");
    expect(() => checkRunPolicy(input)).toThrow();
  });
  it("rejects an invalid claim class", () => {
    const input = good() as z.infer<typeof runSchema>;
    Reflect.set(input.capped_ledger[0]!, "class", "CERTAIN");
    expect(() => checkRunPolicy(input)).toThrow();
  });
  it("rejects provenance that would require a cap", () => {
    const input = good() as z.infer<typeof runSchema>;
    const claim = input.capped_ledger.find((c) => c.class === "UNCONFIRMED")!;
    claim.class = "CONFIRMED";
    expect(() => checkRunPolicy(input)).toThrow();
  });
  it("rejects a missing citation even with a forged pass", () => {
    const input = good() as z.infer<typeof runSchema>;
    const sentence = input.drafts.executive.sections[0]!.sentences[0]!;
    sentence.claim_ids = ["C-MISSING"];
    sentence.response_ids = [];
    sentence.type = "fact";
    sentence.verify = { pass: true, reason: null };
    expect(() => checkRunVerify(input)).toThrow();
  });
  it("rejects an unsupported sentence despite a forged saved pass", () => {
    const input = good() as z.infer<typeof runSchema>;
    if (!("audiences" in input.verify)) throw new Error("Expected support reports");
    input.verify.audiences[0]!.support.results[0]!.supported = false;
    input.verify.audiences[0]!.support.results[0]!.problem = "Unsupported sentence";
    expect(() => checkRunVerify(input)).toThrow();
  });
});


describe("Failed and ledger-only artifact controls", () => {
  it.each([1, 3, 7])("accepts stage %i when explicitly marked failed", n => {
    const input = read(resolve(directory, `stage-${n}.json`));
    checkRunPolicy(input);
    checkRunVerify(input);
  });
  it("rejects failed status with a forged true pass", () => {
    const input = read(resolve(directory, "stage-3.json")) as z.infer<typeof runSchema>;
    input.verify.pass = true;
    expect(() => checkRunVerify(input)).toThrow();
  });
  it("rejects a golden mismatch relabelled complete", () => {
    const input = read(resolve(directory, "stage-3.json")) as z.infer<typeof runSchema>;
    input.verify.status = "complete";
    input.verify.pass = true;
    expect(() => checkRunVerify(input)).toThrow();
  });
  it("rejects an unexplained failure", () => {
    const input = read(resolve(directory, "stage-2.json")) as z.infer<typeof runSchema>;
    input.verify.status = "failed";
    input.verify.pass = false;
    expect(() => checkRunVerify(input)).toThrow();
  });
  it("accepts the ASOS ledger without drafts", () => {
    checkLiveRun(read(resolve(directory, "live-asos.json")));
  });
  it("rejects drafts injected into ASOS", () => {
    const input = read(resolve(directory, "live-asos.json")) as Record<string, unknown>;
    input['drafts'] = (read(resolve(directory, "stage-2.json")) as z.infer<typeof runSchema>).drafts;
    expect(() => checkLiveRun(input)).toThrow();
  });
  it("rejects unknown ASOS evidence citations", () => {
    const input = read(resolve(directory, "live-asos.json")) as z.infer<typeof liveSchema>;
    input.capped_ledger[0]!.source_ids = ["A-MISSING"];
    expect(() => checkLiveRun(input)).toThrow();
  });
  it("rejects an ASOS class that bypasses policy", () => {
    const input = read(resolve(directory, "live-asos.json")) as z.infer<typeof liveSchema>;
    input.capped_ledger.find(c => c.class === "UNCONFIRMED")!.class = "CONFIRMED";
    expect(() => checkLiveRun(input)).toThrow();
  });
});
