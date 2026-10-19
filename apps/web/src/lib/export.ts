import type { CanvasObject } from '../types';

export function downloadBoardJson(boardId: string, boardName: string, objects: CanvasObject[]) {
  const payload = JSON.stringify({
    format: 'codrawithm',
    version: '1.0',
    title: boardName,
    workspaceType: 'whiteboard',
    boardId,
    objects,
    connectors: objects.filter((object) => object.type === 'arrow' || object.type === 'line'),
    frames: objects.filter((object) => object.type === 'frame'),
    algorithm: null,
    metadata: { exportedAt: new Date().toISOString(), source: 'codrawithm-local-prototype' },
  }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${boardName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'board'}.codrawithm.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
