import type { CanvasObject } from '../types';

export type BoardTemplate = 'blank' | 'flowchart' | 'mind-map';

export function templateBoard(template: BoardTemplate): { title: string; objects: CanvasObject[] } {
  if (template === 'blank') return { title: 'Untitled board', objects: [] };
  if (template === 'flowchart') return {
    title: 'Flowchart',
    objects: [
      { id: 'start', type: 'ellipse', x: 120, y: 100, width: 150, height: 70, rotation: 0, fill: '#ecfdf5', stroke: '#10b981', strokeWidth: 2, opacity: 1, text: 'Start' },
      { id: 'step-1', type: 'rectangle', x: 120, y: 230, width: 180, height: 82, rotation: 0, fill: '#eef2ff', stroke: '#4f46e5', strokeWidth: 2, opacity: 1, text: 'Add a step' },
      { id: 'decision', type: 'diamond', x: 143, y: 380, width: 135, height: 105, rotation: 0, fill: '#fff7ed', stroke: '#f59e0b', strokeWidth: 2, opacity: 1, text: 'Decision?' },
      { id: 'flow-1', type: 'arrow', x: 194, y: 170, width: 1, height: 50, rotation: 0, fill: 'transparent', stroke: '#64748b', strokeWidth: 2, opacity: 1, points: [0, 0, 0, 50] },
      { id: 'flow-2', type: 'arrow', x: 194, y: 312, width: 1, height: 60, rotation: 0, fill: 'transparent', stroke: '#64748b', strokeWidth: 2, opacity: 1, points: [0, 0, 0, 60] },
    ],
  };
  return {
    title: 'Mind map',
    objects: [
      { id: 'topic', type: 'ellipse', x: 360, y: 250, width: 210, height: 90, rotation: 0, fill: '#eef2ff', stroke: '#4f46e5', strokeWidth: 2, opacity: 1, text: 'Central idea' },
      { id: 'branch-a', type: 'rectangle', x: 70, y: 110, width: 175, height: 76, rotation: 0, fill: '#ecfeff', stroke: '#0891b2', strokeWidth: 2, opacity: 1, text: 'First thought' },
      { id: 'branch-b', type: 'rectangle', x: 690, y: 110, width: 175, height: 76, rotation: 0, fill: '#f5f3ff', stroke: '#8b5cf6', strokeWidth: 2, opacity: 1, text: 'Second thought' },
      { id: 'branch-c', type: 'rectangle', x: 70, y: 410, width: 175, height: 76, rotation: 0, fill: '#fff7ed', stroke: '#f59e0b', strokeWidth: 2, opacity: 1, text: 'Third thought' },
      { id: 'branch-d', type: 'rectangle', x: 690, y: 410, width: 175, height: 76, rotation: 0, fill: '#ecfdf5', stroke: '#10b981', strokeWidth: 2, opacity: 1, text: 'Fourth thought' },
      { id: 'link-a', type: 'line', x: 245, y: 165, width: 140, height: 100, rotation: 0, fill: 'transparent', stroke: '#8b95a8', strokeWidth: 2, opacity: 1, points: [0, 0, 140, 100] },
      { id: 'link-b', type: 'line', x: 570, y: 165, width: 120, height: 100, rotation: 0, fill: 'transparent', stroke: '#8b95a8', strokeWidth: 2, opacity: 1, points: [0, 100, 120, 0] },
      { id: 'link-c', type: 'line', x: 245, y: 330, width: 140, height: 120, rotation: 0, fill: 'transparent', stroke: '#8b95a8', strokeWidth: 2, opacity: 1, points: [0, 120, 140, 0] },
      { id: 'link-d', type: 'line', x: 570, y: 330, width: 120, height: 120, rotation: 0, fill: 'transparent', stroke: '#8b95a8', strokeWidth: 2, opacity: 1, points: [0, 0, 120, 120] },
    ],
  };
}
