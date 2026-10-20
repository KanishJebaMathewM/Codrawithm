import { z } from 'zod';
import type { BoardDocument, CanvasObject } from '../types';

const canvasObjectSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['path', 'rectangle', 'rounded-rectangle', 'ellipse', 'diamond', 'triangle', 'star', 'line', 'arrow', 'text', 'sticky', 'frame', 'code']),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().nonnegative(),
  height: z.number().finite().nonnegative(),
  rotation: z.number().finite(),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number().finite().nonnegative(),
  opacity: z.number().finite().min(0).max(1),
  text: z.string().optional(),
  points: z.array(z.number().finite()).optional(),
  label: z.string().optional(),
  language: z.string().optional(),
}).passthrough();

export const boardDocumentSchema = z.object({
  format: z.literal('codrawithm'),
  version: z.literal('1.0'),
  boardId: z.string().min(1),
  title: z.string().min(1).max(200),
  workspaceType: z.string().min(1),
  objects: z.array(canvasObjectSchema),
  connectors: z.array(canvasObjectSchema).default([]),
  frames: z.array(canvasObjectSchema).default([]),
  algorithm: z.null().default(null),
  metadata: z.object({
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    exportedAt: z.string().datetime().optional(),
    source: z.string().optional(),
  }).passthrough().default({}),
}).passthrough();

export function parseBoardDocument(input: unknown): BoardDocument {
  const parsed = boardDocumentSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join('.') || 'document'}: ${issue.message}`).join('; ');
    throw new Error(`This file is not a valid Codrawithm board. ${details}`);
  }
  const now = new Date().toISOString();
  const createdAt = parsed.data.metadata.createdAt ?? now;
  return {
    ...parsed.data,
    metadata: {
      ...parsed.data.metadata,
      createdAt,
      updatedAt: parsed.data.metadata.updatedAt ?? now,
    },
  } as BoardDocument;
}

export function createBoardDocument(boardId: string, title: string, objects: CanvasObject[], exportedAt?: string): BoardDocument {
  const now = new Date().toISOString();
  return {
    format: 'codrawithm',
    version: '1.0',
    boardId,
    title,
    workspaceType: 'whiteboard',
    objects,
    connectors: objects.filter((object) => object.type === 'arrow' || object.type === 'line'),
    frames: objects.filter((object) => object.type === 'frame'),
    algorithm: null,
    metadata: { createdAt: now, updatedAt: now, ...(exportedAt ? { exportedAt } : {}) },
  };
}

export function downloadBoardJson(boardId: string, boardName: string, objects: CanvasObject[]) {
  downloadBlob(JSON.stringify(createBoardDocument(boardId, boardName, objects, new Date().toISOString()), null, 2), 'application/json', `${safeFileName(boardName)}.codrawithm.json`);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export function createBoardSvg(title: string, objects: CanvasObject[]): string {
  const minX = Math.min(0, ...objects.map((item) => item.x));
  const minY = Math.min(0, ...objects.map((item) => item.y));
  const maxX = Math.max(800, ...objects.map((item) => item.x + Math.max(item.width, 1)));
  const maxY = Math.max(600, ...objects.map((item) => item.y + Math.max(item.height, 1)));
  const xml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const body = objects.map((object) => {
    const common = `opacity="${object.opacity}" stroke="${xml(object.stroke)}" stroke-width="${object.strokeWidth}"`;
    const transform = `translate(${object.x} ${object.y}) rotate(${object.rotation} ${object.width / 2} ${object.height / 2})`;
    let shape = '';
    if (object.type === 'ellipse') shape = `<ellipse cx="${object.width / 2}" cy="${object.height / 2}" rx="${object.width / 2}" ry="${object.height / 2}" fill="${xml(object.fill)}" ${common}/>`;
    else if (object.type === 'diamond') shape = `<polygon points="${object.width / 2},0 ${object.width},${object.height / 2} ${object.width / 2},${object.height} 0,${object.height / 2}" fill="${xml(object.fill)}" ${common}/>`;
    else if (object.type === 'triangle') shape = `<polygon points="${object.width / 2},0 ${object.width},${object.height} 0,${object.height}" fill="${xml(object.fill)}" ${common}/>`;
    else if (object.type === 'star') { const points = Array.from({ length: 10 }, (_, index) => { const angle = -Math.PI / 2 + index * Math.PI / 5; const radius = index % 2 ? 0.23 : 0.48; return `${object.width / 2 + Math.cos(angle) * object.width * radius},${object.height / 2 + Math.sin(angle) * object.height * radius}`; }).join(' '); shape = `<polygon points="${points}" fill="${xml(object.fill)}" ${common}/>`; }
    else if (object.type === 'line' || object.type === 'arrow' || object.type === 'path') {
      const points = object.points ?? [0, 0, object.width, 0];
      const coords = Array.from({ length: Math.floor(points.length / 2) }, (_, index) => `${points[index * 2]},${points[index * 2 + 1]}`).join(' ');
      shape = `<polyline points="${coords}" fill="none" ${common} ${object.type === 'arrow' ? 'marker-end="url(#arrowhead)"' : ''}/>`;
    } else {
      const radius = object.type === 'sticky' ? 4 : object.type === 'frame' ? 10 : object.type === 'rounded-rectangle' ? 16 : object.type === 'rectangle' ? 0 : 8;
      shape = `<rect width="${object.width}" height="${object.height}" rx="${radius}" fill="${xml(object.fill)}" ${common}/>`;
    }
    const label = object.text ? `<text x="${object.width / 2}" y="${object.height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Inter,Arial,sans-serif" font-size="14" fill="#28324b">${xml(object.text)}</text>` : '';
    return `<g transform="${transform}">${shape}${label}</g>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="${xml(title)}" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" width="${maxX - minX}" height="${maxY - minY}"><defs><marker id="arrowhead" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 z" fill="#4f46e5"/></marker></defs>${body}</svg>`;
}

export function downloadBoardSvg(boardName: string, objects: CanvasObject[]) {
  downloadBlob(createBoardSvg(boardName, objects), 'image/svg+xml;charset=utf-8', `${safeFileName(boardName)}.svg`);
}

function safeFileName(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'board';
}

function downloadBlob(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
