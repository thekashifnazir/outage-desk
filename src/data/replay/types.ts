export type ClaimClass = "CONFIRMED" | "REPORTED" | "CONFLICTING" | "UNCONFIRMED" | "UNKNOWN";

export type Evidence = {
  id: string;
  at: string;
  kind:
    | "provider_official"
    | "internal"
    | "downstream_company"
    | "community"
    | "monitor"
    | "press"
    | "private_channel";
  origin: string;
  provider: string | null;
  channel: "status_page" | "social" | "support" | "blog" | "report" | null;
  excerpt: string;
  url: string | null;
  arrived_via: "replay" | "api" | "archive" | "manual";
  fictional: boolean;
};

export type Estimate = { speaker: string; said: string; at: string; source_id: string };

export type Claim = {
  id: string;
  statement: string;
  subject: string | null;
  unknown_kind: "cause" | "recovery" | "scope" | "data" | null;
  class: ClaimClass;
  proposed_class: ClaimClass;
  source_ids: string[];
  provider_wording: string | null;
  settled_by: string | null;
  estimate: Estimate | null;
  first_seen: string | null;
  superseded_by: string | null;
  contradiction_sides: { label: string; source_ids: string[] }[] | null;
  history: { stage: number; class: ClaimClass; statement: string; because: string[] }[];
};

export type ResponseItem = {
  id: string;
  type: "action" | "decision_needed" | "commitment" | "next_update";
  text: string;
  by: string;
  at: string;
  status: "open" | "decided" | null;
  decision: string | null;
  decided_at: string | null;
  replaced_by: string | null;
};

export type Sentence = {
  text: string;
  type: "fact" | "commitment";
  claim_ids: string[];
  response_ids: string[];
  verify: { pass: boolean; reason: string | null } | null;
};

export type Draft = {
  audience: "executive" | "engineering" | "customer";
  policy_mode: "confirmed_only" | "early_incident" | null;
  as_of: string;
  source: "reference" | "astra_saved" | "astra_live";
  generated_at: string | null;
  sections: { heading: string; sentences: Sentence[] }[];
};

export type Change = {
  claim_id: string;
  change: "UPGRADED" | "DOWNGRADED" | "NEW" | "MERGED" | "CONFLICT";
  from: ClaimClass | null;
  to: ClaimClass | null;
  because: string[];
};

export type Stage = {
  stage: number;
  label: string;
  at: string;
  title: string;
  status: string;
  evidence: Evidence[];
  claims: Claim[];
  changes: Change[];
  response_items: ResponseItem[];
  drafts: {
    executive: Draft | null;
    engineering: Draft | null;
    customer: { confirmed_only: Draft | null; early_incident: Draft | null };
  };
  must_not_say: string[];
  sources_reachable: { google_status: boolean; cloudflare_status: boolean; astra: boolean };
};
