import { useState } from 'react';
import { ArrowRight, Circle, Code2, Diamond, Eraser, Frame, Hand, Image, Minus, MousePointer2, PenLine, Pencil, Plus, Square, Star, StickyNote, Triangle, Type, ZoomIn } from 'lucide-react';
import { useCanvasStore } from '../../../stores/canvas-store';
import type { ToolId } from '../../../types';

const PALETTE = ['#4f46e5', '#0f766e', '#0891b2', '#db2777', '#f97316', '#334155'];
const toolGroups: { title: string; tools: { id: ToolId; label: string; shortcut?: string; icon: typeof MousePointer2 }[] }[] = [
  { title: 'Navigate', tools: [{ id: 'select', label: 'Select', shortcut: 'V', icon: MousePointer2 }, { id: 'hand', label: 'Pan canvas', shortcut: 'H', icon: Hand }, { id: 'zoom', label: 'Zoom tool', shortcut: 'Z', icon: ZoomIn }] },
  { title: 'Draw', tools: [{ id: 'pen', label: 'Freehand pen', shortcut: 'P', icon: Pencil }, { id: 'line', label: 'Line', shortcut: 'L', icon: Minus }, { id: 'arrow', label: 'Arrow', shortcut: 'A', icon: ArrowRight }, { id: 'connector', label: 'Connector', shortcut: 'X', icon: PenLine }, { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: Eraser }] },
  { title: 'Shapes', tools: [{ id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: Square }, { id: 'rounded-rectangle', label: 'Rounded rectangle', icon: Square }, { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: Circle }, { id: 'diamond', label: 'Diamond', shortcut: 'D', icon: Diamond }, { id: 'triangle', label: 'Triangle', icon: Triangle }, { id: 'star', label: 'Star', icon: Star }] },
  { title: 'Content', tools: [{ id: 'text', label: 'Text', shortcut: 'T', icon: Type }, { id: 'sticky', label: 'Sticky note', shortcut: 'N', icon: StickyNote }, { id: 'frame', label: 'Frame', shortcut: 'F', icon: Frame }, { id: 'code', label: 'Code block', shortcut: 'C', icon: Code2 }] },
];

export function ToolPalette() {
  const { activeTool, setTool, currentColor, currentFill, setCurrentColor, setCurrentFill } = useCanvasStore();
  const [expanded, setExpanded] = useState(true);
  return <aside className="floating-toolbar" aria-label="Canvas tools">
    <div className="toolbar-brand"><span className="brand-mark"><span /><span /><span /></span><button className="toolbar-collapse" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? 'Collapse tool groups' : 'Expand tool groups'}>{expanded ? <Minus size={15} /> : <Plus size={15} />}</button></div>
    <div className="toolbar-scroll-area">
      {toolGroups.map((group) => <section className="toolbar-group" key={group.title} aria-label={group.title}>
        {expanded && <span className="toolbar-group-label">{group.title}</span>}
        <div className="toolbar-group-tools">{group.tools.map(({ id, label, shortcut, icon: Icon }) => <div className="toolbar-item" key={id}>
          <button className={`toolbar-btn ${activeTool === id ? 'is-active' : ''}`} onClick={() => setTool(id)} title={`${label}${shortcut ? ` (${shortcut})` : ''}`} aria-label={`${label}${shortcut ? ` (${shortcut})` : ''}`} aria-pressed={activeTool === id}>
            <Icon size={18} strokeWidth={1.8} />{expanded && <span className="toolbar-tool-name">{label}</span>}{shortcut && expanded && <kbd>{shortcut}</kbd>}
          </button>
          <div className="tool-color-popover" role="group" aria-label={`${label} color`}><span>Stroke</span>{PALETTE.map((color) => <button key={color} title={`Set stroke ${color}`} aria-label={`Set stroke ${color}`} className={`palette-dot ${currentColor === color ? 'is-chosen' : ''}`} style={{ background: color }} onClick={() => setCurrentColor(color)} />)}<label title="Custom stroke color"><input type="color" value={currentColor} onChange={(event) => setCurrentColor(event.target.value)} /></label></div>
        </div>)}</div>
      </section>)}
    </div>
    <div className="toolbar-style-controls"><label className="toolbar-color-control" title="Set active stroke color"><span className="toolbar-color-label">Stroke</span><input type="color" value={currentColor} onChange={(event) => setCurrentColor(event.target.value)} /><span className="color-circle" style={{ background: currentColor }} /></label><label className="toolbar-color-control" title="Set active fill color"><span className="toolbar-color-label">Fill</span><input type="color" value={currentFill === 'transparent' ? '#ffffff' : currentFill} onChange={(event) => setCurrentFill(event.target.value)} /><span className="fill-swatch" style={{ background: currentFill === 'transparent' ? '#fff' : currentFill }} /></label><button className="toolbar-transparent" onClick={() => setCurrentFill('transparent')} title="No fill">No fill</button><button className="toolbar-image-tool" title="Image import is coming soon" disabled><Image size={15} /> Image</button></div>
  </aside>;
}
