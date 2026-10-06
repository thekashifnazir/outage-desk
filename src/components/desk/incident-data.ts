import { asosCapturedAt, asosEvidence, asosEvidenceMeta } from '@/data/live/asos';
import savedAsos from '@/data/saved-runs/live-asos.json';
import type { Claim, Stage } from '@/data/replay/types';

export const capturedTime = asosCapturedAt.slice(11, 16);
export const asosIncident: Stage = {
 stage: 0, label: 'Live', at: asosCapturedAt, title: 'ASOS app notification', status: 'Developing',
 evidence: asosEvidence.filter(e => e.at <= asosCapturedAt), claims: savedAsos.capped_ledger as Claim[],
 changes: [], response_items: [], drafts: { executive: null, engineering: null, customer: { confirmed_only: null, early_incident: null } },
 must_not_say: [], sources_reachable: { google_status: false, cloudflare_status: false, astra: true },
};
export function incidentTime(value: string, live: boolean) {
 if (!live) return value;
 return value.includes('T') ? `${value.slice(11, 16)} BST${value.slice(0, 10) !== asosCapturedAt.slice(0, 10) ? ` · ${value.slice(0, 10)}` : ''}` : `${value} BST`;
}
export function evidenceTime(id: string, at: string, live: boolean) {
 if (!live) return at;
 return asosEvidenceMeta[id]?.time_note ?? incidentTime(at, true);
}
export { asosEvidenceMeta };