import { createFileRoute } from '@tanstack/react-router';
import { Desk } from '@/components/desk/desk';
import { replaySearch } from '@/components/desk/replay-context';
export const Route=createFileRoute('/')({validateSearch:replaySearch,head:()=>({meta:[{title:'Outage Desk — Incident communications'},{name:'description',content:'Evidence, certainty-labelled claims and verified incident updates for Northwind.'},{property:'og:title',content:'Outage Desk — Incident communications'},{property:'og:description',content:'Replay the June 2025 cloud outage with traceable claims and communications.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Desk});
