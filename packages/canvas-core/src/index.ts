export interface Point { x: number; y: number; }
export const clampZoom = (zoom: number) => Math.min(2.4, Math.max(0.35, zoom));
