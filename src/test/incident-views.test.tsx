import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { stage9 } from '@/data/replay/stage-9';
import { asosEvidence } from '@/data/live/asos';
import savedAsos from '@/data/saved-runs/live-asos.json';
import { asosIncident, capturedTime, incidentTime } from '@/components/desk/incident-data';
import { PostIncidentChecks, PostIncidentDraft, PostIncidentReports } from '@/components/desk/post-incident';

const props = { stage: stage9, openClaim: () => {}, openSource: () => {}, openResponse: () => {} };
describe('Post-incident presentation', () => {
 it('renders provider reports, story changes and statement verification from stage 9', () => {
  const reports = renderToStaticMarkup(<PostIncidentReports {...props}/>);
  const checks = renderToStaticMarkup(<PostIncidentChecks {...props}/>);
  expect(reports).toContain('Google full incident report');
  expect(reports).toContain('invalid automated quota update');
  expect(checks).toContain('How the story changed');
  expect(checks).toContain('7/7 still hold');
  expect(checks).toContain('R-24');
  expect(checks).toContain('Move our external monitoring off Google Cloud');
  expect(reports + checks).not.toContain('loads next');
 });
 it('renders all three existing drafts with citations', () => {
  for (const draft of [stage9.drafts.executive, stage9.drafts.engineering, stage9.drafts.customer.confirmed_only]) {
   expect(draft).not.toBeNull();
   if (!draft) continue;
   const html = renderToStaticMarkup(<PostIncidentDraft {...props} draft={draft} footer={<span>Copy</span>}/>);
   expect(html).toContain(draft.sections[0]?.heading);
   expect(html).toContain('C-028');
    expect(html).toContain('Key facts used');
    expect(html).toContain('class-pill certainty-confirmed');
   expect(html).not.toContain('loads next');
  }
 });
});
describe('Separate ASOS presentation adapter', () => {
 it('uses the saved capped ledger and live evidence without creating drafts or actions', () => {
  expect(asosIncident.claims).toEqual(savedAsos.capped_ledger);
  expect(asosIncident.evidence).toEqual(asosEvidence);
  expect(asosIncident.response_items).toEqual([]);
  expect(asosIncident.drafts.executive).toBeNull();
  expect(asosIncident.drafts.engineering).toBeNull();
  expect(asosIncident.drafts.customer.confirmed_only).toBeNull();
  expect(asosIncident.stage).toBe(0);
  expect(capturedTime).toBe('17:00');
  expect(incidentTime(asosIncident.at,true)).toBe('17:00 BST');
 });
});