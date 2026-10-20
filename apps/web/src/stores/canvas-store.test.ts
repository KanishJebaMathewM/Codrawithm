import { describe, expect, it } from 'vitest';
import { useCanvasStore } from './canvas-store';
import type { CanvasObject } from '../types';

function shape(index: number): CanvasObject {
  return {
    id: `shape-${index}`, type: 'rectangle', x: index, y: index, width: 40, height: 30,
    rotation: 0, fill: '#eef2ff', stroke: '#4f46e5', strokeWidth: 2, opacity: 1,
  };
}

describe('local canvas documents and history', () => {
  it('caps undo history at 100 document snapshots', () => {
    useCanvasStore.getState().createBoard('History test');
    for (let index = 0; index < 101; index += 1) useCanvasStore.getState().addObject(shape(index));
    expect(useCanvasStore.getState().past).toHaveLength(100);
  });

  it('restores a board independently after switching to another board', () => {
    const store = useCanvasStore.getState();
    const firstBoard = store.createBoard('First board');
    useCanvasStore.getState().addObject(shape(1));
    const secondBoard = useCanvasStore.getState().createBoard('Second board');
    expect(useCanvasStore.getState().boardId).toBe(secondBoard);
    useCanvasStore.getState().setBoard(firstBoard);
    expect(useCanvasStore.getState().boardName).toBe('First board');
    expect(useCanvasStore.getState().objects.map((object) => object.id)).toEqual(['shape-1']);
  });
});
