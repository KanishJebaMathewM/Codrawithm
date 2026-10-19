import { useState } from 'react';
import { ChevronDown, Download, Home, MessageCircle, PanelRight, Share2, Sparkles, Undo2, Redo2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Badge, Button, Divider } from '../../../components/ui/primitives';
import { collaborators } from '../../../lib/mock-data';
import { downloadBoardJson } from '../../../lib/export';
import { useCanvasStore } from '../../../stores/canvas-store';

export function TopBar() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { boardName, boardId, objects, saveState, selectedIds, showAiPanel, toggleAiPanel, toggleProperties, undo, redo } = useCanvasStore();
  return <header className="editor-topbar">
    <div className="topbar-left">
      <button className="icon-button" aria-label="Back to workspaces" onClick={() => navigate({ to: '/' })}><Home size={16} /></button>
      <Divider vertical />
      <div className="breadcrumb"><span>Workspace</span><ChevronDown size={13} /><strong>{boardName}</strong></div>
      <div className="board-title-pill"><span className="status-pulse" /> {saveState === 'saved' ? 'Saved' : 'Unsaved changes'}</div>
    </div>
    <div className="topbar-center"><Badge tone="info">Whiteboard</Badge><span className="collab-status"><span className="live-dot" /> Shared locally</span></div>
    <div className="topbar-right">
      <div className="history-actions"><button className="icon-button" aria-label="Undo" onClick={undo} disabled={!useCanvasStore.getState().past.length}><Undo2 size={16} /></button><button className="icon-button" aria-label="Redo" onClick={redo} disabled={!useCanvasStore.getState().future.length}><Redo2 size={16} /></button></div>
      <div className="avatar-stack">{collaborators.map((collaborator) => <span key={collaborator.id} className="avatar" style={{ background: collaborator.color }} title={collaborator.name}>{collaborator.initials}</span>)}</div>
      <Divider vertical />
      <Button variant="ghost" size="sm" onClick={toggleAiPanel}><Sparkles size={15} /> AI</Button>
      <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }}><Share2 size={15} /> {copied ? 'Copied' : 'Share'}</Button>
      <div className="export-menu"><Button variant="ghost" size="sm" onClick={() => downloadBoardJson(boardId, boardName, objects)}><Download size={15} /> Export <ChevronDown size={13} /></Button></div>
      <button className={`icon-button ${selectedIds.length ? 'is-active' : ''}`} aria-label="Toggle properties" onClick={toggleProperties}><PanelRight size={16} /></button>
      <button className="icon-button" aria-label="Comments"><MessageCircle size={16} /></button>
      <span className="avatar avatar-indigo">AK</span>
    </div>
  </header>;
}
