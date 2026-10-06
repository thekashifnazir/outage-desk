import type { Claim, Draft } from '@/data/replay/types';
import { ClassPill, ClaimChip } from './primitives';

export function KeyFacts({ draft, claims, openClaim }: { draft: Draft; claims: Claim[]; openClaim: (id: string) => void }) {
 const ids = [...new Set(draft.sections.flatMap(section => section.sentences.flatMap(sentence => sentence.claim_ids)))];
 const facts = ids.flatMap(id => { const claim = claims.find(item => item.id === id); return claim ? [claim] : []; });
 if (!facts.length) return null;
 return <section className="key-facts" aria-label="Key facts used"><h3>Key facts used</h3>{facts.map(claim => <div className="key-fact" key={claim.id}><div><ClassPill cls={claim.class}/><ClaimChip claim={claim} onClick={() => openClaim(claim.id)}/></div><p>{claim.statement}</p></div>)}</section>;
}