import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Zap, LayoutList, FlaskConical, FileCheck2, Radio, PanelLeftClose, PanelLeftOpen, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReplay } from './replay-context';

export function DeskSidebar() {
 const { stage, run, isLive, setLive } = useReplay();
 const pathname = useRouterState({ select: state => state.location.pathname });
 const [collapsed, setCollapsed] = useState(false);
 const search = { stage: stage.stage, run: run || undefined };
 return <aside className={`desk-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Desk sidebar">
  <div className="sidebar-brand"><Zap size={21} fill="currentColor"/><span>Outage Desk</span></div>
  <Button className="sidebar-toggle" variant="ghost" size="icon" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}</Button>
  <nav aria-label="Main navigation">
   <Button asChild variant="ghost" className={!isLive && pathname === '/' && stage.stage !== 9 ? 'selected' : ''}><Link to="/" search={search} onClick={() => setLive(false)} title="Desk"><LayoutList size={18}/><span>Desk</span></Link></Button>
   <Button asChild variant="ghost" className={pathname === '/analysis' ? 'selected' : ''}><Link to="/analysis" search={search} onClick={() => setLive(false)} title="Analysis"><FlaskConical size={18}/><span>Analysis</span></Link></Button>
   <Button asChild variant="ghost" className={!isLive && pathname === '/' && stage.stage === 9 ? 'selected' : ''}><Link to="/" search={{ ...search, stage: 9 }} onClick={() => setLive(false)} title="Post-incident"><FileCheck2 size={18}/><span>Post-incident</span></Link></Button>
   <Button variant="ghost" className={isLive ? 'selected' : ''} aria-pressed={isLive} title="Live · ASOS" onClick={() => setLive(true)}><Radio size={18}/><span>Live · ASOS</span></Button>
  </nav>
  <div className="sidebar-replay" title="Replay · 12 Jun 2025"><History size={16}/><span>Replay · 12 Jun 2025</span></div>
 </aside>;
}