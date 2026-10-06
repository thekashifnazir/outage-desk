import type { Stage } from "./types";

export const stage4: Stage = {
  "stage": 4,
  "label": "T+60",
  "at": "18:51",
  "title": "Confirmed, but not explained",
  "status": "Provider confirmed",
  "evidence": [
    {
      "id": "N1",
      "at": "17:52",
      "kind": "internal",
      "origin": "Northwind monitoring",
      "provider": "Northwind",
      "channel": null,
      "excerpt": "ALERT login-api: 5xx rate 38% (baseline 0.2%), rising since 17:51",
      "url": null,
      "arrived_via": "replay",
      "fictional": true
    },
    {
      "id": "S1",
      "at": "17:56",
      "kind": "community",
      "origin": "Bluesky",
      "provider": null,
      "channel": null,
      "excerpt": "Is the GCP console and us-east1 acting up?",
      "url": null,
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S2",
      "at": "17:56",
      "kind": "provider_official",
      "origin": "Google Cloud status page",
      "provider": "Google Cloud",
      "channel": "status_page",
      "excerpt": "No major incidents",
      "url": "https://status.cloud.google.com",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "N4",
      "at": "18:01",
      "kind": "internal",
      "origin": "Northwind logs",
      "provider": "Northwind",
      "channel": null,
      "excerpt": "Failing requests are calls to Google Cloud APIs (Firestore, Firebase Auth), returning 503",
      "url": null,
      "arrived_via": "replay",
      "fictional": true
    },
    {
      "id": "S13",
      "at": "18:02",
      "kind": "downstream_company",
      "origin": "Discord status",
      "provider": "Discord",
      "channel": null,
      "excerpt": "We are investigating an issue with attachments and embeds not being rendered in the app.",
      "url": "https://discordstatus.com",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "N2",
      "at": "18:05",
      "kind": "internal",
      "origin": "Northwind change log",
      "provider": "Northwind",
      "channel": null,
      "excerpt": "No deploys since 14:00",
      "url": null,
      "arrived_via": "replay",
      "fictional": true
    },
    {
      "id": "S3",
      "at": "18:07",
      "kind": "community",
      "origin": "r/Firebase",
      "provider": null,
      "channel": null,
      "excerpt": "My database is saying \"503: Policy checks are unavailable.\" and I can't even access my projects",
      "url": "https://reddit.com/r/Firebase",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S4",
      "at": "18:07",
      "kind": "community",
      "origin": "r/googlecloud",
      "provider": null,
      "channel": null,
      "excerpt": "GCP down for anyone else? Getting 503s across the board.",
      "url": "https://reddit.com/r/googlecloud",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "N6",
      "at": "18:08",
      "kind": "internal",
      "origin": "Northwind service catalogue",
      "provider": "Northwind",
      "channel": null,
      "excerpt": "Customer app: Cloud Run + Firestore + Firebase Auth, us-central1 only, no second region. Staff tools behind Cloudflare Access",
      "url": null,
      "arrived_via": "replay",
      "fictional": true
    },
    {
      "id": "N3",
      "at": "18:09",
      "kind": "internal",
      "origin": "Northwind engineers",
      "provider": "Northwind",
      "channel": null,
      "excerpt": "GCP console won't load, so we can't open a support case through it",
      "url": null,
      "arrived_via": "replay",
      "fictional": true
    },
    {
      "id": "S6",
      "at": "18:09",
      "kind": "downstream_company",
      "origin": "Expo status",
      "provider": "Expo",
      "channel": null,
      "excerpt": "possible GCP outage",
      "url": "https://status.expo.dev",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S5",
      "at": "18:11",
      "kind": "downstream_company",
      "origin": "Replit status",
      "provider": "Replit",
      "channel": null,
      "excerpt": "Our upstream cloud provider is having a wide-ranging outage.",
      "url": "https://status.replit.com",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S8",
      "at": "18:19",
      "kind": "provider_official",
      "origin": "Cloudflare status",
      "provider": "Cloudflare",
      "channel": "status_page",
      "excerpt": "Cloudflare engineering is investigating an issue causing Access authentication to fail. Cloudflare Zero Trust WARP connectivity is also impacted. (18:48 update: Impacted services: Access WARP Durable Objects (SQLite backed Durable Objects only) Workers KV Realtime Workers AI Stream Parts of the Cloudflare dashboard)",
      "url": "https://cloudflarestatus.com/incidents/25r9t0vz99rp",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S9",
      "at": "18:26",
      "kind": "community",
      "origin": "r/CloudFlare",
      "provider": null,
      "channel": null,
      "excerpt": "KV GET failed: 503 Service temporarily unavailable",
      "url": "https://reddit.com/r/CloudFlare",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S12",
      "at": "18:40",
      "kind": "downstream_company",
      "origin": "Supabase status",
      "provider": "Supabase",
      "channel": null,
      "excerpt": "We believe connectivity issues are the result of a broad outage with our upstream provider.",
      "url": "https://status.supabase.com",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S7",
      "at": "18:46",
      "kind": "provider_official",
      "origin": "Google Cloud status page",
      "provider": "Google Cloud",
      "channel": "status_page",
      "excerpt": "We are experiencing service issues with multiple GCP products beginning at Thursday, 2025-06-12 10:51 PDT.",
      "url": "https://status.cloud.google.com/incidents/ow5i3PPK96RduMcb1SsW",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S11",
      "at": "18:48",
      "kind": "community",
      "origin": "r/sysadmin",
      "provider": null,
      "channel": null,
      "excerpt": "AWS, Azure, GCP and Cloudflare are all having serious issues",
      "url": "https://reddit.com/r/sysadmin",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "M1",
      "at": "18:49",
      "kind": "monitor",
      "origin": "Downdetector (Wayback)",
      "provider": null,
      "channel": null,
      "excerpt": "Google Cloud reports peak 14,695 at 18:31; Cloudflare 3,071 at 18:49",
      "url": "https://downdetector.com",
      "arrived_via": "replay",
      "fictional": false
    },
    {
      "id": "S10",
      "at": "18:50",
      "kind": "private_channel",
      "origin": "r/sysadmin (relaying a Cloudflare account manager)",
      "provider": null,
      "channel": null,
      "excerpt": "My Cloudflare CSM reports that this outage is upstream of Cloudflare, caused by Google Cloud outages.",
      "url": "https://reddit.com/r/sysadmin",
      "arrived_via": "replay",
      "fictional": false
    }
  ],
  "claims": [
    {
      "id": "C-005",
      "statement": "Google Cloud has an incident affecting multiple products since 17:51 UTC",
      "subject": "Google Cloud",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "S7",
        "S1",
        "S3",
        "S4",
        "S5",
        "S6",
        "S13"
      ],
      "provider_wording": "We are experiencing service issues with multiple GCP products beginning at Thursday, 2025-06-12 10:51 PDT.",
      "settled_by": null,
      "estimate": null,
      "first_seen": "18:46",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 1,
          "class": "CONFIRMED",
          "statement": "status page shows no incident",
          "because": [
            "S2"
          ]
        },
        {
          "stage": 3,
          "class": "CONFLICTING",
          "statement": "Status page shows no incident; credible sources report an outage",
          "because": [
            "S2",
            "S3",
            "S4",
            "S5",
            "S6"
          ]
        },
        {
          "stage": 4,
          "class": "CONFIRMED",
          "statement": "Google Cloud has an incident affecting multiple products since 17:51 UTC",
          "because": [
            "S7"
          ]
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-011",
      "statement": "Cloudflare has an outage: Access authentication failing, WARP impacted, Workers KV and Durable Objects among impacted services",
      "subject": "Cloudflare",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "S8",
        "S9"
      ],
      "provider_wording": "an issue causing Access authentication to fail. Cloudflare Zero Trust WARP connectivity is also impacted.",
      "settled_by": null,
      "estimate": null,
      "first_seen": "18:19",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 4,
          "statement": "Cloudflare has an outage: Access authentication failing, WARP impacted, Workers KV and Durable Objects among impacted services",
          "because": [
            "S8",
            "S9"
          ],
          "class": "CONFIRMED"
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-001",
      "statement": "Since 17:51 UTC customers can't reliably log in or use our API",
      "subject": "Northwind",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "N1"
      ],
      "provider_wording": null,
      "settled_by": null,
      "estimate": null,
      "first_seen": "17:52",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 1,
          "statement": "Since 17:51 UTC customers can't reliably log in or use our API",
          "because": [
            "N1"
          ],
          "class": "CONFIRMED"
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-006",
      "statement": "Our failing requests are Google Cloud API calls (Firestore, Firebase Auth) returning 503",
      "subject": "Northwind",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "N4"
      ],
      "provider_wording": null,
      "settled_by": null,
      "estimate": null,
      "first_seen": "18:01",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 2,
          "statement": "Our failing requests are Google Cloud API calls (Firestore, Firebase Auth) returning 503",
          "because": [
            "N4"
          ],
          "class": "CONFIRMED"
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-007",
      "statement": "No Northwind deploys since 14:00, so not caused by our change",
      "subject": "Northwind",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "N2"
      ],
      "provider_wording": null,
      "settled_by": null,
      "estimate": null,
      "first_seen": "18:05",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 3,
          "statement": "No Northwind deploys since 14:00, so not caused by our change",
          "because": [
            "N2"
          ],
          "class": "CONFIRMED"
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-008",
      "statement": "The GCP console won't load for our engineers",
      "subject": "Northwind",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "N3"
      ],
      "provider_wording": null,
      "settled_by": null,
      "estimate": null,
      "first_seen": "18:09",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 3,
          "statement": "The GCP console won't load for our engineers",
          "because": [
            "N3"
          ],
          "class": "CONFIRMED"
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-009",
      "statement": "Northwind runs only in Google Cloud us-central1, with no second region",
      "subject": "Northwind",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "N6"
      ],
      "provider_wording": null,
      "settled_by": null,
      "estimate": null,
      "first_seen": "18:08",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 3,
          "statement": "Northwind runs only in Google Cloud us-central1, with no second region",
          "because": [
            "N6"
          ],
          "class": "CONFIRMED"
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-010",
      "statement": "Northwind staff reach internal tools through Cloudflare Access",
      "subject": "Northwind",
      "unknown_kind": null,
      "proposed_class": "CONFIRMED",
      "source_ids": [
        "N6"
      ],
      "provider_wording": null,
      "settled_by": null,
      "estimate": null,
      "first_seen": "18:08",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 3,
          "statement": "Northwind staff reach internal tools through Cloudflare Access",
          "because": [
            "N6"
          ],
          "class": "CONFIRMED"
        }
      ],
      "class": "CONFIRMED"
    },
    {
      "id": "C-015",
      "statement": "Downdetector: Google Cloud problem reports peaked at 14,695 (18:31); Cloudflare at 3,071 (18:49)",
      "subject": "Google Cloud",
      "unknown_kind": null,
      "proposed_class": "REPORTED",
      "source_ids": [
        "M1"
      ],
      "provider_wording": null,
      "settled_by": "provider statements on scope",
      "estimate": null,
      "first_seen": "18:49",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 4,
          "statement": "Downdetector: Google Cloud problem reports peaked at 14,695 (18:31); Cloudflare at 3,071 (18:49)",
          "because": [
            "M1"
          ],
          "class": "REPORTED"
        }
      ],
      "class": "REPORTED"
    },
    {
      "id": "C-012",
      "statement": "Cloudflare's outage is caused by Google Cloud's outage",
      "subject": "Cloudflare",
      "unknown_kind": null,
      "proposed_class": "REPORTED",
      "source_ids": [
        "S10"
      ],
      "provider_wording": null,
      "settled_by": "Google or Cloudflare saying so on the record",
      "estimate": null,
      "first_seen": "18:50",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 4,
          "statement": "Cloudflare's outage is caused by Google Cloud's outage",
          "because": [
            "S10"
          ],
          "class": "UNCONFIRMED"
        }
      ],
      "class": "UNCONFIRMED"
    },
    {
      "id": "C-013",
      "statement": "AWS and Azure are also down",
      "subject": "AWS",
      "unknown_kind": null,
      "proposed_class": "UNCONFIRMED",
      "source_ids": [
        "S11"
      ],
      "provider_wording": null,
      "settled_by": "an AWS or Azure status page",
      "estimate": null,
      "first_seen": "18:48",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 4,
          "statement": "AWS and Azure are also down",
          "because": [
            "S11"
          ],
          "class": "UNCONFIRMED"
        }
      ],
      "class": "UNCONFIRMED"
    },
    {
      "id": "C-014",
      "statement": "A BGP routing failure is behind the outages",
      "subject": null,
      "unknown_kind": null,
      "proposed_class": "UNCONFIRMED",
      "source_ids": [
        "S11"
      ],
      "provider_wording": null,
      "settled_by": "the provider's root-cause statement",
      "estimate": null,
      "first_seen": "18:48",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 4,
          "statement": "A BGP routing failure is behind the outages",
          "because": [
            "S11"
          ],
          "class": "UNCONFIRMED"
        }
      ],
      "class": "UNCONFIRMED"
    },
    {
      "id": "C-003",
      "statement": "Root cause",
      "subject": "Google Cloud",
      "unknown_kind": "cause",
      "proposed_class": "UNKNOWN",
      "source_ids": [],
      "provider_wording": null,
      "settled_by": "the provider stating the cause on the record",
      "estimate": null,
      "first_seen": "17:56",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 1,
          "statement": "Root cause",
          "because": [],
          "class": "UNKNOWN"
        }
      ],
      "class": "UNKNOWN"
    },
    {
      "id": "C-004",
      "statement": "When our service will recover",
      "subject": "Northwind",
      "unknown_kind": "recovery",
      "proposed_class": "UNKNOWN",
      "source_ids": [],
      "provider_wording": null,
      "settled_by": "our monitoring returning to baseline, or a provider estimate",
      "estimate": null,
      "first_seen": "17:56",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 1,
          "statement": "When our service will recover",
          "because": [],
          "class": "UNKNOWN"
        }
      ],
      "class": "UNKNOWN"
    },
    {
      "id": "C-016",
      "statement": "Which Google Cloud regions are affected",
      "subject": "Google Cloud",
      "unknown_kind": "scope",
      "proposed_class": "UNKNOWN",
      "source_ids": [],
      "provider_wording": null,
      "settled_by": "the provider's list of affected regions",
      "estimate": null,
      "first_seen": "18:51",
      "superseded_by": null,
      "contradiction_sides": null,
      "history": [
        {
          "stage": 4,
          "statement": "Which Google Cloud regions are affected",
          "because": [],
          "class": "UNKNOWN"
        }
      ],
      "class": "UNKNOWN"
    },
    {
      "id": "C-002",
      "statement": "Google Cloud APIs are returning errors for many customers worldwide",
      "subject": "Google Cloud",
      "unknown_kind": null,
      "class": "REPORTED",
      "proposed_class": "REPORTED",
      "source_ids": [
        "S1",
        "S13",
        "S3",
        "S4",
        "S5",
        "S6"
      ],
      "provider_wording": null,
      "settled_by": null,
      "estimate": null,
      "first_seen": "17:56",
      "superseded_by": "C-005",
      "contradiction_sides": null,
      "history": [
        {
          "stage": 1,
          "class": "UNCONFIRMED",
          "statement": "Google Cloud may be having problems (GCP console, us-east1)",
          "because": [
            "S1"
          ]
        },
        {
          "stage": 3,
          "class": "REPORTED",
          "statement": "Google Cloud APIs are returning errors for many customers worldwide",
          "because": [
            "S3",
            "S4",
            "S5",
            "S6"
          ]
        }
      ]
    }
  ],
  "changes": [
    {
      "claim_id": "C-005",
      "change": "UPGRADED",
      "from": "CONFLICTING",
      "to": "CONFIRMED",
      "because": [
        "S7"
      ]
    },
    {
      "claim_id": "C-011",
      "change": "NEW",
      "from": null,
      "to": "CONFIRMED",
      "because": [
        "S8",
        "S9"
      ]
    },
    {
      "claim_id": "C-012",
      "change": "NEW",
      "from": null,
      "to": "UNCONFIRMED",
      "because": [
        "S10"
      ]
    },
    {
      "claim_id": "C-002",
      "change": "MERGED",
      "from": "REPORTED",
      "to": null,
      "because": [
        "S7"
      ]
    },
    {
      "claim_id": "C-013",
      "change": "NEW",
      "from": null,
      "to": "UNCONFIRMED",
      "because": [
        "S11"
      ]
    },
    {
      "claim_id": "C-014",
      "change": "NEW",
      "from": null,
      "to": "UNCONFIRMED",
      "because": [
        "S11"
      ]
    },
    {
      "claim_id": "C-015",
      "change": "NEW",
      "from": null,
      "to": "REPORTED",
      "because": [
        "M1"
      ]
    },
    {
      "claim_id": "C-016",
      "change": "NEW",
      "from": null,
      "to": "UNKNOWN",
      "because": []
    }
  ],
  "response_items": [
    {
      "id": "R-1",
      "type": "action",
      "text": "P1 declared; incident bridge open",
      "by": "Incident lead",
      "at": "17:56",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-2",
      "type": "action",
      "text": "Holding statement published on our status page",
      "by": "Comms lead",
      "at": "17:56",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-3",
      "type": "action",
      "text": "Triage: recent changes, our code vs Google API calls, GCP console access. No rollback until a change is implicated",
      "by": "Engineering lead",
      "at": "17:56",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-5",
      "type": "action",
      "text": "Checking our quota and IAM settings; support case by phone if the console won't load",
      "by": "Engineering lead",
      "at": "18:02",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-7",
      "type": "action",
      "text": "Deploys frozen",
      "by": "Engineering lead",
      "at": "18:08",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-8",
      "type": "action",
      "text": "Escalating to Google by phone and account team (console down)",
      "by": "Engineering lead",
      "at": "18:10",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-9",
      "type": "decision_needed",
      "text": "Approve the customer update: \"investigating\", no provider named",
      "by": "Incident lead",
      "at": "18:11",
      "status": "decided",
      "decision": "Approved and published",
      "decided_at": "18:14",
      "replaced_by": null
    },
    {
      "id": "R-11",
      "type": "action",
      "text": "Staff on break-glass access for internal tools",
      "by": "IT lead",
      "at": "18:40",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-12",
      "type": "decision_needed",
      "text": "Name Google Cloud in customer updates? (Google confirmed publicly at 18:46)",
      "by": "Incident lead",
      "at": "18:51",
      "status": "open",
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-13",
      "type": "decision_needed",
      "text": "Customer updates every 30 minutes",
      "by": "Incident lead",
      "at": "18:51",
      "status": "open",
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-14",
      "type": "action",
      "text": "Preparing to replay requests that failed during the outage",
      "by": "Engineering lead",
      "at": "18:51",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-15",
      "type": "next_update",
      "text": "Next update 19:20 (bridge and customers)",
      "by": "Incident lead",
      "at": "18:51",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": null
    },
    {
      "id": "R-4",
      "type": "next_update",
      "text": "Bridge 18:10 · customers within 30 min",
      "by": "Incident lead",
      "at": "17:56",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": "R-6"
    },
    {
      "id": "R-6",
      "type": "next_update",
      "text": "Bridge 18:15 · customers by 18:26",
      "by": "Incident lead",
      "at": "18:02",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": "R-10"
    },
    {
      "id": "R-10",
      "type": "next_update",
      "text": "Bridge 18:30 · customers by 18:40",
      "by": "Incident lead",
      "at": "18:11",
      "status": null,
      "decision": null,
      "decided_at": null,
      "replaced_by": "R-15"
    }
  ],
  "drafts": {
    "executive": {
      "audience": "executive",
      "policy_mode": null,
      "as_of": "18:51",
      "source": "reference",
      "generated_at": null,
      "sections": [
        {
          "heading": "SITUATION",
          "sentences": [
            {
              "text": "Google Cloud confirmed an incident affecting multiple products at 18:46, 55 minutes after our impact began.",
              "type": "fact",
              "claim_ids": [
                "C-005",
                "C-001"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "Cloudflare confirms an outage in Access, our staff login, so expect internal tools to fail.",
              "type": "fact",
              "claim_ids": [
                "C-011",
                "C-010"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "IMPACT ON US",
          "sentences": [
            {
              "text": "Customers still can't log in or use our API.",
              "type": "fact",
              "claim_ids": [
                "C-001"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "NOT YET KNOWN",
          "sentences": [
            {
              "text": "Cause and recovery time are unknown; neither vendor gives an ETA.",
              "type": "fact",
              "claim_ids": [
                "C-003",
                "C-004"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "A Cloudflare account manager privately links the two outages; unverified.",
              "type": "fact",
              "claim_ids": [
                "C-012"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "Reports that AWS and Azure are down are unverified.",
              "type": "fact",
              "claim_ids": [
                "C-013"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "WHAT WE'RE DOING",
          "sentences": [
            {
              "text": "Staff are on break-glass access for internal tools.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-11"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "DECISIONS NEEDED",
          "sentences": [
            {
              "text": "Approve naming Google Cloud in customer updates; Google has confirmed publicly.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-12"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "Approve customer updates every 30 minutes.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-13"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "NEXT UPDATE",
          "sentences": [
            {
              "text": "Next update at 19:20.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-15"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        }
      ]
    },
    "engineering": {
      "audience": "engineering",
      "policy_mode": null,
      "as_of": "18:51",
      "source": "reference",
      "generated_at": null,
      "sections": [
        {
          "heading": "CONFIRMED TECHNICAL FACTS",
          "sentences": [
            {
              "text": "Google confirms an incident across multiple products.",
              "type": "fact",
              "claim_ids": [
                "C-005"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "Cloudflare Access and WARP are down, and Cloudflare lists Workers KV and Durable Objects among impacted services.",
              "type": "fact",
              "claim_ids": [
                "C-011"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "NOT YET KNOWN",
          "sentences": [
            {
              "text": "Affected regions are not yet known, and there is no ETA.",
              "type": "fact",
              "claim_ids": [
                "C-016",
                "C-004"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "WHAT TO DO",
          "sentences": [
            {
              "text": "Use break-glass access for internal tools.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-11"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "Keep deploys frozen.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-7"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "Prepare steps to replay requests that failed during the window.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-14"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "WHAT NOT TO CHASE",
          "sentences": [
            {
              "text": "AWS, Azure and BGP theories are unverified crowd posts; don't act on them.",
              "type": "fact",
              "claim_ids": [
                "C-013",
                "C-014"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            },
            {
              "text": "The claim that Google caused Cloudflare's outage rests on one private-channel account; unverified.",
              "type": "fact",
              "claim_ids": [
                "C-012"
              ],
              "response_ids": [],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        },
        {
          "heading": "NEXT UPDATE",
          "sentences": [
            {
              "text": "Bridge update at 19:20.",
              "type": "commitment",
              "claim_ids": [],
              "response_ids": [
                "R-15"
              ],
              "verify": {
                "reason": null,
                "pass": true
              }
            }
          ]
        }
      ]
    },
    "customer": {
      "confirmed_only": {
        "audience": "customer",
        "policy_mode": "confirmed_only",
        "as_of": "18:51",
        "source": "reference",
        "generated_at": null,
        "sections": [
          {
            "heading": "",
            "sentences": [
              {
                "text": "Since 17:51 UTC some customers have been unable to log in or use our API, and we're sorry for the disruption.",
                "type": "fact",
                "claim_ids": [
                  "C-001"
                ],
                "response_ids": [],
                "verify": {
                  "reason": null,
                  "pass": true
                }
              },
              {
                "text": "Our cloud provider has confirmed an incident affecting multiple services.",
                "type": "fact",
                "claim_ids": [
                  "C-005"
                ],
                "response_ids": [],
                "verify": {
                  "reason": null,
                  "pass": true
                }
              },
              {
                "text": "We're working with them to restore access and will update by 19:20 UTC.",
                "type": "commitment",
                "claim_ids": [],
                "response_ids": [
                  "R-8",
                  "R-15"
                ],
                "verify": {
                  "reason": null,
                  "pass": true
                }
              }
            ]
          }
        ]
      },
      "early_incident": {
        "audience": "customer",
        "policy_mode": "early_incident",
        "as_of": "18:51",
        "source": "reference",
        "generated_at": null,
        "sections": [
          {
            "heading": "",
            "sentences": [
              {
                "text": "Since 17:51 UTC some customers have been unable to log in or use our API, and we're sorry for the disruption.",
                "type": "fact",
                "claim_ids": [
                  "C-001"
                ],
                "response_ids": [],
                "verify": {
                  "reason": null,
                  "pass": true
                }
              },
              {
                "text": "Our cloud provider has confirmed an incident affecting multiple services.",
                "type": "fact",
                "claim_ids": [
                  "C-005"
                ],
                "response_ids": [],
                "verify": {
                  "reason": null,
                  "pass": true
                }
              },
              {
                "text": "We're working with them to restore access and will update by 19:20 UTC.",
                "type": "commitment",
                "claim_ids": [],
                "response_ids": [
                  "R-8",
                  "R-15"
                ],
                "verify": {
                  "reason": null,
                  "pass": true
                }
              }
            ]
          }
        ]
      }
    }
  },
  "must_not_say": [
    "Cloudflare caused this",
    "AWS is down",
    "That it was a cyberattack",
    "An ETA stated as fact",
    "Google’s name in customer copy"
  ],
  "sources_reachable": {
    "google_status": true,
    "cloudflare_status": true,
    "astra": true
  }
};
