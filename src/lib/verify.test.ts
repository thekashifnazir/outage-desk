import { describe, expect, it } from "vitest";
import type { Draft, Sentence, Stage } from "../data/replay/types";
import { stage1 } from "../data/replay/stage-1";
import { stage2 } from "../data/replay/stage-2";
import { stage4 } from "../data/replay/stage-4";
import { stage6 } from "../data/replay/stage-6";
import { stage3 } from "../data/replay/stage-3";
import { stage5 } from "../data/replay/stage-5";
import { stage7 } from "../data/replay/stage-7";
import { stage8 } from "../data/replay/stage-8";
import { stage9 } from "../data/replay/stage-9";
import { verifySentence, verifyDraft, copyVerifiedText } from "./verify";

const sentence = (
  text: string,
  claims: string[] = [],
  responses: string[] = [],
  type: Sentence["type"] = responses.length && !claims.length ? "commitment" : "fact",
): Sentence => ({ text, type, claim_ids: claims, response_ids: responses, verify: null });
type Case = {
  id: string;
  text: string;
  claims?: string[];
  responses?: string[];
  type?: Sentence["type"];
  stage?: Stage;
  audience?: Draft["audience"];
  mode?: Draft["policy_mode"];
  pass: boolean;
  rule?: string;
};
const cases: Case[] = [
  { id: "T4.1", text: "Google Cloud has confirmed an incident.", pass: false, rule: "R1" },
  {
    id: "T4.2",
    text: "Next update at 19:20.",
    claims: ["C-005"],
    type: "commitment",
    pass: false,
    rule: "R1",
  },
  {
    id: "T4.3",
    text: "Google confirmed at 18:46 and we'll update at 19:20.",
    claims: ["C-005"],
    responses: ["R-15"],
    pass: false,
    rule: "R1",
  },
  { id: "T4.4", text: "Next update at 18:30.", responses: ["R-10"], pass: false, rule: "R1" },
  { id: "T4.5", text: "…", claims: ["C-099"], pass: false, rule: "R1" },
  {
    id: "T4.6",
    text: "Reports indicate wider cloud problems.",
    claims: ["C-002"],
    stage: stage3,
    audience: "customer",
    pass: false,
    rule: "R2",
  },
  {
    id: "T4.7",
    text: "Reports indicate wider cloud problems, not yet confirmed.",
    claims: ["C-002"],
    stage: stage3,
    audience: "customer",
    mode: "early_incident",
    pass: true,
  },
  {
    id: "T4.8",
    text: "Our cloud provider's APIs are failing worldwide.",
    claims: ["C-002"],
    stage: stage3,
    audience: "customer",
    mode: "early_incident",
    pass: false,
    rule: "R2",
  },
  {
    id: "T4.9",
    text: "Some reports link this to a Cloudflare issue.",
    claims: ["C-012"],
    audience: "customer",
    pass: false,
    rule: "R2",
  },
  {
    id: "T4.10",
    text: "Google's status page and reports disagree.",
    claims: ["C-005"],
    stage: stage3,
    audience: "customer",
    pass: false,
    rule: "R2",
  },
  {
    id: "T4.11",
    text: "We don't yet know which regions are affected.",
    claims: ["C-016"],
    audience: "customer",
    pass: false,
    rule: "R2",
  },
  {
    id: "T4.12",
    text: "The cause and recovery time are not yet known.",
    claims: ["C-003", "C-004"],
    audience: "customer",
    pass: true,
  },
  {
    id: "T4.13",
    text: "A Cloudflare account manager privately links the two outages; unverified.",
    claims: ["C-012"],
    pass: true,
  },
  {
    id: "T4.14",
    text: "Cloudflare's outage was caused by Google's.",
    claims: ["C-012"],
    pass: false,
    rule: "R3",
  },
  {
    id: "T4.15",
    text: "Affected regions.",
    claims: ["C-016"],
    audience: "engineering",
    pass: false,
    rule: "R3",
  },
  {
    id: "T4.16",
    text: "Service will be restored by 19:30.",
    claims: ["C-005"],
    pass: false,
    rule: "R4",
  },
  {
    id: "T4.17",
    text: "Google expects recovery to complete in less than an hour.",
    claims: ["C-004"],
    stage: stage7,
    pass: true,
  },
  { id: "T4.18", text: "We'll update you by 19:20 UTC.", responses: ["R-15"], pass: true },
  {
    id: "T4.19",
    text: "We'll have this fixed within the hour.",
    responses: ["R-8"],
    pass: false,
    rule: "R4",
  },
  {
    id: "T4.20",
    text: "Google Cloud has confirmed an incident.",
    claims: ["C-005"],
    audience: "customer",
    pass: false,
    rule: "R5",
  },
  {
    id: "T4.21",
    text: "Our cloud provider, Google Cloud, had a global outage in its API management system.",
    claims: ["C-005", "C-003"],
    stage: stage9,
    audience: "customer",
    pass: true,
  },
  {
    id: "T4.22",
    text: "Cloudflare, which our staff use, was also affected.",
    claims: ["C-011", "C-010"],
    audience: "customer",
    pass: true,
  },
  {
    id: "T4.24",
    text: "Staff login runs on Cloudflare Access, which failed at the same time.",
    claims: ["C-010", "C-011"],
    stage: stage9,
    pass: true,
  },
  {
    id: "T4.25",
    text: "Google Cloud has found the cause.",
    claims: ["C-017"],
    stage: stage5,
    audience: "customer",
    pass: false,
    rule: "R5",
  },
  {
    id: "T4.26",
    text: "Recovery will complete in less than an hour.",
    claims: ["C-004"],
    stage: stage7,
    pass: false,
    rule: "R4",
  },
  {
    id: "T4.27",
    text: "Others report the same Google API errors; not yet confirmed.",
    claims: ["C-002"],
    stage: stage3,
    pass: true,
  },
  {
    id: "T4.28",
    text: "Google's support account says there are no disruptions; disregard it.",
    claims: ["C-021"],
    stage: stage5,
    pass: true,
  },
  {
    id: "T4.29",
    text: "Google says there are no known disruptions.",
    claims: ["C-021"],
    stage: stage5,
    pass: false,
    rule: "R3",
  },
  {
    id: "T4.30",
    text: "Customers can't log in.",
    claims: ["C-001"],
    stage: stage8,
    audience: "customer",
    pass: false,
    rule: "R6",
  },
  {
    id: "T5.3",
    text: "Failed attempts do not charge your card…",
    audience: "customer",
    pass: false,
    rule: "R1",
  },
  {
    id: "T5.4",
    text: "We expect to be back within the hour.",
    claims: ["C-001"],
    audience: "customer",
    pass: false,
    rule: "R4",
  },
];
describe("T4 and code-only T5 verification", () => {
  it.each(cases)("$id", (c) => {
    const result = verifySentence(sentence(c.text, c.claims, c.responses, c.type), {
      stage: c.stage ?? stage4,
      audience: c.audience ?? "executive",
      policy_mode: c.mode ?? "confirmed_only",
    });
    expect(result.pass).toBe(c.pass);
    if (c.rule) expect(result.reason).toContain(c.rule);
    if (c.id === "T4.22") expect(result.notes).toContain("internal detail");
  });
  it.each(["confirmed_only", "early_incident"] as const)(
    "customer restrictions apply in %s",
    (mode) => {
      for (const c of cases.filter((c) => ["T4.9", "T4.10", "T4.11", "T4.12"].includes(c.id))) {
        expect(
          verifySentence(sentence(c.text, c.claims), {
            stage: c.stage ?? stage4,
            audience: "customer",
            policy_mode: mode,
          }).pass,
        ).toBe(c.pass);
      }
    },
  );
  it("T4.23 word limits are separate from sentence verification", () => {
    const draft: Draft = {
      audience: "executive",
      policy_mode: null,
      as_of: "18:51",
      source: "reference",
      generated_at: null,
      sections: [
        { heading: "", sentences: [sentence(Array(121).fill("impact").join(" "), ["C-001"])] },
      ],
    };
    const result = verifyDraft(draft, stage4);
    expect(result.word_count).toBe(121);
    expect(result.word_limit).toBe(120);
    expect(result.over_limit).toBe(true);
    expect(result.pass).toBe(true);
  });
  it("T5.3 excludes failed sentences from Copy even if the model marks them passed", () => {
    const good = sentence("Customers are affected.", ["C-001"]);
    const bad = {
      ...sentence("Failed attempts do not charge your card…"),
      verify: { pass: true, reason: null },
    };
    const draft: Draft = {
      ...stage5.drafts.customer.confirmed_only!,
      sections: [{ heading: "", sentences: [good, bad] }],
    };
    const checked = verifyDraft(draft, stage4);
    expect(checked.verified).toBe(1);
    expect(checked.excluded).toBe(1);
    expect(copyVerifiedText(checked.draft)).toBe("Customers are affected.");
  });
  it("retains a failed Astra support check after code rules pass", () => {
    const draft: Draft = {
      ...stage5.drafts.executive!,
      sections: [
        {
          heading: "",
          sentences: [
            {
              ...sentence("Customers are affected.", ["C-001"]),
              verify: { pass: false, reason: "Astra: unsupported wording" },
            },
          ],
        },
      ],
    };
    expect(verifyDraft(draft, stage4).draft.sections[0]!.sentences[0]!.verify).toEqual({
      pass: false,
      reason: "Astra: unsupported wording",
    });
  });
  it("Copy omits unchecked sentences", () => {
    const draft: Draft = {
      ...stage5.drafts.executive!,
      sections: [{ heading: "", sentences: [sentence("Unchecked", ["C-001"])] }],
    };
    expect(copyVerifiedText(draft)).toBe("");
  });
});

const stages = [stage1, stage2, stage3, stage4, stage5, stage6, stage7, stage8, stage9];
describe("Replay contracts across stages 1–9", () => {
  it.each(stages)("stage $stage reference drafts pass code verification", (stage) => {
    for (const draft of [
      stage.drafts.executive!,
      stage.drafts.engineering!,
      stage.drafts.customer.confirmed_only!,
      stage.drafts.customer.early_incident!,
    ]) {
      const result = verifyDraft(draft, stage);
      const failures = result.draft.sections
        .flatMap((s) => s.sentences)
        .filter((s) => !s.verify!.pass);
      expect(failures).toEqual([]);
    }
  });
  it.each(stages)("stage $stage is self-contained with valid references", (stage) => {
    const sources = new Set(stage.evidence.map((s) => s.id));
    const claims = new Set(stage.claims.map((c) => c.id));
    for (const claim of stage.claims) {
      expect(claim.source_ids.every((id) => sources.has(id))).toBe(true);
      if (claim.superseded_by) expect(claims.has(claim.superseded_by)).toBe(true);
      if (claim.estimate) expect(sources.has(claim.estimate.source_id)).toBe(true);
    }
    expect(stage.evidence).toHaveLength([3, 5, 12, 19, 24, 25, 28, 31, 35][stage.stage - 1]!);
    expect(stage.claims.filter((c) => !c.superseded_by)).toHaveLength(
      [5, 6, 10, 15, 20, 21, 22, 20, 22][stage.stage - 1]!,
    );
  });
});
