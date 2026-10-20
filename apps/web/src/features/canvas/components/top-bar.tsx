import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Download, Eye, FilePlus2, LayoutGrid, LogIn, MessageCircle, PanelRight, Redo2, Share2, Settings2, Sparkles, Undo2, Upload, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Badge, Button, Divider } from '../../../components/ui/primitives';
import { downloadBoardJson, downloadBoardSvg, parseBoardDocument } from '../../../lib/export';
import { useCanvasStore } from '../../../stores/canvas-store';
import type { BoardDocument } from '../../../types';

export function TopBar() {
  const [copied, setCopied] = useState(false);
  const [importPreview, setImportPreview] = useState<{ document: BoardDocument; filename: string } | null>(null);
  const [importError, setImportError] = useState('');
  const [showSignInInfo, setShowSignInInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const canUndo = useCanvasStore((state) => state.past.length > 0);
  const canRedo = useCanvasStore((state) => state.future.length > 0);
  const lastSaved = useCanvasStore((state) => state.lastSaved);
  const { boardName, boardId, objects, saveState, selectedIds, boardNames, showMinimap, gridVisible, toggleProperties, toggleMinimap, toggleGrid, toggleAiPanel, undo, redo, createBoard } = useCanvasStore();

  useEffect(() => {
    const openImport = () => fileInputRef.current?.click();
    window.addEventListener('codrawithm:import-json', openImport);
    return () => window.removeEventListener('codrawithm:import-json', openImport);
  }, []);

  const readImport = async (file?: File) => {
    setImportError(''); setImportPreview(null);
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setImportError('This JSON file exceeds the 50 MB import limit.'); return; }
    try { setImportPreview({ document: parseBoardDocument(JSON.parse(await file.text())), filename: file.name }); }
    catch (error) { setImportError(error instanceof Error ? error.message : 'This file could not be read as a Codrawithm board.'); }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    const id = createBoard(importPreview.document.title, importPreview.document.objects);
    setImportPreview(null);
    navigate({ to: '/board/$boardId', params: { boardId: id } });
  };
  const newBoard = () => { const id = createBoard('Untitled board'); navigate({ to: '/board/$boardId', params: { boardId: id } }); };

  return <>
    <header className="editor-topbar">
      <div className="topbar-left">
        <div className="topbar-brand"><span className="brand-mark"><span /><span /><span /></span><strong>codrawithm</strong></div>
        <Divider vertical />
        <details className="board-switcher"><summary className="board-switcher-trigger"><span className="topbar-crumb-label">Board</span><strong>{boardName}</strong><ChevronDown size={13} /></summary><div className="board-switcher-menu"><button onClick={newBoard}><FilePlus2 size={14} /> New board</button><div className="board-list-label">Your local boards</div>{Object.entries(boardNames).map(([id, name]) => <button key={id} className={id === boardId ? 'is-current' : ''} onClick={() => navigate({ to: '/board/$boardId', params: { boardId: id } })}><span className="board-menu-dot" />{name}</button>)}</div></details>
        <div className="board-title-pill"><span className="status-pulse" />{saveState === 'saved' ? `Saved ${lastSaved}` : saveState === 'saving' ? 'Saving…' : 'Unsaved changes'}</div>
      </div>
      <div className="topbar-center"><Badge tone="info">Whiteboard</Badge><span className="collab-status"><span className="live-dot" />Local-only</span></div>
      <div className="topbar-right">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/algorithm' })} title="Open algorithm visualizations"><BookOpen size={15} /> Visualize</Button>
        <Button variant="ghost" size="sm" onClick={toggleAiPanel} title="Open AI Studio"><Sparkles size={15} /> AI Studio</Button>
        <div className="history-actions"><button className="icon-button" aria-label="Undo" onClick={undo} disabled={!canUndo}><Undo2 size={16} /></button><button className="icon-button" aria-label="Redo" onClick={redo} disabled={!canRedo}><Redo2 size={16} /></button></div>
        <Divider vertical />
        <div className="topbar-dropdown"><details><summary className="icon-button" aria-label="Settings" title="Settings"><Settings2 size={16} /></summary><div className="settings-dropdown"><strong>Canvas settings</strong><label><span><Eye size={14} /> Show overview</span><input type="checkbox" checked={showMinimap} onChange={toggleMinimap} /></label><label><span><LayoutGrid size={14} /> Show grid</span><input type="checkbox" checked={gridVisible} onChange={toggleGrid} /></label><button onClick={toggleProperties}><PanelRight size={14} /> {selectedIds.length ? 'Object inspector' : 'Board appearance'}</button></div></details></div>
        <div className="export-menu"><details><summary className="ui-button ui-button-ghost ui-button-sm"><Download size={15} /> Export <ChevronDown size={13} /></summary><div className="export-menu-items"><button onClick={() => downloadBoardJson(boardId, boardName, objects)}>Codrawithm JSON</button><button onClick={() => downloadBoardSvg(boardName, objects)}>SVG</button><button onClick={() => window.dispatchEvent(new Event('codrawithm:export-png'))}>PNG · 2×</button><button onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Import JSON…</button></div></details><input ref={fileInputRef} hidden type="file" accept=".json,application/json" onChange={(event) => { const input = event.currentTarget; const file = input.files?.[0]; input.value = ''; void readImport(file); }} /></div>
        <button className={`icon-button ${selectedIds.length ? 'is-active' : ''}`} aria-label="Toggle inspector" onClick={toggleProperties}><PanelRight size={16} /></button>
        <Button variant="outline" size="sm" onClick={() => setShowSignInInfo(true)}><LogIn size={14} /> Sign in</Button>
      </div>
    </header>
    {(importPreview || importError || showSignInInfo) && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setImportPreview(null); setImportError(''); setShowSignInInfo(false); } }}><section className="import-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="import-dialog-head"><div><span className="eyebrow">{showSignInInfo ? 'Account & sync' : 'Local file import'}</span><h2 id="dialog-title">{showSignInInfo ? 'Sign-in is not connected yet' : importPreview ? 'Review this board' : 'Import could not be completed'}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={() => { setImportPreview(null); setImportError(''); setShowSignInInfo(false); }}><X size={17} /></button></div>{showSignInInfo ? <><p>Sign-in and cloud sync are planned for a future release. Your boards are saved only in this browser on this device; they are not uploaded.</p><div className="import-dialog-actions"><Button onClick={() => setShowSignInInfo(false)}>Continue locally</Button></div></> : importPreview ? <><p><strong>{importPreview.document.title}</strong> will be added as a new board. The current board will not be replaced.</p><dl><div><dt>File</dt><dd>{importPreview.filename}</dd></div><div><dt>Objects</dt><dd>{importPreview.document.objects.length}</dd></div></dl><div className="import-dialog-actions"><Button variant="outline" onClick={() => setImportPreview(null)}>Cancel</Button><Button onClick={confirmImport}>Import as new board</Button></div></> : <><p className="import-error">{importError}</p><div className="import-dialog-actions"><Button variant="outline" onClick={() => { setImportPreview(null); setImportError(''); }}>Close</Button><Button onClick={() => fileInputRef.current?.click()}>Choose another file</Button></div></>}</section></div>}
  </>;
}
