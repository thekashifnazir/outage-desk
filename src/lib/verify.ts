import type { Claim, Draft, Sentence, Stage } from "../data/replay/types";

export interface VerifyContext {
  stage: Stage;
  audience: Draft["audience"];
  policy_mode: Draft["policy_mode"];
}
export interface SentenceVerification {
  pass: boolean;
  reason: string | null;
  notes: string[];
}

function normalized(text: string): string {
  return text.toLowerCase().replace(/[’‘]/g, "'");
}

const reportedQualifier =
  /\b(?:reports?|reported|not yet confirmed|not confirmed|unverified|conflicts?|contradicts?|contradicting|disagree|disregard)\b/;
const unknownQualifier =
  /\b(?:unknown|not yet known|don't yet know|no eta|hasn't said|undisclosed)\b/;

function attributedEstimate(
  text: string,
  claims: readonly Claim[],
  audience: Draft["audience"],
): boolean {
  return claims.some((claim) => {
    if (!claim.estimate) return false;
    const speaker = normalized(claim.estimate.speaker).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const named = new RegExp(`\\b${speaker}\\b[^.!?;]*\\b(?:expects?|estimates?)\\b`).test(text);
    const customerProvider =
      audience === "customer" &&
      /\bour (?:cloud )?provider\b[^.!?;]*\b(?:expects?|estimates?)\b/.test(text);
    return named || customerProvider;
  });
}

function hasEta(text: string): boolean {
  // Negative statements ("no ETA") and historical impact windows are not forecasts.
  const duration =
    /\b(?:within|in less than|in under|in)\s+(?:an?|one|the|\d+)\s+(?:hour|minute|day|week)s?\b/;
  const forecastClock =
    /\b(?:will|expect|expects|next update|bridge update|update you|update by)\b[^.!?;]*\b(?:by|at)\s+\d{1,2}:\d{2}\b/;
  return duration.test(text) || forecastClock.test(text);
}

/** Deterministic structure, citation and publication-policy checks only.
 * Semantic sentence support still belongs to the Astra support check. */
export function verifySentence(sentence: Sentence, context: VerifyContext): SentenceVerification {
  const { stage, audience, policy_mode } = context;
  const fail = (rule: string, reason: string): SentenceVerification => ({
    pass: false,
    reason: `${rule}: ${reason}`,
    notes: [],
  });
  const text = normalized(sentence.text);
  const claims = sentence.claim_ids.map((id) => stage.claims.find((claim) => claim.id === id));
  const responses = sentence.response_ids.map((id) =>
    stage.response_items.find((item) => item.id === id),
  );
  if (sentence.type === "fact") {
    if (!claims.length || responses.length)
      return fail("R1", "A fact must cite claims only, with at least one claim.");
  } else if (sentence.type === "commitment") {
    if (!responses.length || claims.length)
      return fail(
        "R1",
        "A commitment must cite response items only, with at least one response item.",
      );
  } else return fail("R1", "Unknown sentence type.");
  if (claims.some((claim) => !claim) || responses.some((item) => !item))
    return fail("R1", "A cited id does not exist.");
  if (responses.some((item) => item!.type === "next_update" && item!.replaced_by))
    return fail("R1", "A cited next update has been replaced.");
  const cited = claims as Claim[];
  if (audience === "customer") {
    for (const claim of cited) {
      if (claim.class === "UNCONFIRMED" || claim.class === "CONFLICTING")
        return fail("R2", `${claim.class} claims cannot appear in customer copy.`);
      if (
        claim.class === "REPORTED" &&
        (policy_mode !== "early_incident" || !reportedQualifier.test(text))
      )
        return fail("R2", "Reported customer facts require Early incident mode and a qualifier.");
      if (
        claim.class === "UNKNOWN" &&
        claim.unknown_kind !== "cause" &&
        claim.unknown_kind !== "recovery"
      )
        return fail("R2", "Customer unknowns are limited to cause and recovery time.");
    }
  }
  const attributed = attributedEstimate(text, cited, audience);
  if (hasEta(text)) {
    const update =
      sentence.type === "commitment" &&
      responses.some((item) => item!.type === "next_update") &&
      /\bupdate\b/.test(text) &&
      !/\b(?:will|we'll|we expect)\s+(?:have\b[^.!?;]*\bfixed\b|be back|(?:be )?restored|restore|fix|recover)\b/.test(
        text,
      );
    if (!(sentence.type === "fact" && attributed) && !update)
      return fail(
        "R4",
        "ETA requires an attributed provider estimate or a cited next-update commitment.",
      );
  }
  for (const claim of cited) {
    if (claim.class === "UNKNOWN" && !unknownQualifier.test(text) && !attributed)
      return fail("R3", "An unknown claim needs an uncertainty qualifier or attributed estimate.");
    if (
      audience !== "customer" &&
      ["REPORTED", "CONFLICTING", "UNCONFIRMED"].includes(claim.class) &&
      !reportedQualifier.test(text)
    )
      return fail("R3", "A non-confirmed internal fact needs a qualifier.");
  }
  if (audience === "customer" && /\b(?:google|gcp)\b/.test(text)) {
    const decision = stage.response_items.find((item) => item.id === "R-12");
    const wording = normalized(decision?.decision ?? "");
    const reportOnly = /incident report/.test(wording);
    const approved =
      decision?.status === "decided" &&
      !!decision.decided_at &&
      (reportOnly ? stage.stage === 9 : /(?:name google|naming google|approved)/.test(wording));
    if (!approved)
      return fail("R5", "Google naming has not been approved for this customer update.");
  }
  if (stage.stage !== 9 && cited.some((claim) => claim.superseded_by))
    return fail("R6", "Live drafts cannot cite superseded claims.");
  return {
    pass: true,
    reason: null,
    notes:
      audience === "customer" && cited.some((claim) => claim.id === "C-010" || claim.id === "C-011")
        ? ["internal detail"]
        : [],
  };
}

export function verifyDraft(draft: Draft, stage: Stage) {
  let verified = 0;
  let total = 0;
  const checked: Draft = {
    ...draft,
    sections: draft.sections.map((section) => ({
      ...section,
      sentences: section.sentences.map((sentence) => {
        total++;
        const result = verifySentence(sentence, {
          stage,
          audience: draft.audience,
          policy_mode: draft.policy_mode,
        });
        // A model "pass" cannot bypass code; a model support failure is retained.
        const verify = !result.pass
          ? { pass: false, reason: result.reason }
          : sentence.verify?.pass === false
            ? sentence.verify
            : { pass: true, reason: null };
        if (verify.pass) verified++;
        return { ...sentence, verify };
      }),
    })),
  };
  const word_count = draft.sections
    .flatMap((section) => section.sentences)
    .reduce((count, sentence) => count + (sentence.text.trim().match(/\S+/g)?.length ?? 0), 0);
  const word_limit =
    draft.audience === "customer"
      ? stage.stage === 9
        ? 250
        : 70
      : draft.audience === "executive"
        ? 120
        : 140;
  return {
    draft: checked,
    pass: verified === total,
    total,
    verified,
    excluded: total - verified,
    word_count,
    word_limit,
    over_limit: word_count > word_limit,
  };
}

/** Only copy sentences that have an explicit combined verification pass. */
export function copyVerifiedText(draft: Draft): string {
  return draft.sections
    .flatMap((section) =>
      section.sentences
        .filter((sentence) => sentence.verify?.pass === true)
        .map((sentence) => sentence.text),
    )
    .join("\n");
}
