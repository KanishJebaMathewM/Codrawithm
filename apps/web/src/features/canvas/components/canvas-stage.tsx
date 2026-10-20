import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, Circle, Ellipse, Group, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useNavigate } from '@tanstack/react-router';
import { downloadDataUrl } from '../../../lib/export';
import { useCanvasStore } from '../../../stores/canvas-store';
import type { CanvasObject, ToolId, Viewport } from '../../../types';

const GRID_SIZE = 40;
const DRAW_TOOLS: ToolId[] = ['rectangle', 'rounded-rectangle', 'ellipse', 'diamond', 'triangle', 'star', 'line', 'arrow', 'connector', 'text', 'sticky', 'frame', 'code'];
const isEditableTarget = (target: EventTarget | null) => target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
const makeId = (tool: string) => `${tool}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;

export function CanvasStage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Record<string, Konva.Node | null>>({});
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ width: 900, height: 640 });
  const [draft, setDraft] = useState<CanvasObject | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const { objects, selectedIds, activeTool, viewport, gridVisible, boardBackground, currentColor, currentFill, currentStrokeWidth, select, selectMany, addObject, updateObject, updateObjects, deleteObject, zoomBy, setViewport } = useCanvasStore();

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
      if (isEditableTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (event.code === 'Space' && !event.repeat) { event.preventDefault(); setSpaceHeld(true); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'n') { event.preventDefault(); const id = useCanvasStore.getState().createBoard('Untitled board'); navigate({ to: '/board/$boardId', params: { boardId: id } }); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'o') { event.preventDefault(); window.dispatchEvent(new Event('codrawithm:import-json')); return; }
      if ((event.metaKey || event.ctrlKey) && key === 's') { event.preventDefault(); useCanvasStore.getState().markSaved(); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'a') { event.preventDefault(); useCanvasStore.getState().selectMany(useCanvasStore.getState().objects.map((object) => object.id)); return; }
      if ((event.metaKey || event.ctrlKey) && key === '0') { event.preventDefault(); useCanvasStore.getState().setViewport({ x: 0, y: 0, zoom: 1 }); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'm') { event.preventDefault(); useCanvasStore.getState().toggleMinimap(); return; }
      if ((event.metaKey || event.ctrlKey) && (key === '+' || key === '=' || key === '-')) { event.preventDefault(); useCanvasStore.getState().zoomBy(key === '-' ? 0.9 : 1.1); return; }
      const shortcuts: Record<string, ToolId> = { v: 'select', h: 'hand', z: 'zoom', p: 'pen', l: 'line', a: 'arrow', x: 'connector', r: 'rectangle', o: 'ellipse', d: 'diamond', t: 'text', n: 'sticky', f: 'frame', e: 'eraser', c: 'code' };
      if (event.key === 'Escape') { useCanvasStore.getState().setTool('select'); useCanvasStore.getState().select(null); return; }
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); useCanvasStore.getState().deleteSelected(); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'z') { event.preventDefault(); event.shiftKey ? useCanvasStore.getState().redo() : useCanvasStore.getState().undo(); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'y') { event.preventDefault(); useCanvasStore.getState().redo(); return; }
      if ((event.metaKey || event.ctrlKey) && key === 'd') { event.preventDefault(); useCanvasStore.getState().duplicateSelected(); return; }
      if (!event.metaKey && !event.ctrlKey && !event.altKey && shortcuts[key]) useCanvasStore.getState().setTool(shortcuts[key]);
    };
    const onKeyUp = (event: KeyboardEvent) => { if (event.code === 'Space') setSpaceHeld(false); };
    const onBlur = () => setSpaceHeld(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('blur', onBlur); };
  }, [navigate]);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    transformer.nodes(activeTool === 'select' ? selectedIds.map((id) => nodeRefs.current[id]).filter((node): node is Konva.Node => Boolean(node)) : []);
    transformer.getLayer()?.batchDraw();
  }, [activeTool, objects, selectedIds]);

  useEffect(() => {
    const exportPng = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const dataUrl = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2 });
      downloadDataUrl(dataUrl, `${useCanvasStore.getState().boardName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'board'}.png`);
    };
    window.addEventListener('codrawithm:export-png', exportPng);
    return () => window.removeEventListener('codrawithm:export-png', exportPng);
  }, []);

  const gridLines = useMemo(() => {
    if (!gridVisible) return [];
    const lines = [];
    for (let x = -1200; x <= 2400; x += GRID_SIZE) lines.push(<Line key={`v-${x}`} points={[x, -900, x, 1800]} stroke="#e8ebf3" strokeWidth={1} dash={[1, 5]} listening={false} />);
    for (let y = -900; y <= 1800; y += GRID_SIZE) lines.push(<Line key={`h-${y}`} points={[-1200, y, 2400, y]} stroke="#e8ebf3" strokeWidth={1} dash={[1, 5]} listening={false} />);
    return lines;
  }, [gridVisible]);

  const toWorld = useCallback((stage: Konva.Stage) => {
    const pointer = stage.getPointerPosition();
    return pointer ? { x: (pointer.x - viewport.x) / viewport.zoom, y: (pointer.y - viewport.y) / viewport.zoom } : { x: 0, y: 0 };
  }, [viewport]);

  const objectFromDrag = useCallback((tool: ToolId, start: { x: number; y: number }, end: { x: number; y: number }): CanvasObject => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.max(8, Math.abs(end.x - start.x));
    const height = Math.max(8, Math.abs(end.y - start.y));
    const common = { x, y, width, height, rotation: 0, stroke: currentColor, strokeWidth: currentStrokeWidth, opacity: 1, fill: currentFill };
    if (tool === 'line' || tool === 'arrow' || tool === 'connector') {
      const points = [start.x - x, start.y - y, end.x - x, end.y - y];
      return { ...common, id: makeId(tool), type: tool === 'line' ? 'line' : 'arrow', fill: 'transparent', points, height: 0 };
    }
    if (tool === 'ellipse' || tool === 'diamond' || tool === 'triangle' || tool === 'star') return { ...common, id: makeId(tool), type: tool, text: tool === 'diamond' ? 'Decision' : tool === 'star' ? 'Key point' : `New ${tool}` };
    if (tool === 'text') return { ...common, id: makeId(tool), type: 'text', stroke: 'transparent', strokeWidth: 0, fill: currentColor, text: 'Type something...' };
    if (tool === 'sticky') return { ...common, id: makeId(tool), type: 'sticky', fill: currentFill === '#eef2ff' ? '#fef3c7' : currentFill, text: 'A note for later' };
    if (tool === 'frame') return { ...common, id: makeId(tool), type: 'frame', fill: currentFill, text: 'New frame' };
    if (tool === 'code') return { ...common, id: makeId(tool), type: 'code', fill: '#172033', stroke: currentColor, text: '// your code here' };
    return { ...common, id: makeId(tool), type: tool === 'rounded-rectangle' ? 'rounded-rectangle' : 'rectangle', text: 'New rectangle' };
  }, [currentColor, currentFill, currentStrokeWidth]);

  const eraseAt = useCallback((point: { x: number; y: number }) => {
    const hit = [...useCanvasStore.getState().objects].reverse().find((object) => {
      const pad = Math.max(12, object.strokeWidth * 3);
      const inside = point.x >= object.x - pad && point.x <= object.x + Math.max(object.width, 8) + pad && point.y >= object.y - pad && point.y <= object.y + Math.max(object.height, 8) + pad;
      return inside && object.type === 'path';
    });
    if (hit) deleteObject(hit.id);
  }, [deleteObject]);

  const handleMouseDown = (event: KonvaEventObject<MouseEvent>) => {
    const stage = event.target.getStage();
    if (!stage) return;
    const point = toWorld(stage);
    if (activeTool === 'eraser') { dragStart.current = point; eraseAt(point); return; }
    if (activeTool === 'pen') {
      dragStart.current = point;
      setDraft({ id: makeId('pen'), type: 'path', x: point.x, y: point.y, width: 1, height: 1, rotation: 0, fill: 'transparent', stroke: currentColor, strokeWidth: currentStrokeWidth, opacity: 1, points: [0, 0] });
      return;
    }
    if (DRAW_TOOLS.includes(activeTool)) { dragStart.current = point; setDraft(objectFromDrag(activeTool, point, point)); }
  };

  const handleMouseMove = (event: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    const start = dragStart.current;
    if (!stage || !start) return;
    const point = toWorld(stage);
    if (activeTool === 'eraser') { eraseAt(point); return; }
    if (activeTool === 'pen') {
      setDraft((current) => current ? { ...current, points: [...(current.points ?? []), point.x - start.x, point.y - start.y], width: Math.max(current.width, Math.abs(point.x - start.x)), height: Math.max(current.height, Math.abs(point.y - start.y)) } : current);
    } else if (DRAW_TOOLS.includes(activeTool)) setDraft(objectFromDrag(activeTool, start, point));
  };

  const finishDrawing = () => {
    const start = dragStart.current;
    const drawing = draft;
    dragStart.current = null;
    setDraft(null);
    if (!start || !drawing) return;
    if (activeTool === 'pen') {
      if ((drawing.points?.length ?? 0) > 2) addObject(drawing);
      return;
    }
    if (!DRAW_TOOLS.includes(activeTool)) return;
    if (drawing.width < 9 && drawing.height < 9) {
      const centered = objectFromDrag(activeTool, start, { x: start.x + 144, y: start.y + 84 });
      addObject(centered);
    } else addObject(drawing);
  };

  const handleStageClick = (event: KonvaEventObject<MouseEvent>) => {
    if (event.target !== event.target.getStage()) return;
    if (activeTool === 'select') select(null);
  };

  const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (pointer) zoomBy(event.evt.deltaY > 0 ? 0.92 : 1.08, pointer);
  };

  const handleTransformEnd = () => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const updates = transformer.nodes().flatMap((node) => {
      const id = Object.entries(nodeRefs.current).find(([, value]) => value === node)?.[0];
      if (!id) return [];
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const patch = { x: node.x(), y: node.y(), width: Math.max(8, node.width() * scaleX), height: Math.max(8, node.height() * scaleY), rotation: node.rotation() };
      node.scaleX(1); node.scaleY(1);
      return [{ id, patch }];
    });
    if (updates.length) updateObjects(updates);
  };

  const setNode = (id: string, node: Konva.Node | null) => { nodeRefs.current[id] = node; };
  const panActive = activeTool === 'hand' || spaceHeld;

  return <div ref={containerRef} className="canvas-stage-wrap" style={{ backgroundColor: boardBackground }}>
    <Stage ref={stageRef} width={size.width} height={size.height} x={viewport.x} y={viewport.y} scaleX={viewport.zoom} scaleY={viewport.zoom} draggable={panActive} onDragEnd={(event) => setViewport({ ...viewport, x: event.target.x(), y: event.target.y() })} onClick={handleStageClick} onTap={handleStageClick} onMouseDown={handleMouseDown} onTouchStart={(event) => handleMouseDown(event as unknown as KonvaEventObject<MouseEvent>)} onMouseMove={handleMouseMove} onTouchMove={(event) => handleMouseMove(event as unknown as KonvaEventObject<MouseEvent>)} onMouseUp={finishDrawing} onTouchEnd={finishDrawing} onWheel={handleWheel} style={{ cursor: panActive ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair', touchAction: 'none' }}>
      <Layer listening={false}>{gridLines}</Layer>
      <Layer>
        {objects.map((object) => <CanvasObjectShape key={object.id} object={object} selected={selectedIds.includes(object.id)} canDrag={activeTool === 'select' && !spaceHeld} nodeRef={(node) => setNode(object.id, node)} onSelect={(additive) => select(object.id, additive)} onDragEnd={(x, y) => updateObject(object.id, { x, y })} />)}
        {draft && <CanvasObjectShape object={draft} selected={false} onSelect={() => undefined} onDragEnd={() => undefined} preview />}
        <Transformer ref={transformerRef} rotateEnabled={selectedIds.length > 0} resizeEnabled={selectedIds.length > 0} keepRatio={selectedIds.length > 1} boundBoxFunc={(oldBox, newBox) => newBox.width < 8 || newBox.height < 8 ? oldBox : newBox} onTransformEnd={handleTransformEnd} anchorFill="#fff" anchorStroke="#4f46e5" borderStroke="#4f46e5" anchorSize={8} />
      </Layer>
    </Stage>
    <div className="canvas-hint"><span className="mono-text">Space</span> to pan <span>•</span> drag to draw <span>•</span> scroll to zoom</div>
  </div>;
}

function CanvasObjectShape({ object, selected, canDrag = false, onSelect, onDragEnd, nodeRef, preview = false }: { object: CanvasObject; selected: boolean; canDrag?: boolean; onSelect: (additive: boolean) => void; onDragEnd: (x: number, y: number) => void; nodeRef?: (node: Konva.Node | null) => void; preview?: boolean }) {
  const common = { ref: nodeRef, x: object.x, y: object.y, width: object.width, height: object.height, opacity: preview ? 0.68 : object.opacity, rotation: object.rotation, draggable: canDrag && !preview, onClick: (event: KonvaEventObject<MouseEvent>) => { if (preview) return; event.cancelBubble = true; onSelect(event.evt.shiftKey); }, onTap: (event: KonvaEventObject<MouseEvent>) => { if (preview) return; event.cancelBubble = true; onSelect(false); }, onDragEnd: (event: KonvaEventObject<DragEvent>) => { if (!preview) onDragEnd(event.target.x(), event.target.y()); } };
  if (object.type === 'ellipse') return <Group {...common}><Ellipse radiusX={object.width / 2} radiusY={object.height / 2} x={object.width / 2} y={object.height / 2} fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} /><ObjectLabel object={object} align="center" /></Group>;
  if (object.type === 'diamond' || object.type === 'triangle' || object.type === 'star') {
    const points = object.type === 'triangle' ? [object.width / 2, 0, object.width, object.height, 0, object.height] : object.type === 'star' ? Array.from({ length: 10 }, (_, index) => { const angle = -Math.PI / 2 + index * Math.PI / 5; const radius = index % 2 ? 0.23 : 0.48; return [object.width / 2 + Math.cos(angle) * object.width * radius, object.height / 2 + Math.sin(angle) * object.height * radius]; }).flat() : [object.width / 2, 0, object.width, object.height / 2, object.width / 2, object.height, 0, object.height / 2];
    return <Group {...common}><Line points={points} closed fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} /><ObjectLabel object={object} align="center" /></Group>;
  }
  if (object.type === 'line' || object.type === 'path') return <Line {...common} points={object.points ?? [0, 0, object.width, 0]} stroke={object.stroke} strokeWidth={object.strokeWidth} lineCap="round" lineJoin="round" tension={object.type === 'path' ? 0.24 : 0} />;
  if (object.type === 'arrow') return <Arrow {...common} points={object.points ?? [0, 0, object.width, 0]} stroke={object.stroke} fill={object.stroke} strokeWidth={object.strokeWidth} pointerLength={10} pointerWidth={9} />;
  if (object.type === 'text') return <Text {...common} text={object.text} fontFamily="Inter" fontSize={18} fill={object.fill} width={object.width} padding={2} />;
  if (object.type === 'code') return <Group {...common}><Rect width={object.width} height={object.height} fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} cornerRadius={10} /><Text text={object.text} x={14} y={18} width={object.width - 28} fill="#d1fae5" fontSize={14} fontFamily="JetBrains Mono" /></Group>;
  return <Group {...common}><Rect width={object.width} height={object.height} fill={object.fill} stroke={object.stroke} strokeWidth={object.strokeWidth} cornerRadius={object.type === 'sticky' ? 4 : object.type === 'rectangle' ? 2 : 12} shadowColor="#64748b" shadowOpacity={object.type === 'sticky' ? 0.08 : 0.02} shadowBlur={9} shadowOffsetY={3} /><ObjectLabel object={object} align="center" /></Group>;
}

function ObjectLabel({ object, align }: { object: CanvasObject; align: 'center' | 'left' }) {
  return <Text text={object.text} x={align === 'center' ? 10 : 16} y={object.height / 2 - 9} width={object.width - 20} align={align} fontFamily="Inter" fontSize={14} fontStyle={object.type === 'frame' ? 'bold' : 'normal'} fill="#28324b" />;
}
