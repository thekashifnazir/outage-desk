import { createFileRoute } from '@tanstack/react-router';
import { Analysis } from '@/components/desk/analysis';
import { replaySearch } from '@/components/desk/replay-context';
export const Route=createFileRoute('/analysis')({validateSearch:replaySearch,head:()=>({meta:[{title:'Analysis — Outage Desk'},{name:'description',content:'Inspect the extraction, reconciliation, provenance caps and verification for each replay stage.'},{property:'og:title',content:'Analysis — Outage Desk'},{property:'og:description',content:'Check the incident claim ledger against the golden replay and provenance rules.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Analysis});
