import { Maximize2 } from 'lucide-react';
import { useCanvasStore } from '../../../stores/canvas-store';

export function Minimap() {
  const { objects, showMinimap, viewport, setViewport } = useCanvasStore();
  if (!showMinimap) return null;
  return <div className="minimap"><div className="minimap-header"><span>Overview</span><button aria-label="Fit canvas" onClick={() => setViewport({ x: 0, y: 0, zoom: 0.86 })}><Maximize2 size={12} /></button></div><div className="minimap-canvas"><div className="minimap-viewport" style={{ left: `${30 - viewport.x / 80}%`, top: `${30 - viewport.y / 60}%` }} />{objects.map((object) => <span key={object.id} className={`minimap-object minimap-${object.type}`} style={{ left: `${object.x / 12}%`, top: `${object.y / 7}%`, width: `${Math.max(4, object.width / 18)}%`, height: `${Math.max(3, object.height / 12)}%`, background: object.stroke }} />)}</div></div>;
}
