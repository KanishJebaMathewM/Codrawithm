export type SvgNodeKind = "rectangle" | "ellipse" | "diamond" | "text" | "freehand";
export type SvgAnchor = "top" | "right" | "bottom" | "left" | "center";
export type SvgArrow = "none" | "target" | "source" | "both";

export interface SvgPoint {
  x: number;
  y: number;
}

export interface SvgNode {
  id: string;
  kind: SvgNodeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  label?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  textColor?: string;
  fontSize?: number;
  points?: readonly SvgPoint[];
}

export interface SvgEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  stroke?: string;
  strokeWidth?: number;
  dashed?: boolean;
  arrow?: SvgArrow;
  fromAnchor?: SvgAnchor;
  toAnchor?: SvgAnchor;
}

export interface SvgBoard {
  id?: string;
  title?: string;
  nodes: readonly SvgNode[];
  edges: readonly SvgEdge[];
}

export interface SvgExportOptions {
  padding?: number;
  background?: string;
  includeTitle?: boolean;
  fontFamily?: string;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_PADDING = 24;
const FALLBACK_FRAME: Rect = { x: 0, y: 0, width: 640, height: 480 };
const DEFAULT_FILL = "#ffffff";
const DEFAULT_STROKE = "#1f2933";
const DEFAULT_TEXT = "#1f2933";
const DEFAULT_FONT_SIZE = 14;
const COLOR_PATTERN =
  /^(?:#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20}|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?\)|hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(?:,\s*[\d.]+\s*)?\))$/;

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sanitizeColor(value: string | undefined, fallback: string): string {
  if (value === undefined) {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed === "none" || trimmed === "transparent") {
    return trimmed;
  }
  if (trimmed.length > 64 || !COLOR_PATTERN.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

function formatNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function finiteRect(rect: Rect): boolean {
  return [rect.x, rect.y, rect.width, rect.height].every((value) => Number.isFinite(value));
}

function normalizeRect(rect: Rect): Rect {
  const x = rect.width < 0 ? rect.x + rect.width : rect.x;
  const y = rect.height < 0 ? rect.y + rect.height : rect.y;
  return { x, y, width: Math.abs(rect.width), height: Math.abs(rect.height) };
}

function rotatePoint(target: SvgPoint, origin: SvgPoint, radians: number): SvgPoint {
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  return {
    x: origin.x + dx * cosine - dy * sine,
    y: origin.y + dx * sine + dy * cosine,
  };
}

function rectCorners(rect: Rect, radians: number): SvgPoint[] {
  const normalized = normalizeRect(rect);
  const center = {
    x: normalized.x + normalized.width / 2,
    y: normalized.y + normalized.height / 2,
  };
  const corners = [
    { x: normalized.x, y: normalized.y },
    { x: normalized.x + normalized.width, y: normalized.y },
    { x: normalized.x + normalized.width, y: normalized.y + normalized.height },
    { x: normalized.x, y: normalized.y + normalized.height },
  ];
  return radians === 0 ? corners : corners.map((corner) => rotatePoint(corner, center, radians));
}

function boundsOfPoints(points: readonly SvgPoint[]): Rect {
  const first = points[0];
  if (first === undefined) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  let minX = first.x;
  let minY = first.y;
  let maxX = first.x;
  let maxY = first.y;
  for (const current of points) {
    minX = Math.min(minX, current.x);
    minY = Math.min(minY, current.y);
    maxX = Math.max(maxX, current.x);
    maxY = Math.max(maxY, current.y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function unionRect(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

function nodeRect(node: SvgNode): Rect {
  return normalizeRect({ x: node.x, y: node.y, width: node.width, height: node.height });
}

function nodeBounds(node: SvgNode): Rect {
  const base = nodeRect(node);
  if (node.rotation !== undefined && Number.isFinite(node.rotation) && node.rotation !== 0) {
    return boundsOfPoints(rectCorners(base, (node.rotation * Math.PI) / 180));
  }
  return base;
}

function nodeContentBounds(node: SvgNode): Rect {
  let bounds = nodeBounds(node);
  if (node.kind === "freehand" && node.points !== undefined && node.points.length > 1) {
    bounds = unionRect(bounds, boundsOfPoints(node.points));
  }
  return bounds;
}

function wrapLabel(label: string, width: number, fontSize: number): string[] {
  const text = label.replace(/\s+/g, " ").trim();
  if (text.length === 0) {
    return [];
  }
  const maxCharacters = Math.max(4, Math.floor(Math.max(20, width - 16) / (fontSize * 0.58)));
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  const pushWord = (word: string): void => {
    if (line.length === 0) {
      line = word;
      return;
    }
    if (line.length + 1 + word.length <= maxCharacters) {
      line = `${line} ${word}`;
    } else {
      lines.push(line);
      line = word;
    }
  };
  for (const word of words) {
    if (word.length <= maxCharacters) {
      pushWord(word);
      continue;
    }
    let offset = 0;
    while (offset < word.length) {
      const chunk = word.slice(offset, offset + maxCharacters);
      pushWord(chunk);
      offset += maxCharacters;
    }
  }
  if (line.length > 0) {
    lines.push(line);
  }
  return lines;
}

function anchorPoint(node: SvgNode, anchor: SvgAnchor): SvgPoint {
  const rect = nodeRect(node);
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  let base: SvgPoint;
  switch (anchor) {
    case "top":
      base = { x: center.x, y: rect.y };
      break;
    case "right":
      base = { x: rect.x + rect.width, y: center.y };
      break;
    case "bottom":
      base = { x: center.x, y: rect.y + rect.height };
      break;
    case "left":
      base = { x: rect.x, y: center.y };
      break;
    case "center":
      base = center;
      break;
  }
  const rotation = node.rotation ?? 0;
  if (!Number.isFinite(rotation) || rotation === 0) {
    return base;
  }
  return rotatePoint(base, center, (rotation * Math.PI) / 180);
}

function clipToBorder(node: SvgNode, target: SvgPoint): SvgPoint {
  const rect = nodeRect(node);
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (dx === 0 && dy === 0) {
    return center;
  }
  let t = Number.POSITIVE_INFINITY;
  if (dx > 0) {
    t = Math.min(t, (rect.x + rect.width - center.x) / dx);
  } else if (dx < 0) {
    t = Math.min(t, (rect.x - center.x) / dx);
  }
  if (dy > 0) {
    t = Math.min(t, (rect.y + rect.height - center.y) / dy);
  } else if (dy < 0) {
    t = Math.min(t, (rect.y - center.y) / dy);
  }
  if (!Number.isFinite(t)) {
    return center;
  }
  return { x: center.x + dx * t, y: center.y + dy * t };
}

function renderLabel(
  label: string,
  center: SvgPoint,
  width: number,
  height: number,
  fontSize: number,
  color: string,
): string {
  const lines = wrapLabel(label, width, fontSize);
  if (lines.length === 0) {
    return "";
  }
  const lineHeight = fontSize * 1.25;
  const firstY = center.y - ((lines.length - 1) * lineHeight) / 2;
  const spans = lines
    .map(
      (line, index) =>
        `<tspan x="${formatNumber(center.x)}" y="${formatNumber(firstY + index * lineHeight)}">${escapeXml(line)}</tspan>`,
    )
    .join("");
  void height;
  return `<text fill="${escapeXml(color)}" font-family="sans-serif" font-size="${formatNumber(fontSize)}" text-anchor="middle" dominant-baseline="central">${spans}</text>`;
}

function renderNode(node: SvgNode): string {
  const rect = nodeRect(node);
  if (!finiteRect(rect) || rect.width < 0 || rect.height < 0) {
    return "";
  }
  const fill = sanitizeColor(node.fill, DEFAULT_FILL);
  const stroke = sanitizeColor(node.stroke, DEFAULT_STROKE);
  const strokeWidth = Number.isFinite(node.strokeWidth) && (node.strokeWidth ?? 0) >= 0 ? (node.strokeWidth ?? 2) : 2;
  const fontSize = Number.isFinite(node.fontSize) && (node.fontSize ?? 0) > 0 ? (node.fontSize ?? DEFAULT_FONT_SIZE) : DEFAULT_FONT_SIZE;
  const textColor = sanitizeColor(node.textColor, DEFAULT_TEXT);
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const rotation = node.rotation ?? 0;
  const transform =
    Number.isFinite(rotation) && rotation !== 0
      ? ` transform="rotate(${formatNumber(rotation)} ${formatNumber(center.x)} ${formatNumber(center.y)})"`
      : "";
  const paint = `fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="${formatNumber(strokeWidth)}"`;
  let shape = "";
  switch (node.kind) {
    case "rectangle":
      shape = `<rect x="${formatNumber(rect.x)}" y="${formatNumber(rect.y)}" width="${formatNumber(rect.width)}" height="${formatNumber(rect.height)}" rx="6" ${paint}/>`;
      break;
    case "ellipse":
      shape = `<ellipse cx="${formatNumber(center.x)}" cy="${formatNumber(center.y)}" rx="${formatNumber(rect.width / 2)}" ry="${formatNumber(rect.height / 2)}" ${paint}/>`;
      break;
    case "diamond": {
      const points = [
        `${formatNumber(center.x)},${formatNumber(rect.y)}`,
        `${formatNumber(rect.x + rect.width)},${formatNumber(center.y)}`,
        `${formatNumber(center.x)},${formatNumber(rect.y + rect.height)}`,
        `${formatNumber(rect.x)},${formatNumber(center.y)}`,
      ].join(" ");
      shape = `<polygon points="${points}" ${paint}/>`;
      break;
    }
    case "text":
      shape = `<rect x="${formatNumber(rect.x)}" y="${formatNumber(rect.y)}" width="${formatNumber(rect.width)}" height="${formatNumber(rect.height)}" fill="none" stroke="none"/>`;
      break;
    case "freehand": {
      const points = node.points ?? [];
      if (points.length < 2) {
        shape = "";
      } else {
        const path = points
          .map((point, index) => `${index === 0 ? "M" : "L"}${formatNumber(point.x)} ${formatNumber(point.y)}`)
          .join(" ");
        shape = `<path d="${path}" fill="none" stroke="${escapeXml(stroke)}" stroke-width="${formatNumber(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      break;
    }
  }
  const label = renderLabel(node.label ?? "", center, rect.width, rect.height, fontSize, textColor);
  return `<g id="${escapeXml(node.id)}"${transform}>${shape}${label}</g>`;
}

function edgeEndpoints(from: SvgNode, to: SvgNode, edge: SvgEdge): { start: SvgPoint; end: SvgPoint } {
  const fromRect = nodeRect(from);
  const toRect = nodeRect(to);
  const fromCenter = { x: fromRect.x + fromRect.width / 2, y: fromRect.y + fromRect.height / 2 };
  const toCenter = { x: toRect.x + toRect.width / 2, y: toRect.y + toRect.height / 2 };
  const start = edge.fromAnchor === undefined ? clipToBorder(from, toCenter) : anchorPoint(from, edge.fromAnchor);
  const end = edge.toAnchor === undefined ? clipToBorder(to, fromCenter) : anchorPoint(to, edge.toAnchor);
  return { start, end };
}

function renderEdge(edge: SvgEdge, index: number, nodes: Map<string, SvgNode>): string {
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  if (from === undefined || to === undefined) {
    return "";
  }
  const { start, end } = edgeEndpoints(from, to, edge);
  if (![start.x, start.y, end.x, end.y].every((value) => Number.isFinite(value))) {
    return "";
  }
  const stroke = sanitizeColor(edge.stroke, DEFAULT_STROKE);
  const strokeWidth =
    Number.isFinite(edge.strokeWidth) && (edge.strokeWidth ?? 0) >= 0 ? (edge.strokeWidth ?? 2) : 2;
  const arrow = edge.arrow ?? "none";
  const markerId = `arrow-${index}`;
  const markerStart = arrow === "source" || arrow === "both" ? ` marker-start="url(#${markerId})"` : "";
  const markerEnd = arrow === "target" || arrow === "both" ? ` marker-end="url(#${markerId})"` : "";
  const dashed = edge.dashed === true ? ' stroke-dasharray="6 4"' : "";
  const line = `<line x1="${formatNumber(start.x)}" y1="${formatNumber(start.y)}" x2="${formatNumber(end.x)}" y2="${formatNumber(end.y)}" stroke="${escapeXml(stroke)}" stroke-width="${formatNumber(strokeWidth)}"${dashed}${markerStart}${markerEnd}/>`;
  const labelText = edge.label ?? "";
  if (labelText.trim().length === 0) {
    return line;
  }
  const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const label = `<text x="${formatNumber(midpoint.x)}" y="${formatNumber(midpoint.y)}" fill="${escapeXml(stroke)}" font-family="sans-serif" font-size="12" text-anchor="middle" dominant-baseline="central" paint-order="stroke" stroke="#ffffff" stroke-width="3">${escapeXml(labelText)}</text>`;
  return `${line}${label}`;
}

function markerDefinition(id: string, stroke: string): string {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${escapeXml(stroke)}"/></marker>`;
}

export function renderBoardToSvg(board: SvgBoard, options: SvgExportOptions = {}): string {
  const padding = Number.isFinite(options.padding) && (options.padding ?? 0) >= 0 ? (options.padding ?? DEFAULT_PADDING) : DEFAULT_PADDING;
  const nodes = board.nodes.filter((node) => finiteRect(nodeRect(node)));
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  let content: Rect | null = null;
  for (const node of nodes) {
    const bounds = nodeContentBounds(node);
    content = content === null ? bounds : unionRect(content, bounds);
  }
  for (const edge of board.edges) {
    const from = nodeMap.get(edge.from);
    const to = nodeMap.get(edge.to);
    if (from === undefined || to === undefined) {
      continue;
    }
    const { start, end } = edgeEndpoints(from, to, edge);
    if (![start.x, start.y, end.x, end.y].every((value) => Number.isFinite(value))) {
      continue;
    }
    const edgeBounds = {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
    content = content === null ? edgeBounds : unionRect(content, edgeBounds);
  }
  const frame = content ?? FALLBACK_FRAME;
  const viewBox = {
    x: frame.x - padding,
    y: frame.y - padding,
    width: frame.width + padding * 2,
    height: frame.height + padding * 2,
  };
  const background = options.background === undefined ? undefined : sanitizeColor(options.background, "transparent");
  const backgroundRect =
    background === undefined || background === "transparent" || background === "none"
      ? ""
      : `<rect x="${formatNumber(viewBox.x)}" y="${formatNumber(viewBox.y)}" width="${formatNumber(viewBox.width)}" height="${formatNumber(viewBox.height)}" fill="${escapeXml(background)}"/>`;
  const title =
    options.includeTitle !== false && board.title !== undefined && board.title.length > 0
      ? `<title>${escapeXml(board.title)}</title>`
      : "";
  const markers: string[] = [];
  const edgeParts: string[] = [];
  board.edges.forEach((edge, index) => {
    const rendered = renderEdge(edge, index, nodeMap);
    if (rendered.length === 0) {
      return;
    }
    const arrow = edge.arrow ?? "none";
    if (arrow === "target" || arrow === "source" || arrow === "both") {
      markers.push(markerDefinition(`arrow-${index}`, sanitizeColor(edge.stroke, DEFAULT_STROKE)));
    }
    edgeParts.push(rendered);
  });
  const defs = markers.length > 0 ? `<defs>${markers.join("")}</defs>` : "";
  const fontFamily = options.fontFamily === undefined ? "sans-serif" : escapeXml(options.fontFamily);
  const nodeParts = nodes.map(renderNode).filter((part) => part.length > 0);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="${formatNumber(viewBox.x)} ${formatNumber(viewBox.y)} ${formatNumber(viewBox.width)} ${formatNumber(viewBox.height)}" width="${formatNumber(viewBox.width)}" height="${formatNumber(viewBox.height)}" font-family="${fontFamily}">`,
    title,
    defs,
    backgroundRect,
    nodeParts.join(""),
    edgeParts.join(""),
    "</svg>",
  ].join("");
}
