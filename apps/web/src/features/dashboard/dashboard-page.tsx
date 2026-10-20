import { useMemo, useState } from 'react';
import { ArrowRight, Boxes, CheckCircle2, Clock3, FilePlus2, GitBranch, MoreHorizontal, Search, Users } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Badge, Button, SectionLabel } from '../../components/ui/primitives';
import { workspaceTypes } from '../../lib/mock-data';
import { templateBoard, type BoardTemplate } from '../../lib/board-templates';
import { useCanvasStore } from '../../stores/canvas-store';

export function DashboardPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const { boardNames, boardDocuments, createBoard } = useCanvasStore();

  const openTemplate = (template: BoardTemplate) => {
    const { title, objects } = templateBoard(template);
    const id = createBoard(title, objects);
    setShowTemplates(false);
    navigate({ to: '/board/$boardId', params: { boardId: id } });
  };

  const localBoards = useMemo(() => Object.entries(boardNames).map(([id, name]) => ({
    id, name, type: 'Whiteboard', description: 'Saved in this browser on this device.',
    updatedAt: 'Available offline', objectCount: boardDocuments[id]?.length ?? 0, accent: 'indigo',
  })), [boardDocuments, boardNames]);
  const recentBoards = useMemo(() => localBoards
    .filter((board) => `${board.name} ${board.description}`.toLowerCase().includes(search.toLowerCase())), [localBoards, search]);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="brand-lockup" onClick={() => navigate({ to: '/dashboard' })} role="button" tabIndex={0}>
          <span className="brand-mark"><span /><span /><span /></span>
          <span className="brand-name">codrawithm</span>
        </div>
        <div className="dashboard-top-actions">
          <a className="topbar-link" href="https://github.com/KanishJebaMathewM/Codrawithm/discussions"><Users size={15} /> Community</a>
          <a className="topbar-link" href="https://github.com/KanishJebaMathewM/Codrawithm/blob/main/docs/roadmap/product-roadmap.md"><GitBranch size={15} /> Roadmap</a>
          <span className="avatar avatar-indigo" aria-label="Personal workspace">YO</span>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-heading-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> Personal workspace · local only</div>
            <h1>Make the next idea visible.</h1>
            <p className="dashboard-subtitle">One canvas for diagrams, algorithms, and the systems you are still figuring out. Your boards stay in this browser.</p>
          </div>
          <div className="new-board-actions"><Button size="lg" onClick={() => openTemplate('blank')}><FilePlus2 size={17} /> New board <span className="button-shortcut">Ctrl N</span></Button><Button variant="outline" size="lg" onClick={() => setShowTemplates((value) => !value)}><Boxes size={17} /> Templates</Button>{showTemplates && <div className="template-menu" role="group" aria-label="Choose a starter board">{(['blank', 'flowchart', 'mind-map'] as BoardTemplate[]).map((template) => <button key={template} onClick={() => openTemplate(template)}>{template === 'blank' ? 'Blank canvas' : template === 'flowchart' ? 'Flowchart' : 'Mind map'}<span>{template === 'blank' ? 'Start fresh' : 'Editable starter shapes'}</span></button>)}</div>}</div>
        </div>

        <div className="workspace-section">
          <div className="section-heading-row">
            <div><SectionLabel>Start with a workspace</SectionLabel><h2>Choose the shape of your thinking</h2></div>
            <button className="text-button" onClick={() => openTemplate('blank')}>Open whiteboard <ArrowRight size={14} /></button>
          </div>
          <div className="workspace-grid">
            {workspaceTypes.filter((workspace) => workspace.name !== '3D Workspace').map((workspace) => (
              <button key={workspace.name} className={`workspace-card workspace-card-${workspace.tone}`} onClick={() => workspace.route === '/algorithm' ? navigate({ to: '/algorithm' }) : openTemplate('blank')}>
                <div className="workspace-card-top"><span className="workspace-icon">{workspace.icon}</span><ArrowRight size={17} className="workspace-arrow" /></div>
                <span className="workspace-eyebrow">{workspace.eyebrow}</span>
                <strong>{workspace.name}</strong>
                <span className="workspace-description">{workspace.description}</span>
              </button>
            ))}
          </div>
        </div>

        <section className="recent-section">
          <div className="section-heading-row"><div><SectionLabel>Recent work</SectionLabel><h2>Pick up where you left off</h2></div><div className="search-field"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search boards" aria-label="Search boards" /></div></div>
          <div className="recent-table">
            <div className="recent-table-head"><span>Board</span><span>Workspace</span><span>Objects</span><span>Storage</span><span /></div>
            {recentBoards.length ? recentBoards.map((board) => (
              <button className="recent-row" key={board.id} onClick={() => board.type === 'Algorithm Lab' ? navigate({ to: '/algorithm' }) : navigate({ to: '/board/$boardId', params: { boardId: board.id } })}>
                <span className="recent-board-name"><span className={`board-dot board-dot-${board.accent}`} /><span><strong>{board.name}</strong><small>{board.description}</small></span></span>
                <span><Badge tone={board.accent === 'amber' ? 'warning' : board.accent === 'violet' ? 'violet' : 'info'}>{board.type}</Badge></span>
                <span className="mono-text">{board.objectCount}</span>
                <span className="recent-updated"><Clock3 size={14} /> {board.updatedAt}</span>
                <MoreHorizontal size={17} className="row-more" />
              </button>
            )) : <p className="empty-boards">No boards match “{search}”. Create a board to get started.</p>}
          </div>
        </section>

        <div className="dashboard-footer-note"><CheckCircle2 size={15} /> Local-only mode <span>•</span> saved on this device <span>•</span> no account or sync</div>
      </section>
    </main>
  );
}
