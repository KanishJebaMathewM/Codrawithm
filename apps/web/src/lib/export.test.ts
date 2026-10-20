import { describe, expect, it } from 'vitest';
import { createBoardDocument, parseBoardDocument } from './export';
import type { CanvasObject } from '../types';

const sample: CanvasObject = {
  id: 'shape-1', type: 'rectangle', x: 12, y: 24, width: 180, height: 90,
  rotation: 0, fill: '#eef2ff', stroke: '#4f46e5', strokeWidth: 2, opacity: 1, text: 'API',
};

describe('Codrawithm board documents', () => {
  it('round-trips board metadata and canvas objects', () => {
    const document = createBoardDocument('board-1', 'Architecture', [sample]);
    const parsed = parseBoardDocument(JSON.parse(JSON.stringify(document)));
    expect(parsed.title).toBe('Architecture');
    expect(parsed.objects).toEqual([sample]);
    expect(parsed.connectors).toEqual([]);
  });

  it('rejects malformed objects with a descriptive error', () => {
    expect(() => parseBoardDocument({ format: 'codrawithm', version: '1.0', boardId: 'b', title: 'x', workspaceType: 'whiteboard', objects: [{ id: 'bad' }] }))
      .toThrow(/not a valid Codrawithm board/);
  });

  it('rejects unsupported format versions', () => {
    expect(() => parseBoardDocument({ format: 'other', version: '2.0', boardId: 'b', title: 'x', workspaceType: 'whiteboard', objects: [] }))
      .toThrow(/not a valid Codrawithm board/);
  });
});
