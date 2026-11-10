import { describe, expect, it } from "vitest";
import {
  escapeXml,
  renderBoardToSvg,
  sanitizeColor,
  type SvgBoard,
  type SvgEdge,
  type SvgNode,
} from "../src/index.js";

function node(overrides: Partial<SvgNode> & Pick<SvgNode, "id" | "kind">): SvgNode {
  return { x: 0, y: 0, width: 120, height: 60, label: "", ...overrides };
}

function board(nodes: SvgNode[], edges: SvgEdge[] = [], title = ""): SvgBoard {
  return { id: "board-1", title, nodes, edges };
}

describe("escaping and paint", () => {
  it("escapes every XML metacharacter", () => {
    expect(escapeXml(`<script>&"'`)).toBe("&lt;script&gt;&amp;&quot;&apos;");
  });

  it("accepts supported colour forms", () => {
    expect(sanitizeColor("#abc", "#000")).toBe("#abc");
    expect(sanitizeColor("rgb(12, 34, 56)", "#000")).toBe("rgb(12, 34, 56)");
    expect(sanitizeColor("hsl(210, 50%, 40%)", "#000")).toBe("hsl(210, 50%, 40%)");
    expect(sanitizeColor("steelblue", "#000")).toBe("steelblue");
    expect(sanitizeColor("none", "#000")).toBe("none");
  });

  it("falls back for injected paint values", () => {
    expect(sanitizeColor('url("javascript:alert(1)")', "#000")).toBe("#000");
    expect(sanitizeColor('red" onload="alert(1)', "#000")).toBe("#000");
    expect(sanitizeColor("", "#000")).toBe("#000");
    expect(sanitizeColor(undefined, "#000")).toBe("#000");
  });
});

describe("document shell and bounds", () => {
  it("renders an empty board with a fallback frame", () => {
    const svg = renderBoardToSvg(board([]));
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="-24 -24 688 528"');
    expect(svg).not.toContain("<rect");
  });

  it("computes the viewBox from content plus padding", () => {
    const svg = renderBoardToSvg(
      board([node({ id: "a", kind: "rectangle", x: 100, y: 50, width: 100, height: 40 })]),
      { padding: 10 },
    );
    expect(svg).toContain('viewBox="90 40 120 60"');
  });

  it("honours transparent and invalid backgrounds by omitting the rect", () => {
    const first = renderBoardToSvg(board([node({ id: "a", kind: "rectangle" })]), {
      background: "transparent",
    });
    const second = renderBoardToSvg(board([node({ id: "a", kind: "rectangle" })]), {
      background: '"><script>alert(1)</script>',
    });
    expect(first).not.toContain('<rect x="-24"');
    expect(second).not.toContain("<script");
    expect(second).not.toContain('<rect x="-24"');
  });

  it("paints an explicit background across the viewBox", () => {
    const svg = renderBoardToSvg(board([node({ id: "a", kind: "rectangle" })]), {
      background: "#f8fafc",
      padding: 0,
    });
    expect(svg).toContain('<rect x="0" y="0" width="120" height="60" fill="#f8fafc"/>');
  });

  it("includes an escaped title and can omit it", () => {
    const withTitle = renderBoardToSvg(board([], [], "A <B> & C"));
    const withoutTitle = renderBoardToSvg(board([], [], "A <B> & C"), { includeTitle: false });
    expect(withTitle).toContain("<title>A &lt;B&gt; &amp; C</title>");
    expect(withoutTitle).not.toContain("<title>");
  });

  it("is byte-identical across repeated renders", () => {
    const input = board(
      [
        node({ id: "a", kind: "rectangle", label: "Start" }),
        node({ id: "b", kind: "ellipse", x: 220, label: "Review" }),
      ],
      [{ id: "e1", from: "a", to: "b", label: "next", arrow: "target" }],
      "Flow",
    );
    expect(renderBoardToSvg(input)).toBe(renderBoardToSvg(input));
  });
});

describe("node kinds", () => {
  it("renders a rectangle with a wrapped label", () => {
    const svg = renderBoardToSvg(
      board([node({ id: "a", kind: "rectangle", width: 90, label: "Collect the order details" })]),
    );
    expect(svg).toContain('<rect x="0" y="0" width="90" height="60" rx="6"');
    expect(svg).toContain("<text");
    expect(svg.match(/<tspan/g)?.length).toBeGreaterThan(1);
  });

  it("renders an ellipse", () => {
    const svg = renderBoardToSvg(board([node({ id: "a", kind: "ellipse", width: 100, height: 40 })]));
    expect(svg).toContain('<ellipse cx="50" cy="20" rx="50" ry="20"');
  });

  it("renders a diamond polygon", () => {
    const svg = renderBoardToSvg(board([node({ id: "a", kind: "diamond", width: 100, height: 40 })]));
    expect(svg).toContain('points="50,0 100,20 50,40 0,20"');
  });

  it("renders a text node without a visible frame", () => {
    const svg = renderBoardToSvg(board([node({ id: "a", kind: "text", label: "Hello", width: 80 })]));
    expect(svg).toContain('fill="none" stroke="none"');
    expect(svg).toContain("Hello");
  });

  it("renders freehand points as a path", () => {
    const svg = renderBoardToSvg(
      board([
        node({
          id: "a",
          kind: "freehand",
          width: 60,
          height: 40,
          points: [
            { x: 0, y: 0 },
            { x: 20, y: 30 },
            { x: 60, y: 40 },
          ],
        }),
      ]),
    );
    expect(svg).toContain('<path d="M0 0 L20 30 L60 40" fill="none"');
  });

  it("applies rotation around the node centre", () => {
    const svg = renderBoardToSvg(
      board([node({ id: "a", kind: "rectangle", x: 0, y: 0, width: 100, height: 50, rotation: 30 })]),
    );
    expect(svg).toContain('transform="rotate(30 50 25)"');
  });

  it("escapes a script tag in a label and rejects an injected fill", () => {
    const svg = renderBoardToSvg(
      board([
        node({
          id: "a",
          kind: "rectangle",
          label: "<script>alert('x')</script>",
          fill: 'red" onload="alert(1)',
        }),
      ]),
    );
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).not.toContain("onload");
  });

  it("skips non-finite geometry", () => {
    const svg = renderBoardToSvg(
      board([
        node({ id: "bad", kind: "rectangle", x: Number.NaN }),
        node({ id: "good", kind: "rectangle", x: 200 }),
      ]),
    );
    expect(svg).not.toContain('id="bad"');
    expect(svg).toContain('id="good"');
  });
});

describe("edges", () => {
  const from = node({ id: "a", kind: "rectangle", x: 0, y: 0, width: 100, height: 50 });
  const to = node({ id: "b", kind: "rectangle", x: 300, y: 0, width: 100, height: 50 });

  it("clips an unanchored edge to both borders", () => {
    const svg = renderBoardToSvg(board([from, to], [{ id: "e", from: "a", to: "b" }]));
    expect(svg).toContain('<line x1="100" y1="25" x2="300" y2="25"');
  });

  it("uses explicit anchors on the requested sides", () => {
    const svg = renderBoardToSvg(
      board([from, to], [{ id: "e", from: "a", to: "b", fromAnchor: "top", toAnchor: "bottom" }]),
    );
    expect(svg).toContain('<line x1="50" y1="0" x2="350" y2="50"');
  });

  it("adds a marker for target arrows and both ends", () => {
    const target = renderBoardToSvg(board([from, to], [{ id: "e", from: "a", to: "b", arrow: "target" }]));
    const both = renderBoardToSvg(
      board([from, to], [{ id: "e", from: "a", to: "b", arrow: "both", stroke: "#b91c1c" }]),
    );
    expect(target).toContain('marker-end="url(#arrow-0)"');
    expect(target).not.toContain('marker-start="url(#arrow-0)"');
    expect(both).toContain('marker-start="url(#arrow-0)"');
    expect(both).toContain('marker-end="url(#arrow-0)"');
    expect(both).toContain('fill="#b91c1c"');
  });

  it("omits markers for a dead arrow", () => {
    const svg = renderBoardToSvg(board([from, to], [{ id: "e", from: "a", to: "b", arrow: "none" }]));
    expect(svg).not.toContain("<marker");
  });

  it("skips edges with missing endpoints", () => {
    const svg = renderBoardToSvg(board([from], [{ id: "e", from: "a", to: "ghost", arrow: "target" }]));
    expect(svg).not.toContain("<line");
    expect(svg).not.toContain("<marker");
  });

  it("renders dashed strokes and an escaped midpoint label", () => {
    const svg = renderBoardToSvg(
      board([from, to], [{ id: "e", from: "a", to: "b", dashed: true, label: "<next>" }]),
    );
    expect(svg).toContain('stroke-dasharray="6 4"');
    expect(svg).toContain("&lt;next&gt;");
    expect(svg).toContain('x="200" y="25"');
  });
});
