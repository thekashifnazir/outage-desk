import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouterState, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { stages } from '@/data/replay';
import { asosIncident } from './incident-data';
import type { Change, Claim, Draft, ResponseItem, Stage } from '@/data/replay/types';
import { savedRuns } from '@/astra/saved-runs';
import { astraCommunicate, astraExtract, astraReconcile, astraVerify } from '@/astra/steps.functions';
import type { StepTiming } from '@/astra/schemas';

export type RunStep = 'Extract' | 'Reconcile' | 'Policy check' | 'Communicate' | 'Verify';
export type LiveRun = { stage: number; generated_at: string; extractCount: number; fresh: number; total: number; ledger: Claim[]; changes: Change[]; drafts: Draft[]; pass: boolean; summary: { audience: string; policy_mode: string | null; verified: number; total: number }[]; timings: StepTiming[]; seconds: number };
export type RunState = { status: 'running'; step: RunStep; startedAt: number } | { status: 'done'; run: LiveRun } | { status: 'failed'; error: string; httpStatus: number | null };
export type Source = 'reference' | 'astra_saved' | 'astra_live';
type Replay = { isLive: boolean; setLive: (v: boolean) => void; deskStage: Stage; stage: Stage; reference: Stage; source: Source; playing: boolean; setPlaying: (v: boolean) => void; select: (n: number) => void; additions: Record<number, ResponseItem[]>; add: (r: Omit<ResponseItem, 'id'>) => void; run: string; runState: Record<number, RunState>; liveRuns: Record<number, LiveRun>; runStage: (n: number) => Promise<void> };
const Context = createContext<Replay | null>(null);

function withRun(base: Stage, ledger: Claim[], changes: Change[], drafts: Stage['drafts']): Stage {
 return { ...base, claims: ledger, changes, drafts };
}

/** Ledger the replay is currently showing for a stage: passed live run, passed saved run, or reference. */
function shown(n: number, live: Record<number, LiveRun>): { stage: Stage; source: Source } {
 const base = stages[n - 1] ?? stages[0];
 if (!base) throw new Error("Replay stages unavailable");
 const l = live[n];
 if (l) {
  const by = (a: string, m: string | null) => l.drafts.find(d => d.audience === a && d.policy_mode === m) ?? null;
  return { source: 'astra_live', stage: withRun(base, l.ledger, l.changes, { executive: by('executive', null), engineering: by('engineering', null), customer: { confirmed_only: by('customer', 'confirmed_only'), early_incident: by('customer', 'early_incident') ?? by('customer', 'confirmed_only') } }) };
 }
 const s = savedRuns[n - 1];
 if (s?.verifyPass && s.ledger && s.drafts && n < 9) return { source: 'astra_saved', stage: withRun(base, s.ledger, s.changes, { ...s.drafts, customer: { confirmed_only: s.drafts.customer.confirmed_only, early_incident: s.drafts.customer.early_incident ?? s.drafts.customer.confirmed_only } }) };
 return { source: 'reference', stage: base };
}

export function ReplayProvider({ children }: { children: ReactNode }) {
 const search = useRouterState({select: s => s.location.search}) as { stage?: number; run?: string | undefined };
 const navigate = useNavigate(); const n = Math.max(1, Math.min(9, Number(search.stage) || 1));
 const [isLive, setLiveState] = useState(false);
 const [liveRuns, setLiveRuns] = useState<Record<number, LiveRun>>({});
 const [runState, setRunState] = useState<Record<number, RunState>>({});
 const running = useRef(new Set<number>());
 const { stage, source } = shown(n, liveRuns);
 const reference = stages[n - 1] ?? stages[0];
 if (!reference) throw new Error("Replay stages unavailable");
 const [playing,setPlaying] = useState(false); const [additions,setAdditions] = useState<Record<number, ResponseItem[]>>({});
 const setLive = (v: boolean) => { setPlaying(false); setLiveState(v); if(v) void navigate({to:'/',search:{stage:n,run:search.run}}); };
 const extract = useServerFn(astraExtract), reconcile = useServerFn(astraReconcile), communicate = useServerFn(astraCommunicate), verify = useServerFn(astraVerify);
 const select = (next: number) => { if (next < 1 || next > 9) return; void navigate({to: '.', search: (old) => ({...old,stage:next})}); };
 useEffect(() => { if (!playing || isLive) return; if (n === 9) {setPlaying(false); return;} const id=setInterval(()=>select(n+1),5000); return ()=>clearInterval(id); },[playing,n,isLive]);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(isLive)return;if ((e.target as HTMLElement)?.closest('input,textarea,select,[role="dialog"]'))return;if(e.code==='Space'){e.preventDefault();setPlaying(v=>!v);}if(e.key==='ArrowRight')select(n+1);if(e.key==='ArrowLeft')select(n-1);};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[n,isLive]);
 const add=(r:Omit<ResponseItem,'id'>)=>setAdditions(old=>{const max=Math.max(0,...stages.flatMap(s=>s.response_items.map(r=>Number(r.id.slice(2)))),...Object.values(old).flat().map(r=>Number(r.id.slice(2))));return {...old,[n]:[...(old[n]??[]),{...r,id:`R-${max+1}`}]};});

 const runStage = async (k: number) => {
  if (k < 1 || k > 8 || running.current.has(k)) return;
  running.current.add(k);
  const startedAt = Date.now();
  const step = (s: RunStep) => setRunState(old => ({ ...old, [k]: { status: 'running', step: s, startedAt } }));
  const failed = (error: string, httpStatus: number | null) => setRunState(old => ({ ...old, [k]: { status: 'failed', error, httpStatus } }));
  try {
   step('Extract');
   const ex = await extract({ data: { stage: k } });
   if (!ex.ok) return failed(ex.error, ex.status);
   step('Reconcile');
   const previous = k === 1 ? [] : shown(k - 1, liveRuns).stage.claims;
   const rec = await reconcile({ data: { stage: k, previous, candidates: ex.claims } });
   if (!rec.ok) return failed(rec.error, rec.status);
   step('Communicate');
   const jobs = [['executive', null], ['engineering', null], ['customer', 'confirmed_only'], ['customer', 'early_incident']] as const;
   const drafts = await Promise.all(jobs.map(([audience, mode]) => communicate({ data: { stage: k, ledger: rec.ledger, audience, mode } })));
   const bad = drafts.find(d => !d.ok);
   if (bad && !bad.ok) return failed(bad.error, bad.status);
   step('Verify');
   const ok = drafts.flatMap(d => d.ok ? [d] : []);
   const ver = await verify({ data: { stage: k, ledger: rec.ledger, drafts: ok.map(d => d.draft) } });
   if (!ver.ok) return failed(ver.error, ver.status);
   const timings = [ex.timing, ...rec.timings, ...ok.map(d => d.timing), ...ver.timings];
   const run: LiveRun = { stage: k, generated_at: new Date().toISOString(), extractCount: ex.claims.length, fresh: ex.fresh, total: ex.total, ledger: rec.ledger, changes: rec.changes, drafts: ver.drafts, pass: ver.pass, summary: ver.summary, timings, seconds: (Date.now() - startedAt) / 1000 };
   setRunState(old => ({ ...old, [k]: { status: 'done', run } }));
   // Only a run that passes verify replaces what the replay shows (in memory only).
   if (run.pass) setLiveRuns(old => ({ ...old, [k]: run }));
  } catch (error) {
   failed(error instanceof Error ? error.message : 'GPT-6 Astra run failed', null);
  } finally { running.current.delete(k); }
 };

 return <Context.Provider value={{isLive,setLive,deskStage:isLive?asosIncident:stage,stage,reference,source,playing,setPlaying,select,additions,add,run:search.run??'',runState,liveRuns,runStage}}>{children}</Context.Provider>;
}
export function useReplay(){const value=useContext(Context);if(!value)throw new Error('Replay context unavailable');return value;}
export function replaySearch(input: Record<string,unknown>){return {stage:Math.max(1,Math.min(9,Number(input['stage'])||1)),run:typeof input['run']==='string'?input['run']:undefined};}
export const sourceLabel = (s: Source) => s === 'astra_live' ? 'GPT-6 Astra · live run' : s === 'astra_saved' ? 'GPT-6 Astra · saved run' : 'Reference data';
