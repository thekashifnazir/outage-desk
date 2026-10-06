import { describe, expect, it } from "vitest";
import type { Claim, ClaimClass, Evidence } from "../data/replay/types";
import { stage1 } from "../data/replay/stage-1";
import { stage3 } from "../data/replay/stage-3";
import { stage6 } from "../data/replay/stage-6";
import { capClaim, filterEvidenceAt, filterClaimsAt, applyChannelOfRecord } from "./policy";

const evidence = stage6.evidence;
const source = (id: string) => evidence.find((s) => s.id === id)!;
const claim = (subject: string, sources: string[], proposed: ClaimClass = "CONFIRMED"): Claim => ({
  ...stage1.claims[0]!,
  subject,
  source_ids: sources,
  class: proposed,
  proposed_class: proposed,
  contradiction_sides: null,
});
const capCases: [string, string, string[], ClaimClass, ClaimClass][] = [
  ["T1.1", "Google Cloud", ["S7"], "CONFIRMED", "CONFIRMED"],
  ["T1.2", "Northwind", ["N1"], "CONFIRMED", "CONFIRMED"],
  ["T1.3", "Google Cloud", ["S3", "S4"], "CONFIRMED", "REPORTED"],
  ["T1.4", "Google Cloud", ["S5"], "CONFIRMED", "REPORTED"],
  ["T1.5", "Google Cloud", ["M1"], "REPORTED", "REPORTED"],
  ["T1.6", "Cloudflare", ["S10"], "REPORTED", "UNCONFIRMED"],
  ["T1.7", "AWS", ["S11"], "REPORTED", "UNCONFIRMED"],
  ["T1.8", "Google Cloud", ["N4"], "CONFIRMED", "UNCONFIRMED"],
  ["T1.9", "Google Cloud", ["S1", "S13"], "UNCONFIRMED", "UNCONFIRMED"],
  ["T1.10", "Root cause", [], "CONFIRMED", "UNKNOWN"],
  ["T1.11", "Supabase", ["S12"], "CONFIRMED", "CONFIRMED"],
  ["T1.12", "Google Cloud", ["S19"], "CONFIRMED", "REPORTED"],
  ["T1.13", "Cloudflare", ["S12"], "CONFIRMED", "REPORTED"],
  ["T1.14", "Cloudflare Access", ["S8", "S9"], "CONFIRMED", "CONFIRMED"],
  ["T1.15", "Northwind customer app", ["N1"], "CONFIRMED", "CONFIRMED"],
  ["T1.16", "AWS", ["S3", "S4"], "REPORTED", "REPORTED"],
  ["T1.18", "Google", ["S18"], "CONFIRMED", "REPORTED"],
  ["T1.19", "Google Cloud", ["S7", "S18"], "CONFIRMED", "CONFIRMED"],
];
describe("T1 provenance cap", () => {
  it.each(capCases)("%s", (_, subject, ids, proposed, expected) => {
    expect(capClaim(claim(subject, ids, proposed), evidence).class).toBe(expected);
  });
  it("T1.17 longest provider match prevents Google confirming Google Cloud", () => {
    const parent: Evidence = { ...source("S18"), id: "parent", channel: "status_page" };
    expect(capClaim(claim("google cloud", ["parent"]), [...evidence, parent]).class).toBe(
      "REPORTED",
    );
  });
  it("T1.16 reposts are one independent source, but different authors in one thread count twice", () => {
    const posts = ["a", "b"].map((id) => ({ ...source("S11"), id }));
    expect(
      capClaim(claim("AWS", ["a", "b"], "REPORTED"), posts, {
        independent_sources: { a: "original", b: "original" },
      }).class,
    ).toBe("UNCONFIRMED");
    expect(
      capClaim(claim("AWS", ["a", "b"], "REPORTED"), posts, {
        independent_sources: { a: "author-a", b: "author-b" },
      }).class,
    ).toBe("REPORTED");
  });
  it("support channels are capped like social channels", () => {
    expect(
      capClaim(claim("Google", ["S18"]), [{ ...source("S18"), channel: "support" }]).class,
    ).toBe("REPORTED");
  });
  it("missing ids and duplicate citations cannot confirm a claim", () => {
    expect(capClaim(claim("Google Cloud", ["missing"]), evidence).class).toBe("UNKNOWN");
    expect(capClaim(claim("AWS", ["S11", "S11"]), evidence).class).toBe("UNCONFIRMED");
  });
});
describe("T1-C credible contradictions", () => {
  it("T1.C1 keeps both credible sides", () => {
    const c = stage3.claims.find((c) => c.id === "C-005")!;
    const result = capClaim(c, stage3.evidence);
    expect(result.class).toBe("CONFLICTING");
    expect(result.contradiction_sides).toEqual(c.contradiction_sides);
  });
  it("T1.C2 a rumour cannot downgrade provider confirmation to conflicting", () => {
    const c = {
      ...claim("Google Cloud", ["S7", "S11"], "CONFLICTING"),
      contradiction_sides: [
        { label: "Provider", source_ids: ["S7"] },
        { label: "Rumour", source_ids: ["S11"] },
      ],
    };
    expect(capClaim(c, evidence).class).toBe("CONFIRMED");
  });
  it("T1.C3 a lone AWS rumour has nothing credible to conflict with", () => {
    expect(capClaim(claim("AWS", ["S11"], "CONFLICTING"), evidence).class).toBe("UNCONFIRMED");
  });
});
describe("T2 channel of record", () => {
  it("T2.1 support denial preserves the status-page incident", () => {
    const existing = claim("Google Cloud", ["S7"]);
    const incoming = { ...claim("Google", ["S18"]), id: "C-021" };
    const result = applyChannelOfRecord(existing, incoming, evidence);
    expect(result.existing).toEqual(existing);
    expect(result.incoming!.class).toBe("CONFLICTING");
    expect(result.note).toBe("contradicts the provider's status page");
  });
  it("T2.2 newer status-page evidence updates the existing claim", () => {
    const old = { ...claim("Google Cloud", ["S2"]), id: "C-005" };
    const incoming = { ...claim("Google Cloud", ["S7"]), statement: "Incident declared" };
    const result = applyChannelOfRecord(old, incoming, evidence);
    expect(result.existing).toMatchObject({
      id: "C-005",
      statement: "Incident declared",
      class: "CONFIRMED",
    });
    expect(result.incoming).toBeNull();
  });
  it.each(["social", "blog"] as const)(
    "T2.3 Cloudflare %s denial cannot erase the incident",
    (channel) => {
      const press = { ...source("S8"), id: "press", at: "19:29", channel };
      const existing = claim("Cloudflare", ["S8"]);
      const result = applyChannelOfRecord(existing, claim("Cloudflare", ["press"]), [
        ...evidence,
        press,
      ]);
      expect(result.existing).toEqual(existing);
      expect(result.incoming!.class).toBe("CONFLICTING");
    },
  );
});
describe("T3 late evidence", () => {
  const future = { ...source("S11"), id: "future", at: "18:53" };
  it("T3.1 uses evidence at 18:48 by 18:51", () =>
    expect(filterEvidenceAt([source("S11")], "18:51")).toHaveLength(1));
  it("T3.2 excludes future evidence from rendering, AI input and caps", () => {
    expect(filterEvidenceAt([future], "18:51")).toEqual([]);
    expect(capClaim(claim("AWS", ["future"]), [future], { now: "18:51" }).class).toBe("UNKNOWN");
  });
  it("T3.3 drops claims whose only source is in the future", () => {
    expect(filterClaimsAt([claim("AWS", ["future"])], [future], "18:51")).toEqual([]);
  });
  it("retains genuinely unknown claims and prunes future citations from partially sourced claims", () => {
    const unknown = claim("Root cause", [], "UNKNOWN");
    expect(
      filterClaimsAt(
        [unknown, claim("AWS", ["S11", "future"])],
        [source("S11"), future],
        "18:51",
      ).map((c) => c.source_ids),
    ).toEqual([[], ["S11"]]);
  });
  it("handles replay dates across midnight and rejects malformed times", () => {
    const nextDay = { ...source("S7"), at: "13 Jun 01:27" };
    expect(filterEvidenceAt([nextDay], "21:31")).toEqual([]);
    expect(filterEvidenceAt([nextDay], "13 Jun")).toHaveLength(1);
    expect(filterEvidenceAt([{ ...nextDay, at: "bad" }], "13 Jun")).toEqual([]);
  });
});
