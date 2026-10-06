import type { Stage } from "./types";

export const stage9: Stage = {
  "stage": 9,
  "label": "Next day",
  "at": "13 Jun",
  "title": "Next day: what actually happened",
  "status": "Post-incident",
  "evidence": [],
  "claims": [],
  "changes": [],
  "response_items": [],
  "drafts": {
    "executive": null,
    "engineering": null,
    "customer": {
      "confirmed_only": null,
      "early_incident": null
    }
  },
  "must_not_say": [],
  "sources_reachable": {
    "google_status": true,
    "cloudflare_status": true,
    "astra": true
  }
};
