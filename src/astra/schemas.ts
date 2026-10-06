import { z } from "zod";

// Client-safe schemas for the four GPT-6 Astra steps. No bounds or patterns:
// limits are enforced in code after parsing.
export const classes = ["CONFIRMED", "REPORTED", "CONFLICTING", "UNCONFIRMED", "UNKNOWN"] as const;
const cls = z.enum(classes);
const unknownKind = z.enum(["cause", "recovery", "scope", "data"]).nullable();
const estimate = z
  .object({ speaker: z.string(), said: z.string(), at: z.string(), source_id: z.string() })
  .nullable();

export const candidateSchema = z.object({
  statement: z.string(),
  subject: z.string().nullable(),
  unknown_kind: unknownKind,
  region: z.string().nullable(),
  proposed_class: cls,
  source_ids: z.array(z.string()),
  provider_wording: z.string().nullable(),
  settled_by: z.string().nullable(),
  estimate,
});
export const extractSchema = z.object({ claims: z.array(candidateSchema) });

export const ledgerClaimSchema = z.object({
  id: z.string(),
  statement: z.string(),
  subject: z.string().nullable(),
  unknown_kind: unknownKind,
  class: cls,
  proposed_class: cls,
  source_ids: z.array(z.string()),
  provider_wording: z.string().nullable(),
  settled_by: z.string().nullable(),
  estimate,
  first_seen: z.string().nullable(),
  superseded_by: z.string().nullable(),
  contradiction_sides: z
    .array(z.object({ label: z.string(), source_ids: z.array(z.string()) }))
    .nullable(),
  history: z.array(
    z.object({ stage: z.number().int(), class: cls, statement: z.string(), because: z.array(z.string()) }),
  ),
});
export const changeSchema = z.object({
  claim_id: z.string(),
  change: z.enum(["NEW", "UPGRADED", "DOWNGRADED", "UPDATED", "MERGED", "CONFLICT"]),
  from: z.string().nullable(),
  to: z.string().nullable(),
  because: z.array(z.string()),
});
export const reconcileSchema = z.object({
  claims: z.array(ledgerClaimSchema),
  changes: z.array(changeSchema),
});

export const communicateSchema = z.object({
  sections: z.array(
    z.object({
      heading: z.string(),
      sentences: z.array(
        z.object({
          text: z.string(),
          type: z.enum(["fact", "commitment"]),
          claim_ids: z.array(z.string()),
          response_ids: z.array(z.string()),
        }),
      ),
    }),
  ),
});

export const supportSchema = z.object({
  results: z.array(
    z.object({ sentence_index: z.number().int(), supported: z.boolean(), problem: z.string().nullable() }),
  ),
});

export type StepTiming = { step: string; audience: string | null; attempts: number; seconds: number };
export type StepFailure = { ok: false; error: string; status: number | null };
