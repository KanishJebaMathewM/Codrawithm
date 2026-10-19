import { useState } from 'react';
import { Circle, Diamond, Eraser, Frame, Hand, Highlighter, MousePointer2, PenLine, Pencil, Plus, RectangleHorizontal, Square, StickyNote, Type, Waypoints, ZoomIn } from 'lucide-react';
import { Button, Divider, SectionLabel } from '../../../components/ui/primitives';
import { useCanvasStore } from '../../../stores/canvas-store';
import type { ToolId } from '../../../types';

const groups: { label: string; tools: { id: ToolId; label: string; shortcut?: string; icon: typeof MousePointer2 }[] }[] = [
  { label: 'Navigate', tools: [{ id: 'select', label: 'Select', shortcut: 'V', icon: MousePointer2 }, { id: 'hand', label: 'Pan canvas', shortcut: 'H', icon: Hand }, { id: 'zoom', label: 'Zoom', shortcut: 'Z', icon: ZoomIn }] },
  { label: 'Draw', tools: [{ id: 'pen', label: 'Pen', shortcut: 'P', icon: Pencil }, { id: 'line', label: 'Line', shortcut: 'L', icon: PenLine }, { id: 'arrow', label: 'Arrow', shortcut: 'A', icon: Waypoints }, { id: 'connector', label: 'Connector', shortcut: 'X', icon: Waypoints }] },
  { label: 'Shape', tools: [{ id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: RectangleHorizontal }, { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: Circle }, { id: 'diamond', label: 'Diamond', shortcut: 'D', icon: Diamond }] },
  { label: 'Content', tools: [{ id: 'text', label: 'Text', shortcut: 'T', icon: Type }, { id: 'sticky', label: 'Sticky note', shortcut: 'N', icon: StickyNote }, { id: 'frame', label: 'Frame', shortcut: 'F', icon: Frame }, { id: 'code', label: 'Code block', icon: Square }] },
];

export function ToolPalette() {
  const [collapsed, setCollapsed] = useState(false);
  const { activeTool, setTool, toggleGrid, gridVisible } = useCanvasStore();
  return <aside className={`tool-palette ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="palette-heading"><span className="palette-kicker">Tools</span><button className="palette-collapse" aria-label={collapsed ? 'Expand tool palette' : 'Collapse tool palette'} onClick={() => setCollapsed((value) => !value)}><Plus size={14} /></button></div>
    {groups.map((group) => <div className="tool-group" key={group.label}><SectionLabel>{group.label}</SectionLabel>{group.tools.map(({ id, label, shortcut, icon: Icon }) => <button key={id} className={`tool-button ${activeTool === id ? 'is-active' : ''}`} onClick={() => setTool(id)} aria-label={`${label}${shortcut ? ` (${shortcut})` : ''}`} title={`${label}${shortcut ? ` · ${shortcut}` : ''}`}><Icon size={18} strokeWidth={1.7} /><span>{label}</span>{shortcut && <kbd>{shortcut}</kbd>}</button>)}</div>)}
    <Divider />
    <button className="tool-button" onClick={() => setTool('eraser')}><Eraser size={18} strokeWidth={1.7} /><span>Eraser</span><kbd>E</kbd></button>
    <button className={`tool-button ${gridVisible ? 'is-active-soft' : ''}`} onClick={toggleGrid}><Highlighter size={18} strokeWidth={1.7} /><span>Grid</span></button>
    <div className="palette-footer"><span className="swatch swatch-indigo" /><span className="swatch swatch-violet" /><span className="stroke-size">2 px</span></div>
  </aside>;
}
