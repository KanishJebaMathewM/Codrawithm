import { describe, expect, it } from 'vitest';
import { clampZoom } from '../../../../packages/canvas-core/src';

describe('canvas-core zoom helpers', () => {
  it('keeps zoom within the supported interaction range', () => {
    expect(clampZoom(0.1)).toBe(0.35);
    expect(clampZoom(1.2)).toBe(1.2);
    expect(clampZoom(4)).toBe(2.4);
  });
});
