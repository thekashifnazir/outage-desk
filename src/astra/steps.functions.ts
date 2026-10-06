import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Claim, Draft } from "@/data/replay/types";
import { candidateSchema, communicateSchema, ledgerClaimSchema, type StepFailure } from "./schemas";

const stageNo = z.number().int().min(1).max(8);
const ledger = z.array(ledgerClaimSchema).max(200);
const draftInput = z.object({
  audience: z.enum(["executive", "engineering", "customer"]),
  policy_mode: z.enum(["confirmed_only", "early_incident"]).nullable(),
  as_of: z.string(),
  source: z.enum(["reference", "astra_saved", "astra_live"]),
  generated_at: z.string().nullable(),
  sections: communicateSchema.shape.sections,
});

async function guard<T>(step: string, work: () => Promise<T>): Promise<({ ok: true } & T) | StepFailure> {
  try {
    return { ok: true, ...(await work()) };
  } catch (error) {
    const e = error as { message?: string; status?: number | null };
    console.error(`${step} failed`, e?.message);
    return { ok: false, error: `${step} ${e?.message ?? "failed"}`, status: e?.status ?? null };
  }
}

export const astraExtract = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ stage: stageNo }).parse(d))
  .handler(async ({ data }) => {
    const { runExtract } = await import("./steps.server");
    return guard("Extract", () => runExtract(data.stage));
  });

export const astraReconcile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ stage: stageNo, previous: ledger, candidates: z.array(candidateSchema).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { runReconcile } = await import("./steps.server");
    return guard("Reconcile", () => runReconcile(data.stage, data.previous as Claim[], data.candidates));
  });

export const astraCommunicate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        stage: stageNo,
        ledger,
        audience: z.enum(["executive", "engineering", "customer"]),
        mode: z.enum(["confirmed_only", "early_incident"]).nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { runCommunicate } = await import("./steps.server");
    return guard("Communicate", () => runCommunicate(data.stage, data.ledger as Claim[], data.audience, data.mode));
  });

export const astraVerify = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ stage: stageNo, ledger, drafts: z.array(draftInput).max(4) }).parse(d))
  .handler(async ({ data }) => {
    const { runVerify } = await import("./steps.server");
    return guard("Verify", () =>
      runVerify(data.stage, data.ledger as Claim[], data.drafts.map((d) => ({ ...d, sections: d.sections.map((s) => ({ ...s, sentences: s.sentences.map((x) => ({ ...x, verify: null })) })) })) as Draft[]),
    );
  });
