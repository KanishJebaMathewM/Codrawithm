export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpatialItem<T> {
  id: string;
  bounds: Bounds;
  data: T | undefined;
}

export interface SpatialIndexOptions {
  cellSize?: number;
}

export interface SpatialIndex<T = unknown> {
  insert(id: string, bounds: Bounds, data?: T): void;
  update(id: string, bounds: Bounds): void;
  remove(id: string): boolean;
  get(id: string): SpatialItem<T> | undefined;
  search(area: Bounds): SpatialItem<T>[];
  searchIds(area: Bounds): string[];
  readonly size: number;
  clear(): void;
}

interface Record_<T> {
  id: string;
  bounds: Bounds;
  data: T | undefined;
}

const DEFAULT_CELL_SIZE = 256;
const MAX_INSERT_CELLS = 100_000;
const FALLBACK_CELL_THRESHOLD = 4_096;

function normalizeBounds(bounds: Bounds): Bounds {
  const x = bounds.width < 0 ? bounds.x + bounds.width : bounds.x;
  const y = bounds.height < 0 ? bounds.y + bounds.height : bounds.y;
  return {
    x,
    y,
    width: Math.abs(bounds.width),
    height: Math.abs(bounds.height),
  };
}

function assertBounds(bounds: Bounds, path: string): void {
  for (const key of ["x", "y", "width", "height"] as const) {
    if (!Number.isFinite(bounds[key])) {
      throw new TypeError(`${path}.${key} must be a finite number`);
    }
  }
}

function overlaps(a: Bounds, b: Bounds): boolean {
  return (
    a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.height &&
    a.y + a.height >= b.y
  );
}

function compareIds(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

export function createSpatialIndex<T = unknown>(options: SpatialIndexOptions = {}): SpatialIndex<T> {
  const cellSize = options.cellSize ?? DEFAULT_CELL_SIZE;
  if (!Number.isFinite(cellSize) || cellSize <= 0) {
    throw new RangeError("cellSize must be a positive number");
  }

  const records = new Map<string, Record_<T>>();
  const buckets = new Map<string, Set<string>>();

  function cellKey(x: number, y: number): string {
    return `${x}:${y}`;
  }

  function cellRange(bounds: Bounds): { minX: number; minY: number; maxX: number; maxY: number; cells: number } {
    const minX = Math.floor(bounds.x / cellSize);
    const minY = Math.floor(bounds.y / cellSize);
    const maxX = Math.floor((bounds.x + bounds.width) / cellSize);
    const maxY = Math.floor((bounds.y + bounds.height) / cellSize);
    return {
      minX,
      minY,
      maxX,
      maxY,
      cells: (maxX - minX + 1) * (maxY - minY + 1),
    };
  }

  function attach(id: string, bounds: Bounds): void {
    const range = cellRange(bounds);
    if (range.cells > MAX_INSERT_CELLS) {
      throw new RangeError(
        `object covers ${range.cells} cells; increase cellSize or split the object`,
      );
    }
    for (let x = range.minX; x <= range.maxX; x += 1) {
      for (let y = range.minY; y <= range.maxY; y += 1) {
        const key = cellKey(x, y);
        let bucket = buckets.get(key);
        if (bucket === undefined) {
          bucket = new Set<string>();
          buckets.set(key, bucket);
        }
        bucket.add(id);
      }
    }
  }

  function detach(id: string, bounds: Bounds): void {
    const range = cellRange(bounds);
    for (let x = range.minX; x <= range.maxX; x += 1) {
      for (let y = range.minY; y <= range.maxY; y += 1) {
        const key = cellKey(x, y);
        const bucket = buckets.get(key);
        if (bucket === undefined) {
          continue;
        }
        bucket.delete(id);
        if (bucket.size === 0) {
          buckets.delete(key);
        }
      }
    }
  }

  function candidates(area: Bounds): Set<string> {
    const range = cellRange(area);
    const result = new Set<string>();
    if (range.cells > FALLBACK_CELL_THRESHOLD) {
      for (const id of records.keys()) {
        result.add(id);
      }
      return result;
    }
    for (let x = range.minX; x <= range.maxX; x += 1) {
      for (let y = range.minY; y <= range.maxY; y += 1) {
        const bucket = buckets.get(cellKey(x, y));
        if (bucket !== undefined) {
          for (const id of bucket) {
            result.add(id);
          }
        }
      }
    }
    return result;
  }

  function insert(id: string, bounds: Bounds, data?: T): void {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new TypeError("id must be a non-empty string");
    }
    if (records.has(id)) {
      throw new Error(`object already indexed: ${id}`);
    }
    assertBounds(bounds, "bounds");
    const normalized = normalizeBounds(bounds);
    records.set(id, { id, bounds: normalized, data });
    try {
      attach(id, normalized);
    } catch (error) {
      records.delete(id);
      throw error;
    }
  }

  function update(id: string, bounds: Bounds): void {
    const existing = records.get(id);
    if (existing === undefined) {
      throw new Error(`object is not indexed: ${id}`);
    }
    assertBounds(bounds, "bounds");
    const normalized = normalizeBounds(bounds);
    const previous = existing.bounds;
    detach(id, previous);
    existing.bounds = normalized;
    try {
      attach(id, normalized);
    } catch (error) {
      existing.bounds = previous;
      attach(id, previous);
      throw error;
    }
  }

  function remove(id: string): boolean {
    const existing = records.get(id);
    if (existing === undefined) {
      return false;
    }
    detach(id, existing.bounds);
    records.delete(id);
    return true;
  }

  function get(id: string): SpatialItem<T> | undefined {
    const record = records.get(id);
    if (record === undefined) {
      return undefined;
    }
    return { id: record.id, bounds: { ...record.bounds }, data: record.data };
  }

  function search(area: Bounds): SpatialItem<T>[] {
    assertBounds(area, "area");
    const normalized = normalizeBounds(area);
    const ids = Array.from(candidates(normalized)).sort(compareIds);
    const result: SpatialItem<T>[] = [];
    for (const id of ids) {
      const record = records.get(id);
      if (record !== undefined && overlaps(record.bounds, normalized)) {
        result.push({ id: record.id, bounds: { ...record.bounds }, data: record.data });
      }
    }
    return result;
  }

  function clear(): void {
    records.clear();
    buckets.clear();
  }

  return {
    insert,
    update,
    remove,
    get,
    search,
    searchIds: (area) => search(area).map((item) => item.id),
    get size() {
      return records.size;
    },
    clear,
  };
}
