import { CheckCircle2, Info, AlertTriangle, CircleDashed, HelpCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Claim, ClaimClass, Evidence } from '@/data/replay/types';
export const classes:ClaimClass[]=['CONFIRMED','REPORTED','CONFLICTING','UNCONFIRMED','UNKNOWN'];
export const meanings:Record<ClaimClass,string>={CONFIRMED:"Stated by the provider or seen in our own systems",REPORTED:"Credible outside reports; not confirmed by the provider",CONFLICTING:"Credible sources disagree; both sides kept",UNCONFIRMED:"One unofficial source or speculation. Not evidence",UNKNOWN:"Questions nobody can answer yet"};
export const icons={CONFIRMED:CheckCircle2,REPORTED:Info,CONFLICTING:AlertTriangle,UNCONFIRMED:CircleDashed,UNKNOWN:HelpCircle};
export const kinds:Record<Evidence['kind'],string>={provider_official:'Provider',internal:'Internal',downstream_company:'Other companies',community:'Community',monitor:'Monitors',press:'Press',private_channel:'Private channel'};
export function ClassPill({cls,count}:{cls:ClaimClass;count?:number}){const Icon=icons[cls];return <span className={`class-pill certainty-${cls.toLowerCase()}`} title={meanings[cls]}><Icon size={13}/>{cls}{count!==undefined&&<span>{count}</span>}</span>;}
export function ClaimChip({claim,id,onClick}:{claim?:Claim | undefined;id?:string | undefined;onClick:()=>void}){return <Button variant="ghost" size="sm" className={`citation certainty-${(claim?.class??'UNKNOWN').toLowerCase()}`} onClick={onClick}>{id??claim?.id}</Button>;}
export function Capped({claim}:{claim:Claim}){return claim.class!==claim.proposed_class?<span className="cap-badge"><ShieldAlert size={12}/>Capped: {title(claim.proposed_class)} → {title(claim.class)}</span>:null;}
export const title=(s:string)=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();
export function EmptyStage({jump}:{jump:()=>void}){return <div className="empty-stage"><div className="empty-diamond">◇</div><p>Stage data loads next.</p><Button variant="link" onClick={jump}>Jump to stage 4 →</Button></div>;}
