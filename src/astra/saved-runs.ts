import type { Change, Claim, Draft } from "@/data/replay/types";
import s1 from "@/data/saved-runs/stage-1.json";
import s2 from "@/data/saved-runs/stage-2.json";
import s3 from "@/data/saved-runs/stage-3.json";
import s4 from "@/data/saved-runs/stage-4.json";
import s5 from "@/data/saved-runs/stage-5.json";
import s6 from "@/data/saved-runs/stage-6.json";
import s7 from "@/data/saved-runs/stage-7.json";
import s8 from "@/data/saved-runs/stage-8.json";
import s9 from "@/data/saved-runs/stage-9.json";

export type RunTiming = { step: string; seconds: number; audience?: string | null; attempts?: number };
export type SavedRun = {
  stage: number;
  generated_at: string;
  extractCount: number | null;
  ledger: Claim[] | null;
  changes: Change[];
  drafts: { executive: Draft | null; engineering: Draft | null; customer: { confirmed_only: Draft | null; early_incident: Draft | null } } | null;
  verifyPass: boolean;
  verifyStatus: string;
  verifyReason: string | null;
  timings: RunTiming[];
  seconds: number;
  error: string | null;
};

function read(raw: any): SavedRun {
  const timings: RunTiming[] = (raw.timings ?? []).map((t: any) => ({ step: t.step, seconds: Number(t.seconds) || 0, audience: t.audience ?? null, attempts: t.attempt }));
  return {
    stage: raw.stage,
    generated_at: raw.generated_at,
    extractCount: raw.extract?.claims?.length ?? null,
    ledger: raw.capped_ledger ?? null,
    changes: raw.reconcile?.changes ?? [],
    drafts: raw.drafts ?? null,
    verifyPass: raw.verify?.pass === true,
    verifyStatus: raw.verify?.status ?? "pending",
    verifyReason: raw.verify?.reason ?? (raw.verify?.audiences ?? []).filter((a: any) => !a.pass).map((a: any) => `${a.audience}: ${a.error ?? `${a.excluded ?? "?"} sentence(s) excluded`}`).join(" · ") ?? null,
    timings,
    seconds: timings.reduce((sum, t) => sum + t.seconds, 0),
    error: raw.error ?? null,
  };
}

export const savedRuns: SavedRun[] = [s1, s2, s3, s4, s5, s6, s7, s8, s9].map(read);

/** Sum seconds per pipeline step name prefix. */
export function stepSeconds(timings: RunTiming[], step: string) {
  return timings.filter((t) => t.step === step || t.step.startsWith(`${step}_`)).reduce((s, t) => s + t.seconds, 0);
}
