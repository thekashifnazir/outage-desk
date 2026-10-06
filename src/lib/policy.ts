import type { Claim, ClaimClass, Evidence } from "../data/replay/types";

export interface PolicyOptions {
  now?: string;
  /** Source id -> original author/account or original post. Reposts share a key.
   * Different authors in the same thread must have different keys.
   * The evidence collector supplies this; URLs alone do not prove independence. */
  independent_sources?: Readonly<Record<string, string>>;
}

/** Replay dates default to 12 June 2025. A date without a clock is end of day. */
export function replayTime(value: string): number {
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return Date.parse(value);
  const match = /^(?:(12|13) Jun(?:\s|$))?(?:(\d{2}):(\d{2}))?$/.exec(value);
  if (!match || (!match[1] && !match[2])) return NaN;
  const hour = match[2] ? Number(match[2]) : 23;
  const minute = match[3] ? Number(match[3]) : 59;
  if (hour > 23 || minute > 59) return NaN;
  return Date.UTC(2025, 5, Number(match[1] ?? 12), hour, minute, match[2] ? 0 : 59);
}

export function filterEvidenceAt(evidence: readonly Evidence[], now: string): Evidence[] {
  const cutoff = replayTime(now);
  return evidence.filter((source) => replayTime(source.at) <= cutoff);
}

export function filterClaimsAt(
  claims: readonly Claim[],
  evidence: readonly Evidence[],
  now: string,
): Claim[] {
  const available = new Set(filterEvidenceAt(evidence, now).map((s) => s.id));
  return claims.flatMap((claim) => {
    const source_ids = claim.source_ids.filter((id) => available.has(id));
    if (claim.source_ids.length && !source_ids.length) return [];
    return [
      {
        ...claim,
        source_ids,
        estimate: claim.estimate && available.has(claim.estimate.source_id) ? claim.estimate : null,
        contradiction_sides:
          claim.contradiction_sides?.map((side) => ({
            ...side,
            source_ids: side.source_ids.filter((id) => available.has(id)),
          })) ?? null,
      },
    ];
  });
}

function matchingProvider(
  subject: string | null,
  evidence: readonly Evidence[],
): string | undefined {
  if (!subject) return undefined;
  return [...new Set(["Northwind", ...evidence.flatMap((s) => (s.provider ? [s.provider] : []))])]
    .filter((name) => subject.toLowerCase().startsWith(name.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0]
    ?.toLowerCase();
}

function ceiling(
  subject: string | null,
  sources: readonly Evidence[],
  context: readonly Evidence[],
  options: PolicyOptions,
): ClaimClass {
  if (!sources.length) return "UNKNOWN";
  const matching = matchingProvider(subject, context);
  let reported = false;
  const independent = new Set<string>();
  for (const source of sources) {
    if (source.kind === "internal") {
      if (matching === "northwind") return "CONFIRMED";
      continue;
    }
    if (source.kind === "provider_official" || source.kind === "downstream_company") {
      if (matching && source.provider?.toLowerCase() === matching) {
        if (
          source.kind === "downstream_company" ||
          (source.channel !== "social" && source.channel !== "support")
        )
          return "CONFIRMED";
      }
      reported = true;
    } else {
      if (source.kind === "monitor" || source.kind === "press") reported = true;
      independent.add(options.independent_sources?.[source.id] ?? source.id);
    }
  }
  return reported || independent.size >= 2 ? "REPORTED" : "UNCONFIRMED";
}

const rank: Record<string, number> = { UNKNOWN: 0, UNCONFIRMED: 1, REPORTED: 2, CONFIRMED: 3 };

/** Model classes are proposals. Provenance can lower them, never raise them. */
export function capClaim(
  claim: Claim,
  evidence: readonly Evidence[],
  options: PolicyOptions = {},
): Claim {
  const context = options.now ? filterEvidenceAt(evidence, options.now) : [...evidence];
  const lookup = new Map(context.map((s) => [s.id, s]));
  const sourcesFor = (ids: readonly string[]) =>
    [...new Set(ids)].flatMap((id) => (lookup.get(id) ? [lookup.get(id)!] : []));
  const sources = sourcesFor(claim.source_ids);
  const allowed = ceiling(claim.subject, sources, context, options);
  let result: ClaimClass;
  if (!sources.length) result = "UNKNOWN";
  else if (claim.proposed_class === "CONFLICTING") {
    const sides = claim.contradiction_sides ?? [];
    const credible = sides.filter(
      (side) =>
        (rank[
          ceiling(
            claim.subject,
            sourcesFor(side.source_ids.filter((id) => claim.source_ids.includes(id))),
            context,
            options,
          )
        ] ?? 0) >= 2,
    );
    const disjoint =
      credible.length >= 2 &&
      credible.some((a, index) =>
        credible
          .slice(index + 1)
          .some((b) => !a.source_ids.some((id) => b.source_ids.includes(id))),
      );
    result = disjoint ? "CONFLICTING" : allowed;
  } else {
    result =
      (rank[claim.proposed_class] ?? 0) <= (rank[allowed] ?? 0) ? claim.proposed_class : allowed;
  }
  return {
    ...claim,
    class: result,
    source_ids: sources.map((s) => s.id),
    contradiction_sides: result === "CONFLICTING" ? claim.contradiction_sides : null,
  };
}

export function applyPolicy(
  claims: readonly Claim[],
  evidence: readonly Evidence[],
  options: PolicyOptions = {},
): Claim[] {
  const current = options.now ? filterClaimsAt(claims, evidence, options.now) : claims;
  return current.map((claim) => capClaim(claim, evidence, options));
}

/** Reconcile has identified contradictory statements. This deterministic step
 * preserves the channel of record; it does not infer contradictions from prose. */
export function applyChannelOfRecord(
  existing: Claim,
  incoming: Claim,
  evidence: readonly Evidence[],
): {
  existing: Claim;
  incoming: Claim | null;
  note: string | null;
} {
  const lookup = new Map(evidence.map((s) => [s.id, s]));
  const ownStatus = (claim: Claim) =>
    claim.source_ids.flatMap((id) => {
      const source = lookup.get(id);
      return source?.kind === "provider_official" &&
        source.channel === "status_page" &&
        source.provider?.toLowerCase() === matchingProvider(claim.subject, evidence)
        ? [source]
        : [];
    });
  const recorded = ownStatus(existing);
  const next = ownStatus(incoming);
  const newer = next.some((n) =>
    recorded.some((r) => n.provider === r.provider && replayTime(n.at) > replayTime(r.at)),
  );
  if (newer)
    return {
      existing: {
        ...capClaim(incoming, evidence),
        id: existing.id,
        history: [...existing.history, ...incoming.history],
      },
      incoming: null,
      note: null,
    };
  const related = incoming.source_ids.some((id) => {
    const source = lookup.get(id);
    return (
      source?.kind === "provider_official" &&
      source.channel !== "status_page" &&
      recorded.some(
        (r) =>
          r.provider &&
          source.provider &&
          (r.provider.toLowerCase().startsWith(source.provider.toLowerCase()) ||
            source.provider.toLowerCase().startsWith(r.provider.toLowerCase())),
      )
    );
  });
  if (recorded.length && related) {
    return {
      existing,
      incoming: {
        ...incoming,
        class: "CONFLICTING",
        contradiction_sides: [
          { label: "Status page", source_ids: recorded.map((s) => s.id) },
          { label: "Other provider channel", source_ids: incoming.source_ids },
        ],
      },
      note: "contradicts the provider's status page",
    };
  }
  return { existing, incoming: capClaim(incoming, evidence), note: null };
}
