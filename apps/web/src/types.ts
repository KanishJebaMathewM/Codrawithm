export type ToolId =
  | 'select'
  | 'hand'
  | 'zoom'
  | 'pen'
  | 'line'
  | 'arrow'
  | 'connector'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'text'
  | 'sticky'
  | 'frame'
  | 'code'
  | 'eraser';

export type CanvasObjectType =
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'line'
  | 'arrow'
  | 'text'
  | 'sticky'
  | 'frame'
  | 'code';

export interface CanvasObject {
  id: string;
  type: CanvasObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  points?: number[];
  label?: string;
  language?: string;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Collaborator {
  id: string;
  name: string;
  initials: string;
  color: string;
  cursor: { x: number; y: number };
  status: 'editing' | 'viewing';
}

export interface BoardSummary {
  id: string;
  name: string;
  type: string;
  description: string;
  updatedAt: string;
  objectCount: number;
  accent: string;
}

export interface AlgorithmStep {
  values: number[];
  active: number[];
  sorted: number[];
  message: string;
}
