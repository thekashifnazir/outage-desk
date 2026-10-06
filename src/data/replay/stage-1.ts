import type { Stage } from "./types";

export const stage1: Stage = {
  "stage": 1,
  "label": "T+5",
  "at": "17:56",
  "title": "Something's wrong",
  "status": "Investigating",
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
