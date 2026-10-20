import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { useCanvasStore } from '../../stores/canvas-store';
import { TopBar } from './components/top-bar';
import { ToolPalette } from './components/tool-palette';
import { PropertiesPanel } from './components/properties-panel';
import { StatusBar } from './components/status-bar';
import { AiPanel } from './components/ai-panel';
import { Minimap } from './components/minimap';
import { CanvasStage } from './components/canvas-stage';

export function BoardPage() {
  const { boardId } = useParams({ from: '/board/$boardId' });
  const setBoard = useCanvasStore((state) => state.setBoard);
  const saveState = useCanvasStore((state) => state.saveState);
  const markSaved = useCanvasStore((state) => state.markSaved);
  useEffect(() => { setBoard(boardId, boardId === 'new' ? 'Untitled board' : undefined); }, [boardId, setBoard]);
  useEffect(() => {
    if (saveState !== 'unsaved') return;
    const timeout = window.setTimeout(markSaved, 450);
    return () => window.clearTimeout(timeout);
  }, [saveState, markSaved]);
  return <main className="editor-shell"><TopBar /><div className="editor-main"><div className="canvas-column"><ToolPalette /><CanvasStage /><Minimap /></div><PropertiesPanel /><AiPanel /></div><StatusBar /></main>;
}
