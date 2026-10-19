import { ArrowRight, Boxes, CheckCircle2, Clock3, FilePlus2, GitBranch, LayoutDashboard, MoreHorizontal, Search, Sparkles, Users } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Badge, Button, SectionLabel } from '../../components/ui/primitives';
import { boardSummaries, workspaceTypes } from '../../lib/mock-data';

export function DashboardPage() {
  const navigate = useNavigate();
  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="brand-lockup" onClick={() => navigate({ to: '/' })} role="button" tabIndex={0}>
          <span className="brand-mark"><span /><span /><span /></span>
          <span className="brand-name">codrawithm</span>
        </div>
        <div className="dashboard-top-actions">
          <button className="topbar-link"><Users size={15} /> Community</button>
          <button className="topbar-link"><GitBranch size={15} /> Roadmap</button>
          <span className="avatar avatar-indigo">AK</span>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> Personal workspace</div>
            <h1>Make the next idea visible.</h1>
            <p className="dashboard-subtitle">One canvas for diagrams, algorithms, and the systems you are still figuring out.</p>
          </div>
          <Button size="lg" onClick={() => navigate({ to: '/board/$boardId', params: { boardId: 'new' } })}><FilePlus2 size={17} /> New board <span className="button-shortcut">⌘ N</span></Button>
        </div>

        <div className="workspace-section">
          <div className="section-heading-row">
            <div><SectionLabel>Start with a workspace</SectionLabel><h2>Choose the shape of your thinking</h2></div>
            <button className="text-button">View all <ArrowRight size={14} /></button>
          </div>
          <div className="workspace-grid">
            {workspaceTypes.map((workspace) => (
              <button key={workspace.name} className={`workspace-card workspace-card-${workspace.tone}`} onClick={() => workspace.route === '/algorithm' ? navigate({ to: '/algorithm' }) : navigate({ to: '/board/$boardId', params: { boardId: workspace.route.split('/').pop() ?? 'new' } })}>
                <div className="workspace-card-top"><span className="workspace-icon">{workspace.icon}</span><ArrowRight size={17} className="workspace-arrow" /></div>
                <span className="workspace-eyebrow">{workspace.eyebrow}</span>
                <strong>{workspace.name}</strong>
                <span className="workspace-description">{workspace.description}</span>
              </button>
            ))}
          </div>
        </div>

        <section className="recent-section">
          <div className="section-heading-row"><div><SectionLabel>Recent work</SectionLabel><h2>Pick up where you left off</h2></div><div className="search-field"><Search size={15} /><input placeholder="Search boards" aria-label="Search boards" /></div></div>
          <div className="recent-table">
            <div className="recent-table-head"><span>Board</span><span>Workspace</span><span>Objects</span><span>Last edited</span><span /></div>
            {boardSummaries.map((board) => (
              <button className="recent-row" key={board.id} onClick={() => board.type === 'Algorithm Lab' ? navigate({ to: '/algorithm' }) : navigate({ to: '/board/$boardId', params: { boardId: board.id } })}>
                <span className="recent-board-name"><span className={`board-dot board-dot-${board.accent}`} /><span><strong>{board.name}</strong><small>{board.description}</small></span></span>
                <span><Badge tone={board.accent === 'amber' ? 'warning' : board.accent === 'violet' ? 'violet' : 'info'}>{board.type}</Badge></span>
                <span className="mono-text">{board.objectCount}</span>
                <span className="recent-updated"><Clock3 size={14} /> {board.updatedAt}</span>
                <MoreHorizontal size={17} className="row-more" />
              </button>
            ))}
          </div>
        </section>

        <div className="dashboard-footer-note"><CheckCircle2 size={15} /> Local prototype mode <span>•</span> changes save to this browser</div>
      </section>
    </main>
  );
}
