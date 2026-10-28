export interface OutlineNode {
  id: string;
  kind: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  groupId?: string;
}

export interface OutlineGroup {
  id: string;
  label?: string;
}

export interface OutlineEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface OutlineBoard {
  title?: string;
  nodes?: readonly OutlineNode[];
  edges?: readonly OutlineEdge[];
  groups?: readonly OutlineGroup[];
}

export interface OutlineOptions {
  rowTolerance?: number;
}

export interface OutlineItem {
  id: string;
  role: "node" | "edge";
  label: string;
  detail: string;
}

export interface OutlineGroupEntry {
  id: string;
  label: string;
  items: OutlineItem[];
}

export interface AccessibilityOutline {
  title: string;
  description: string;
  groups: OutlineGroupEntry[];
  ungrouped: OutlineItem[];
  connections: OutlineItem[];
  readingOrder: string[];
}

const DEFAULT_ROW_TOLERANCE = 24;

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function nodeLabel(node: OutlineNode): string {
  const label = node.label?.trim();
  return label !== undefined && label.length > 0 ? label : `${node.kind} ${node.id}`;
}

function nodeDetail(node: OutlineNode): string {
  return `${node.kind} at ${node.x}, ${node.y}, ${node.width} by ${node.height}`;
}

function validateBoard(board: OutlineBoard): void {
  const nodeIds = new Set<string>();
  for (const node of board.nodes ?? []) {
    if (typeof node.id !== "string" || node.id.trim().length === 0) {
      throw new TypeError("node id must be a non-empty string");
    }
    if (nodeIds.has(node.id)) {
      throw new Error(`duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);
    if (![node.x, node.y, node.width, node.height].every((value) => Number.isFinite(value))) {
      throw new TypeError(`node ${node.id} has non-finite bounds`);
    }
    if (node.width <= 0 || node.height <= 0) {
      throw new RangeError(`node ${node.id} must have a positive size`);
    }
  }

  const groupIds = new Set<string>();
  for (const group of board.groups ?? []) {
    if (typeof group.id !== "string" || group.id.trim().length === 0) {
      throw new TypeError("group id must be a non-empty string");
    }
    if (groupIds.has(group.id)) {
      throw new Error(`duplicate group id: ${group.id}`);
    }
    groupIds.add(group.id);
  }
  for (const node of board.nodes ?? []) {
    if (node.groupId !== undefined && !groupIds.has(node.groupId)) {
      throw new Error(`node ${node.id} references unknown group: ${node.groupId}`);
    }
  }

  const edgeIds = new Set<string>();
  for (const edge of board.edges ?? []) {
    if (typeof edge.id !== "string" || edge.id.trim().length === 0) {
      throw new TypeError("edge id must be a non-empty string");
    }
    if (edgeIds.has(edge.id)) {
      throw new Error(`duplicate edge id: ${edge.id}`);
    }
    edgeIds.add(edge.id);
  }
}

export function buildAccessibilityOutline(
  board: OutlineBoard,
  options: OutlineOptions = {},
): AccessibilityOutline {
  const rowTolerance = options.rowTolerance ?? DEFAULT_ROW_TOLERANCE;
  if (!Number.isFinite(rowTolerance) || rowTolerance < 0) {
    throw new RangeError("rowTolerance must be a non-negative number");
  }
  validateBoard(board);

  const nodes = board.nodes ?? [];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sorted = [...nodes].sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  const rows: OutlineNode[][] = [];
  let currentRow: OutlineNode[] = [];
  let rowTop = Number.NEGATIVE_INFINITY;
  for (const node of sorted) {
    if (currentRow.length === 0 || node.y - rowTop <= rowTolerance) {
      if (currentRow.length === 0) {
        rowTop = node.y;
      }
      currentRow.push(node);
    } else {
      rows.push(currentRow);
      currentRow = [node];
      rowTop = node.y;
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  const readingOrder = rows.flatMap((row) =>
    [...row].sort((a, b) => (a.x !== b.x ? a.x - b.x : a.id < b.id ? -1 : 1)).map((node) => node.id),
  );
  const position = new Map(readingOrder.map((id, index) => [id, index]));

  function itemFor(node: OutlineNode): OutlineItem {
    return {
      id: node.id,
      role: "node",
      label: nodeLabel(node),
      detail: nodeDetail(node),
    };
  }

  const groupEntries: OutlineGroupEntry[] = [];
  const ungroupedNodes = nodes.filter((node) => node.groupId === undefined);

  for (const group of board.groups ?? []) {
    const members = nodes
      .filter((node) => node.groupId === group.id)
      .sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0));
    if (members.length === 0) {
      continue;
    }
    const label = group.label?.trim();
    groupEntries.push({
      id: group.id,
      label: label !== undefined && label.length > 0 ? label : `Group ${group.id}`,
      items: members.map(itemFor),
    });
  }

  groupEntries.sort((a, b) => {
    const first = nodes.find((node) => node.id === a.items[0]?.id);
    const second = nodes.find((node) => node.id === b.items[0]?.id);
    if (first === undefined || second === undefined) {
      return 0;
    }
    if (first.y !== second.y) {
      return first.y - second.y;
    }
    return first.x - second.x;
  });

  const ungrouped = [...ungroupedNodes]
    .sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0))
    .map(itemFor);

  const connections: OutlineItem[] = [];
  for (const edge of board.edges ?? []) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (from === undefined || to === undefined) {
      continue;
    }
    const fromLabel = nodeLabel(from);
    const toLabel = nodeLabel(to);
    const label = edge.label?.trim();
    connections.push({
      id: edge.id,
      role: "edge",
      label:
        label !== undefined && label.length > 0
          ? label
          : `${fromLabel} to ${toLabel}`,
      detail: `from ${fromLabel} to ${toLabel}`,
    });
  }

  const title = board.title?.trim() !== undefined && board.title.trim().length > 0
    ? board.title.trim()
    : "Untitled board";
  const groupCount = groupEntries.length;
  const nodeCount = nodes.length;
  const edgeCount = connections.length;
  const description =
    nodeCount === 0 && edgeCount === 0
      ? `${title} has no shapes and no connections.`
      : `${title} has ${plural(nodeCount, "shape", "shapes")}` +
        `${groupCount > 0 ? ` in ${plural(groupCount, "group", "groups")}` : ""}` +
        ` and ${plural(edgeCount, "connection", "connections")}.`;

  return {
    title,
    description,
    groups: groupEntries,
    ungrouped,
    connections,
    readingOrder,
  };
}

export function outlineToText(outline: AccessibilityOutline): string {
  const lines: string[] = [outline.title, outline.description];
  if (outline.groups.length > 0) {
    lines.push("Groups:");
    for (const group of outline.groups) {
      lines.push(`- ${group.label}`);
      for (const item of group.items) {
        lines.push(`  - ${item.label} (${item.detail})`);
      }
    }
  }
  if (outline.ungrouped.length > 0) {
    lines.push("Ungrouped shapes:");
    for (const item of outline.ungrouped) {
      lines.push(`- ${item.label} (${item.detail})`);
    }
  }
  if (outline.connections.length > 0) {
    lines.push("Connections:");
    for (const item of outline.connections) {
      lines.push(`- ${item.label} (${item.detail})`);
    }
  }
  return lines.join("\n");
}
