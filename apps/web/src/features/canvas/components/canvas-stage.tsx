import { useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, Circle, Ellipse, Group, Layer, Line, Rect, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { collaborators } from '../../../lib/mock-data';
import { useCanvasStore } from '../../../stores/canvas-store';
import type { CanvasObject, ToolId } from '../../../types';

const GRID_SIZE = 40;

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 900, height: 640 });
  const { objects, selectedIds, activeTool, viewport, gridVisible, select, selectMany, addObject, updateObject, zoomBy, setViewport } = useCanvasStore();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setSize({ width: element.clientWidth, height: element.clientHeight }));
    observer.observe(element);
    setSize({ width: element.clientWidth, height: element.clientHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;
      const key = event.key.toLowerCase();
      const shortcuts: Record<string, ToolId> = { v: 'select', h: 'hand', z: 'zoom', p: 'pen', l: 'line', a: 'arrow', x: 'connector', r: 'rectangle', o: 'ellipse', d: 'diamond', t: 'text', n: 'sticky', f: 'frame', e: 'eraser' };
      if (event.key === 'Delete' || event.key === 'Backspace') { useCanvasStore.getState().deleteSelected(); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'z') { event.preventDefault(); event.shiftKey ? useCanvasStore.getState().redo() : useCanvasStore.getState().undo(); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'd') { event.preventDefault(); useCanvasStore.getState().duplicateSelected(); return; }
      if (!event.metaKey && !event.ctrlKey && shortcuts[key]) useCanvasStore.getState().setTool(shortcuts[key]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const gridLines = useMemo(() => {
    if (!gridVisible) return [];
    const lines = [];
    for (let x = -1200; x <= 2400; x += GRID_SIZE) lines.push(<Line key={`v-${x}`} points={[x, -900, x, 1800]} stroke="#e8ebf3" strokeWidth={1} dash={[1, 5]} listening={false} />);
    for (let y = -900; y <= 1800; y += GRID_SIZE) lines.push(<Line key={`h-${y}`} points={[-1200, y, 2400, y]} stroke="#e8ebf3" strokeWidth={1} dash={[1, 5]} listening={false} />);
    return lines;
  }, [gridVisible]);

  const toWorld = (stage: Konva.Stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    return { x: (pointer.x - viewport.x) / viewport.zoom, y: (pointer.y - viewport.y) / viewport.zoom };
  };

  const addForTool = (tool: ToolId, point: { x: number; y: number }) => {
    const common = { x: point.x - 72, y: point.y - 42, width: 144, height: 84, rotation: 0, stroke: '#6366f1', strokeWidth: 2, opacity: 1 };
    const id = `${tool}-${Date.now()}`;
    const object: CanvasObject | null = tool === 'rectangle' ? { ...common, id, type: 'rectangle', fill: '#eef2ff', text: 'New rectangle' }
      : tool === 'ellipse' ? { ...common, id, type: 'ellipse', fill: '#ecfeff', stroke: '#0891b2', text: 'New ellipse' }
      : tool === 'diamond' ? { ...common, id, type: 'diamond', fill: '#fff7ed', stroke: '#f59e0b', text: 'Decision' }
      : tool === 'line' ? { ...common, id, type: 'line', fill: 'transparent', stroke: '#64748b', points: [0, 0, 160, 0], height: 0, text: undefined }
      : tool === 'arrow' || tool === 'connector' ? { ...common, id, type: 'arrow', fill: 'transparent', stroke: '#4f46e5', points: [0, 0, 170, 0], height: 0, text: undefined }
      : tool === 'text' ? { ...common, id, type: 'text', fill: 'transparent', stroke: 'transparent', strokeWidth: 0, text: 'Type something...' }
      : tool === 'sticky' ? { ...common, id, type: 'sticky', fill: '#fef3c7', stroke: '#f59e0b', text: 'A note for later' }
      : tool === 'frame' ? { ...common, id, type: 'frame', fill: '#f8fafc', stroke: '#94a3b8', text: 'New frame' }
      : tool === 'code' ? { ...common, id, type: 'code', fill: '#111827', stroke: '#334155', text: 'const idea = true;', language: 'typescript' }
      : null;
    if (object) addObject(object);
  };

  const handleStageClick = (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();
    if (!stage || event.target !== stage) return;
    if (['rectangle', 'ellipse', 'diamond', 'line', 'arrow', 'connector', 'text', 'sticky', 'frame', 'code'].includes(activeTool)) addForTool(activeTool, toWorld(stage));
    else if (activeTool === 'select') select(null);
  };

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (pointer) zoomBy(event.evt.deltaY > 0 ? 0.92 : 1.08, pointer);
  };

  return <div ref={containerRef} className="canvas-stage-wrap">
    <Stage ref={stageRef} width={size.width} height={size.height} x={viewport.x} y={viewport.y} scaleX={viewport.zoom} scaleY={viewport.zoom} draggable={activeTool === 'hand'} onDragEnd={(event) => setViewport({ ...viewport, x: event.target.x(), y: event.target.y() })} onClick={handleStageClick} onTap={handleStageClick} onWheel={handleWheel} style={{ cursor: activeTool === 'hand' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair' }}>
      <Layer listening={false}>{gridLines}</Layer>
      <Layer>
        {objects.map((object) => <CanvasObjectShape key={object.id} object={object} selected={selectedIds.includes(object.id)} onSelect={(additive) => select(object.id, additive)} onDragEnd={(x, y) => updateObject(object.id, { x, y })} />)}
      </Layer>
      <Layer listening={false}>{objects.filter((object) => selectedIds.includes(object.id)).map((object) => <Rect key={`selection-${object.id}`} x={object.x - 6} y={object.y - 6} width={object.width + 12} height={Math.max(object.height, 8) + 12} stroke="#4f46e5" strokeWidth={1.5 / viewport.zoom} dash={[6 / viewport.zoom, 4 / viewport.zoom]} cornerRadius={6} />)}{collaborators.filter((collaborator) => collaborator.id !== 'you').map((collaborator) => <Group key={collaborator.id} x={collaborator.cursor.x} y={collaborator.cursor.y}><Circle radius={5 / viewport.zoom} fill={collaborator.color} stroke="#fff" strokeWidth={2 / viewport.zoom} /><Rect x={8 / viewport.zoom} y={-12 / viewport.zoom} width={75 / viewport.zoom} height={22 / viewport.zoom} cornerRadius={4 / viewport.zoom} fill={collaborator.color} /><Text x={14 / viewport.zoom} y={-7 / viewport.zoom} text={collaborator.name.split(' ')[0]} fill="#fff" fontSize={11 / viewport.zoom} fontFamily="Inter" /></Group>)}</Layer>
    </Stage>
    <div className="canvas-hint"><span className="mono-text">Space</span> to pan <span>•</span> scroll to zoom</div>
  </div>;
}

function CanvasObjectShape({ object, selected, onSelect, onDragEnd }: { object: CanvasObject; selected: boolean; onSelect: (additive: boolean) => void; onDragEnd: (x: number, y: number) => void }) {
  const common = { x: object.x, y: object.y, opacity: object.opacity, rotation: object.rotation, draggable: true, onClick: (event: KonvaEventObject<MouseEvent>) => { event.cancelBubble = true; onSelect(event.evt.shiftKey); }, onTap: (event: KonvaEventObject<MouseEvent>) => { event.cancelBubble = true; onSelect(false); }, onDragEnd: (event: KonvaEventObject<DragEvent>) => onDragEnd(event.target.x(), event.target.y()) };
  if (object.type === 'ellipse') return <Group {...common}><Ellipse radiusX={object.width / 2} radiusY={object.height / 2} x={object.width / 2} y={object.height / 2} fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} /><ObjectLabel object={object} align="center" /></Group>;
  if (object.type === 'diamond') return <Group {...common}><Line points={[object.width / 2, 0, object.width, object.height / 2, object.width / 2, object.height, 0, object.height / 2]} closed fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} /><ObjectLabel object={object} align="center" /></Group>;
  if (object.type === 'line') return <Line {...common} points={object.points ?? [0, 0, object.width, 0]} stroke={object.stroke} strokeWidth={object.strokeWidth} lineCap="round" />;
  if (object.type === 'arrow') return <Arrow {...common} points={object.points ?? [0, 0, object.width, 0]} stroke={object.stroke} fill={object.stroke} strokeWidth={object.strokeWidth} pointerLength={10} pointerWidth={9} />;
  if (object.type === 'text') return <Text {...common} text={object.text} fontFamily="Inter" fontSize={18} fill="#27324b" width={object.width} padding={2} />;
  if (object.type === 'code') return <Group {...common}><Rect width={object.width} height={object.height} fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} cornerRadius={10} /><Text text={object.text} x={14} y={18} width={object.width - 28} fill="#d1fae5" fontSize={14} fontFamily="JetBrains Mono" /></Group>;
  return <Group {...common}><Rect width={object.width} height={object.height} fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} cornerRadius={object.type === 'sticky' ? 4 : 12} shadowColor="#64748b" shadowOpacity={object.type === 'sticky' ? 0.08 : 0.02} shadowBlur={9} shadowOffsetY={3} /><ObjectLabel object={object} align="center" /></Group>;
}

function ObjectLabel({ object, align }: { object: CanvasObject; align: 'center' | 'left' }) {
  return <Text text={object.text} x={align === 'center' ? 10 : 16} y={object.height / 2 - 9} width={object.width - 20} align={align} fontFamily="Inter" fontSize={14} fontStyle={object.type === 'frame' ? 'bold' : 'normal'} fill="#28324b" />;
}
