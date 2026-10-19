export const CURRENT_SCHEMA_VERSION = 2;

export type NodeKind = "rectangle" | "ellipse" | "diamond" | "text";

export interface NodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontSize: number;
  textColor: string;
}

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  dashed: boolean;
}

export interface BoardNode {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  style: NodeStyle;
}

export interface BoardEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  style: EdgeStyle;
}

export interface BoardDocument {
  schemaVersion: number;
  id: string;
  title: string;
  nodes: BoardNode[];
  edges: BoardEdge[];
}

export interface ValidationIssue {
  code:
    | "invalid_type"
    | "invalid_value"
    | "missing_field"
    | "unknown_field"
    | "duplicate_id"
    | "dangling_edge"
    | "unsupported_version";
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; board: BoardDocument }
  | { ok: false; issues: ValidationIssue[] };

const NODE_KINDS: readonly string[] = ["rectangle", "ellipse", "diamond", "text"];
const BOARD_KEYS = new Set(["schemaVersion", "id", "title", "nodes", "edges"]);
const COLOR_PATTERN =
  /^(?:#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20}|rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?\)|hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(?:,\s*[\d.]+\s*)?\))$/;

export const DEFAULT_NODE_STYLE: Readonly<NodeStyle> = Object.freeze({
  fill: "#ffffff",
  stroke: "#1f2933",
  strokeWidth: 2,
  fontSize: 14,
  textColor: "#1f2933",
});

export const DEFAULT_EDGE_STYLE: Readonly<EdgeStyle> = Object.freeze({
  stroke: "#52606d",
  strokeWidth: 2,
  dashed: false,
});

export function createEmptyBoard(id: string, title = ""): BoardDocument {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id,
    title,
    nodes: [],
    edges: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isColor(value: unknown): value is string {
  return typeof value === "string" && value.length <= 64 && COLOR_PATTERN.test(value);
}

function issue(
  issues: ValidationIssue[],
  code: ValidationIssue["code"],
  path: string,
  message: string,
): void {
  issues.push({ code, path, message });
}

function validateNodeStyle(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): NodeStyle {
  if (!isRecord(value)) {
    issue(issues, "invalid_type", path, "style must be an object");
    return { ...DEFAULT_NODE_STYLE };
  }
  for (const key of ["fill", "stroke", "textColor"] as const) {
    if (!isColor(value[key])) {
      issue(issues, "invalid_value", `${path}.${key}`, `${key} must be a CSS colour`);
    }
  }
  if (!isFiniteNumber(value.strokeWidth) || value.strokeWidth < 0) {
    issue(issues, "invalid_value", `${path}.strokeWidth`, "strokeWidth must be a non-negative number");
  }
  if (!isFiniteNumber(value.fontSize) || value.fontSize <= 0) {
    issue(issues, "invalid_value", `${path}.fontSize`, "fontSize must be a positive number");
  }
  return {
    fill: typeof value.fill === "string" ? value.fill : DEFAULT_NODE_STYLE.fill,
    stroke: typeof value.stroke === "string" ? value.stroke : DEFAULT_NODE_STYLE.stroke,
    strokeWidth: isFiniteNumber(value.strokeWidth) ? value.strokeWidth : DEFAULT_NODE_STYLE.strokeWidth,
    fontSize: isFiniteNumber(value.fontSize) ? value.fontSize : DEFAULT_NODE_STYLE.fontSize,
    textColor: typeof value.textColor === "string" ? value.textColor : DEFAULT_NODE_STYLE.textColor,
  };
}

function validateEdgeStyle(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
): EdgeStyle {
  if (!isRecord(value)) {
    issue(issues, "invalid_type", path, "style must be an object");
    return { ...DEFAULT_EDGE_STYLE };
  }
  if (!isColor(value.stroke)) {
    issue(issues, "invalid_value", `${path}.stroke`, "stroke must be a CSS colour");
  }
  if (!isFiniteNumber(value.strokeWidth) || value.strokeWidth < 0) {
    issue(issues, "invalid_value", `${path}.strokeWidth`, "strokeWidth must be a non-negative number");
  }
  if (typeof value.dashed !== "boolean") {
    issue(issues, "invalid_value", `${path}.dashed`, "dashed must be a boolean");
  }
  return {
    stroke: typeof value.stroke === "string" ? value.stroke : DEFAULT_EDGE_STYLE.stroke,
    strokeWidth: isFiniteNumber(value.strokeWidth) ? value.strokeWidth : DEFAULT_EDGE_STYLE.strokeWidth,
    dashed: typeof value.dashed === "boolean" ? value.dashed : DEFAULT_EDGE_STYLE.dashed,
  };
}

function validateNode(
  value: unknown,
  index: number,
  issues: ValidationIssue[],
): BoardNode {
  const path = `nodes[${index}]`;
  if (!isRecord(value)) {
    issue(issues, "invalid_type", path, "node must be an object");
    return {
      id: `__invalid_${index}`,
      kind: "rectangle",
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      rotation: 0,
      label: "",
      style: { ...DEFAULT_NODE_STYLE },
    };
  }
  const id = typeof value.id === "string" ? value.id : `__invalid_${index}`;
  if (typeof value.id !== "string" || value.id.trim().length === 0) {
    issue(issues, "invalid_value", `${path}.id`, "id must be a non-empty string");
  }
  if (typeof value.kind !== "string" || !NODE_KINDS.includes(value.kind)) {
    issue(issues, "invalid_value", `${path}.kind`, `kind must be one of: ${NODE_KINDS.join(", ")}`);
  }
  for (const key of ["x", "y"] as const) {
    if (!isFiniteNumber(value[key])) {
      issue(issues, "invalid_value", `${path}.${key}`, `${key} must be a finite number`);
    }
  }
  for (const key of ["width", "height"] as const) {
    if (!isFiniteNumber(value[key]) || value[key] <= 0) {
      issue(issues, "invalid_value", `${path}.${key}`, `${key} must be a positive number`);
    }
  }
  if (!isFiniteNumber(value.rotation)) {
    issue(issues, "invalid_value", `${path}.rotation`, "rotation must be a finite number");
  }
  if (typeof value.label !== "string") {
    issue(issues, "invalid_type", `${path}.label`, "label must be a string");
  }
  const style = validateNodeStyle(value.style, `${path}.style`, issues);
  return {
    id,
    kind: NODE_KINDS.includes(value.kind as string) ? (value.kind as NodeKind) : "rectangle",
    x: isFiniteNumber(value.x) ? value.x : 0,
    y: isFiniteNumber(value.y) ? value.y : 0,
    width: isFiniteNumber(value.width) && value.width > 0 ? value.width : 1,
    height: isFiniteNumber(value.height) && value.height > 0 ? value.height : 1,
    rotation: isFiniteNumber(value.rotation) ? value.rotation : 0,
    label: typeof value.label === "string" ? value.label : "",
    style,
  };
}

function validateEdge(
  value: unknown,
  index: number,
  issues: ValidationIssue[],
): BoardEdge {
  const path = `edges[${index}]`;
  if (!isRecord(value)) {
    issue(issues, "invalid_type", path, "edge must be an object");
    return {
      id: `__invalid_${index}`,
      from: "",
      to: "",
      label: "",
      style: { ...DEFAULT_EDGE_STYLE },
    };
  }
  const id = typeof value.id === "string" ? value.id : `__invalid_${index}`;
  if (typeof value.id !== "string" || value.id.trim().length === 0) {
    issue(issues, "invalid_value", `${path}.id`, "id must be a non-empty string");
  }
  for (const key of ["from", "to"] as const) {
    if (typeof value[key] !== "string" || value[key].trim().length === 0) {
      issue(issues, "invalid_value", `${path}.${key}`, `${key} must be a non-empty node id`);
    }
  }
  if (typeof value.label !== "string") {
    issue(issues, "invalid_type", `${path}.label`, "label must be a string");
  }
  const style = validateEdgeStyle(value.style, `${path}.style`, issues);
  return {
    id,
    from: typeof value.from === "string" ? value.from : "",
    to: typeof value.to === "string" ? value.to : "",
    label: typeof value.label === "string" ? value.label : "",
    style,
  };
}

export function validateBoard(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, issues: [{ code: "invalid_type", path: "$", message: "board must be an object" }] };
  }

  for (const key of Object.keys(input)) {
    if (!BOARD_KEYS.has(key)) {
      issue(issues, "unknown_field", key, `unknown top-level field: ${key}`);
    }
  }

  for (const key of ["schemaVersion", "id", "title", "nodes", "edges"] as const) {
    if (!(key in input)) {
      issue(issues, "missing_field", key, `${key} is required`);
    }
  }

  const version = input.schemaVersion;
  if (!isFiniteNumber(version) || !Number.isInteger(version) || version < 1) {
    issue(issues, "invalid_value", "schemaVersion", "schemaVersion must be a positive integer");
  } else if (version > CURRENT_SCHEMA_VERSION) {
    issue(
      issues,
      "unsupported_version",
      "schemaVersion",
      `schemaVersion ${version} is newer than supported version ${CURRENT_SCHEMA_VERSION}`,
    );
  } else if (version < CURRENT_SCHEMA_VERSION) {
    issue(
      issues,
      "unsupported_version",
      "schemaVersion",
      `schemaVersion ${version} requires migration to ${CURRENT_SCHEMA_VERSION}`,
    );
  }

  if (typeof input.id !== "string" || input.id.trim().length === 0) {
    issue(issues, "invalid_value", "id", "id must be a non-empty string");
  }
  if (typeof input.title !== "string") {
    issue(issues, "invalid_type", "title", "title must be a string");
  }

  const nodesRaw = Array.isArray(input.nodes) ? input.nodes : [];
  if (!Array.isArray(input.nodes)) {
    issue(issues, "invalid_type", "nodes", "nodes must be an array");
  }
  const edgesRaw = Array.isArray(input.edges) ? input.edges : [];
  if (!Array.isArray(input.edges)) {
    issue(issues, "invalid_type", "edges", "edges must be an array");
  }

  const nodes = nodesRaw.map((node, index) => validateNode(node, index, issues));
  const edges = edgesRaw.map((edge, index) => validateEdge(edge, index, issues));

  const nodeIds = new Set<string>();
  nodes.forEach((node, index) => {
    if (nodeIds.has(node.id)) {
      issue(issues, "duplicate_id", `nodes[${index}].id`, `duplicate node id: ${node.id}`);
    }
    nodeIds.add(node.id);
  });

  const edgeIds = new Set<string>();
  edges.forEach((edge, index) => {
    if (edgeIds.has(edge.id)) {
      issue(issues, "duplicate_id", `edges[${index}].id`, `duplicate edge id: ${edge.id}`);
    }
    edgeIds.add(edge.id);
    for (const endpoint of ["from", "to"] as const) {
      if (edge[endpoint] !== "" && !nodeIds.has(edge[endpoint])) {
        issue(
          issues,
          "dangling_edge",
          `edges[${index}].${endpoint}`,
          `edge endpoint does not resolve to a node: ${edge[endpoint]}`,
        );
      }
    }
  });

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    board: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: input.id as string,
      title: input.title as string,
      nodes,
      edges,
    },
  };
}

interface LegacyShape {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  color?: string;
}

interface LegacyLink {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const LEGACY_KIND: Record<string, NodeKind> = {
  rect: "rectangle",
  rectangle: "rectangle",
  ellipse: "ellipse",
  diamond: "diamond",
  text: "text",
};

export function migrateToCurrent(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, issues: [{ code: "invalid_type", path: "$", message: "board must be an object" }] };
  }
  const issues: ValidationIssue[] = [];
  if (input.version !== 1) {
    return validateBoard(input);
  }
  if (typeof input.id !== "string" || input.id.trim().length === 0) {
    issue(issues, "invalid_value", "id", "id must be a non-empty string");
  }
  if (typeof input.title !== "string") {
    issue(issues, "invalid_type", "title", "title must be a string");
  }
  if (!Array.isArray(input.shapes)) {
    issue(issues, "invalid_type", "shapes", "shapes must be an array");
  }
  if (!Array.isArray(input.links)) {
    issue(issues, "invalid_type", "links", "links must be an array");
  }
  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const shapes = Array.isArray(input.shapes) ? input.shapes : [];
  const links = Array.isArray(input.links) ? input.links : [];
  const nodes: BoardNode[] = [];
  const seen = new Set<string>();

  shapes.forEach((shape, index) => {
    const path = `shapes[${index}]`;
    if (!isRecord(shape)) {
      issue(issues, "invalid_type", path, "shape must be an object");
      return;
    }
    const legacy = shape as unknown as LegacyShape;
    if (typeof legacy.id !== "string" || legacy.id.trim().length === 0) {
      issue(issues, "invalid_value", `${path}.id`, "id must be a non-empty string");
    } else if (seen.has(legacy.id)) {
      issue(issues, "duplicate_id", `${path}.id`, `duplicate shape id: ${legacy.id}`);
    } else {
      seen.add(legacy.id);
    }
    const kind = LEGACY_KIND[String(legacy.type)];
    if (kind === undefined) {
      issue(issues, "invalid_value", `${path}.type`, `unsupported legacy shape type: ${String(legacy.type)}`);
    }
    for (const key of ["x", "y"] as const) {
      if (!isFiniteNumber(legacy[key])) {
        issue(issues, "invalid_value", `${path}.${key}`, `${key} must be a finite number`);
      }
    }
    for (const key of ["w", "h"] as const) {
      if (!isFiniteNumber(legacy[key]) || legacy[key] <= 0) {
        issue(issues, "invalid_value", `${path}.${key}`, `${key} must be a positive number`);
      }
    }
    const color = legacy.color === undefined ? DEFAULT_NODE_STYLE.stroke : legacy.color;
    if (!isColor(color)) {
      issue(issues, "invalid_value", `${path}.color`, "color must be a CSS colour");
    }
    if (kind !== undefined && isFiniteNumber(legacy.x) && isFiniteNumber(legacy.y) && isFiniteNumber(legacy.w) && isFiniteNumber(legacy.h)) {
      nodes.push({
        id: legacy.id,
        kind,
        x: legacy.x,
        y: legacy.y,
        width: legacy.w,
        height: legacy.h,
        rotation: 0,
        label: typeof legacy.text === "string" ? legacy.text : "",
        style: {
          ...DEFAULT_NODE_STYLE,
          stroke: typeof color === "string" && isColor(color) ? color : DEFAULT_NODE_STYLE.stroke,
        },
      });
    }
  });

  const edges: BoardEdge[] = [];
  const edgeIds = new Set<string>();
  links.forEach((link, index) => {
    const path = `links[${index}]`;
    if (!isRecord(link)) {
      issue(issues, "invalid_type", path, "link must be an object");
      return;
    }
    const legacy = link as unknown as LegacyLink;
    if (typeof legacy.id !== "string" || legacy.id.trim().length === 0) {
      issue(issues, "invalid_value", `${path}.id`, "id must be a non-empty string");
    } else if (edgeIds.has(legacy.id)) {
      issue(issues, "duplicate_id", `${path}.id`, `duplicate link id: ${legacy.id}`);
    } else {
      edgeIds.add(legacy.id);
    }
    for (const endpoint of ["from", "to"] as const) {
      if (typeof legacy[endpoint] !== "string" || legacy[endpoint].trim().length === 0) {
        issue(issues, "invalid_value", `${path}.${endpoint}`, `${endpoint} must be a non-empty shape id`);
      } else if (!seen.has(legacy[endpoint])) {
        issue(issues, "dangling_edge", `${path}.${endpoint}`, `link endpoint does not resolve to a shape: ${legacy[endpoint]}`);
      }
    }
    if (typeof legacy.id === "string") {
      edges.push({
        id: legacy.id,
        from: typeof legacy.from === "string" ? legacy.from : "",
        to: typeof legacy.to === "string" ? legacy.to : "",
        label: typeof legacy.label === "string" ? legacy.label : "",
        style: { ...DEFAULT_EDGE_STYLE },
      });
    }
  });

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return {
    ok: true,
    board: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      id: input.id as string,
      title: input.title as string,
      nodes,
      edges,
    },
  };
}
