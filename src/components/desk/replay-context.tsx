import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouterState, useNavigate } from '@tanstack/react-router';
import { stages } from '@/data/replay';
import type { ResponseItem, Stage } from '@/data/replay/types';
type Replay = { stage: Stage; playing: boolean; setPlaying: (v: boolean) => void; select: (n: number) => void; additions: Record<number, ResponseItem[]>; add: (r: Omit<ResponseItem, 'id'>) => void; run: string };
const Context = createContext<Replay | null>(null);
export function ReplayProvider({ children }: { children: ReactNode }) {
 const search = useRouterState({select: s => s.location.search}) as { stage?: number; run?: string };
 const navigate = useNavigate(); const n = Math.max(1, Math.min(9, Number(search.stage) || 1)); const stage = stages[n - 1] ?? stages[0];
 const [playing,setPlaying] = useState(false); const [additions,setAdditions] = useState<Record<number, ResponseItem[]>>({});
 const select = (next: number) => { if (next < 1 || next > 9) return; void navigate({to: '.', search: (old: {stage?: number;run?: string}) => ({...old,stage:next})}); };
 useEffect(() => { if (!playing) return; if (n === 9) {setPlaying(false); return;} const id=setInterval(()=>select(n+1),5000); return ()=>clearInterval(id); },[playing,n]);
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if ((e.target as HTMLElement)?.closest('input,textarea,select,[role="dialog"]'))return;if(e.code==='Space'){e.preventDefault();setPlaying(v=>!v);}if(e.key==='ArrowRight')select(n+1);if(e.key==='ArrowLeft')select(n-1);};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[n]);
 const add=(r:Omit<ResponseItem,'id'>)=>setAdditions(old=>{const max=Math.max(0,...stages.flatMap(s=>s.response_items.map(r=>Number(r.id.slice(2)))),...Object.values(old).flat().map(r=>Number(r.id.slice(2))));return {...old,[n]:[...(old[n]??[]),{...r,id:`R-${max+1}`}]};});
 return <Context.Provider value={{stage,playing,setPlaying,select,additions,add,run:search.run??''}}>{children}</Context.Provider>;
}
export function useReplay(){const value=useContext(Context);if(!value)throw new Error('Replay context unavailable');return value;}
export function replaySearch(input: Record<string,unknown>){return {stage:Math.max(1,Math.min(9,Number(input.stage)||1)),run:typeof input.run==='string'?input.run:undefined};}
