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
  const markSaved = useCanvasStore((state) => state.markSaved);
  useEffect(() => { setBoard(boardId, boardId === 'new' ? 'Untitled board' : boardId === 'api-review' ? 'API review board' : boardId === 'system-map' ? 'Distributed system map' : 'Untitled board'); }, [boardId, setBoard]);
  useEffect(() => { const interval = window.setInterval(markSaved, 5000); return () => window.clearInterval(interval); }, [markSaved]);
  return <main className="editor-shell"><TopBar /><div className="editor-main"><ToolPalette /><div className="canvas-column"><CanvasStage /><Minimap /></div><PropertiesPanel /><AiPanel /></div><StatusBar /></main>;
}
