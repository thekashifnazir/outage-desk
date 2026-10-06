import type { Stage } from "./types";

export const stage1: Stage = {
  stage: 1,
  label: "T+5",
  at: "17:56",
  title: "Something's wrong",
  status: "Investigating",
  evidence: [
    {
      id: "N1",
      at: "17:52",
      kind: "internal",
      origin: "Northwind monitoring",
      provider: "Northwind",
      channel: null,
      excerpt: "ALERT login-api: 5xx rate 38% (baseline 0.2%), rising since 17:51",
      url: null,
      arrived_via: "replay",
      fictional: true,
    },
    {
      id: "S1",
      at: "17:56",
      kind: "community",
      origin: "Bluesky",
      provider: null,
      channel: null,
      excerpt: "Is the GCP console and us-east1 acting up?",
      url: null,
      arrived_via: "replay",
      fictional: false,
    },
    {
      id: "S2",
      at: "17:56",
      kind: "provider_official",
      origin: "Google Cloud status page",
      provider: "Google Cloud",
      channel: "status_page",
      excerpt: "No major incidents",
      url: "https://status.cloud.google.com",
      arrived_via: "replay",
      fictional: false,
    },
  ],
  claims: [
    {
      id: "C-001",
      statement: "Since 17:51 UTC customers can't reliably log in or use our API",
      subject: "Northwind",
      unknown_kind: null,
      class: "CONFIRMED",
      proposed_class: "CONFIRMED",
      source_ids: ["N1"],
      provider_wording: null,
      settled_by: null,
      estimate: null,
      first_seen: "17:52",
      superseded_by: null,
      contradiction_sides: null,
      history: [
        {
          stage: 1,
          class: "CONFIRMED",
          statement: "Since 17:51 UTC customers can't reliably log in or use our API",
          because: ["N1"],
        },
      ],
    },
    {
      id: "C-002",
      statement: "Google Cloud may be having problems (GCP console, us-east1)",
      subject: "Google Cloud",
      unknown_kind: null,
      class: "UNCONFIRMED",
      proposed_class: "UNCONFIRMED",
      source_ids: ["S1"],
      provider_wording: null,
      settled_by: "Google Cloud's status page, or more independent reports",
      estimate: null,
      first_seen: "17:56",
      superseded_by: null,
      contradiction_sides: null,
      history: [
        {
          stage: 1,
          class: "UNCONFIRMED",
          statement: "Google Cloud may be having problems (GCP console, us-east1)",
          because: ["S1"],
        },
      ],
    },
    {
      id: "C-003",
      statement: "Root cause",
      subject: "Google Cloud",
      unknown_kind: "cause",
      class: "UNKNOWN",
      proposed_class: "UNKNOWN",
      source_ids: [],
      provider_wording: null,
      settled_by: "The provider stating the cause on the record",
      estimate: null,
      first_seen: "17:56",
      superseded_by: null,
      contradiction_sides: null,
      history: [
        {
          stage: 1,
          class: "UNKNOWN",
          statement: "Root cause",
          because: [],
        },
      ],
    },
    {
      id: "C-004",
      statement: "When our service will recover",
      subject: "Northwind",
      unknown_kind: "recovery",
      class: "UNKNOWN",
      proposed_class: "UNKNOWN",
      source_ids: [],
      provider_wording: null,
      settled_by: "Our monitoring returning to baseline, or a provider estimate",
      estimate: null,
      first_seen: "17:56",
      superseded_by: null,
      contradiction_sides: null,
      history: [
        {
          stage: 1,
          class: "UNKNOWN",
          statement: "When our service will recover",
          because: [],
        },
      ],
    },
    {
      id: "C-005",
      statement: "Google Cloud's status page shows no incident",
      subject: "Google Cloud",
      unknown_kind: null,
      class: "CONFIRMED",
      proposed_class: "CONFIRMED",
      source_ids: ["S2"],
      provider_wording: "No major incidents",
      settled_by: null,
      estimate: null,
      first_seen: "17:56",
      superseded_by: null,
      contradiction_sides: null,
      history: [
        {
          stage: 1,
          class: "CONFIRMED",
          statement: "Google Cloud's status page shows no incident",
          because: ["S2"],
        },
      ],
    },
  ],
  changes: [
    {
      claim_id: "C-001",
      change: "NEW",
      to: "CONFIRMED",
      because: ["N1"],
      from: null,
    },
    {
      claim_id: "C-002",
      change: "NEW",
      to: "UNCONFIRMED",
      because: ["S1"],
      from: null,
    },
    {
      claim_id: "C-003",
      change: "NEW",
      to: "UNKNOWN",
      because: [],
      from: null,
    },
    {
      claim_id: "C-004",
      change: "NEW",
      to: "UNKNOWN",
      because: [],
      from: null,
    },
    {
      claim_id: "C-005",
      change: "NEW",
      to: "CONFIRMED",
      because: ["S2"],
      from: null,
    },
  ],
  response_items: [
    {
      id: "R-1",
      type: "action",
      text: "P1 declared; incident bridge open",
      by: "Incident lead",
      at: "17:56",
      status: null,
      decision: null,
      decided_at: null,
      replaced_by: null,
    },
    {
      id: "R-2",
      type: "action",
      text: "Holding statement published on our status page",
      by: "Comms lead",
      at: "17:56",
      status: null,
      decision: null,
      decided_at: null,
      replaced_by: null,
    },
    {
      id: "R-3",
      type: "action",
      text: "Triage: recent changes, our code vs Google API calls, GCP console access. No rollback until a change is implicated",
      by: "Engineering lead",
      at: "17:56",
      status: null,
      decision: null,
      decided_at: null,
      replaced_by: null,
    },
    {
      id: "R-4",
      type: "next_update",
      text: "Bridge 18:10 · customers within 30 min",
      by: "Incident lead",
      at: "17:56",
      status: null,
      decision: null,
      decided_at: null,
      replaced_by: null,
    },
  ],
  drafts: {
    executive: {
      audience: "executive",
      policy_mode: null,
      as_of: "17:56",
      source: "reference",
      generated_at: null,
      sections: [
        {
          heading: "SITUATION",
          sentences: [
            {
              text: "P1 declared at 17:56 and the incident bridge is open.",
              type: "commitment",
              claim_ids: [],
              response_ids: ["R-1"],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "IMPACT ON US",
          sentences: [
            {
              text: "Since 17:51, customers can't reliably log in or use our API, confirmed by our own monitoring.",
              type: "fact",
              claim_ids: ["C-001"],
              response_ids: [],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "CONFIRMED",
          sentences: [
            {
              text: "No cloud provider has declared an incident: Google Cloud's status page shows none.",
              type: "fact",
              claim_ids: ["C-005"],
              response_ids: [],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "NOT YET KNOWN",
          sentences: [
            {
              text: "We don't yet know whether the cause is ours or a provider's.",
              type: "fact",
              claim_ids: ["C-003"],
              response_ids: [],
              verify: {
                reason: null,
                pass: true,
              },
            },
            {
              text: "One public post asks whether Google Cloud is having problems; that is unverified.",
              type: "fact",
              claim_ids: ["C-002"],
              response_ids: [],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "WHAT WE'RE DOING",
          sentences: [
            {
              text: "Engineering is checking recent changes and whether errors come from our code or from Google API calls.",
              type: "commitment",
              claim_ids: [],
              response_ids: ["R-3"],
              verify: {
                reason: null,
                pass: true,
              },
            },
            {
              text: "A customer holding statement is published.",
              type: "commitment",
              claim_ids: [],
              response_ids: ["R-2"],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "NEXT UPDATE",
          sentences: [
            {
              text: "Next update at 18:10.",
              type: "commitment",
              claim_ids: [],
              response_ids: ["R-4"],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
      ],
    },
    engineering: {
      audience: "engineering",
      policy_mode: null,
      as_of: "17:56",
      source: "reference",
      generated_at: null,
      sections: [
        {
          heading: "CONFIRMED TECHNICAL FACTS",
          sentences: [
            {
              text: "Login and API requests have returned 5xx errors since 17:51; the alert fired at 17:52.",
              type: "fact",
              claim_ids: ["C-001"],
              response_ids: [],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "WHAT TO DO",
          sentences: [
            {
              text: "Check for any change in the last four hours, whether errors come from our code or from Google API calls, and whether the GCP console loads.",
              type: "commitment",
              claim_ids: [],
              response_ids: ["R-3"],
              verify: {
                reason: null,
                pass: true,
              },
            },
            {
              text: "Don't roll back until a change is actually implicated.",
              type: "commitment",
              claim_ids: [],
              response_ids: ["R-3"],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "WHAT NOT TO CHASE",
          sentences: [
            {
              text: "One public post about Google Cloud is unverified; don't act on it yet.",
              type: "fact",
              claim_ids: ["C-002"],
              response_ids: [],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
        {
          heading: "NEXT UPDATE",
          sentences: [
            {
              text: "Bridge update at 18:10.",
              type: "commitment",
              claim_ids: [],
              response_ids: ["R-4"],
              verify: {
                reason: null,
                pass: true,
              },
            },
          ],
        },
      ],
    },
    customer: {
      confirmed_only: {
        audience: "customer",
        policy_mode: "confirmed_only",
        as_of: "17:56",
        source: "reference",
        generated_at: null,
        sections: [
          {
            heading: "",
            sentences: [
              {
                text: "We're investigating an issue affecting login and API access.",
                type: "fact",
                claim_ids: ["C-001"],
                response_ids: [],
                verify: {
                  reason: null,
                  pass: true,
                },
              },
              {
                text: "We'll update you within 30 minutes.",
                type: "commitment",
                claim_ids: [],
                response_ids: ["R-4"],
                verify: {
                  reason: null,
                  pass: true,
                },
              },
            ],
          },
        ],
      },
      early_incident: {
        audience: "customer",
        policy_mode: "early_incident",
        as_of: "17:56",
        source: "reference",
        generated_at: null,
        sections: [
          {
            heading: "",
            sentences: [
              {
                text: "We're investigating an issue affecting login and API access.",
                type: "fact",
                claim_ids: ["C-001"],
                response_ids: [],
                verify: {
                  reason: null,
                  pass: true,
                },
              },
              {
                text: "We'll update you within 30 minutes.",
                type: "commitment",
                claim_ids: [],
                response_ids: ["R-4"],
                verify: {
                  reason: null,
                  pass: true,
                },
              },
            ],
          },
        ],
      },
    },
  },
  must_not_say: ["Anything that blames Google"],
  sources_reachable: {
    google_status: true,
    cloudflare_status: true,
    astra: true,
  },
};

export default stage1;
