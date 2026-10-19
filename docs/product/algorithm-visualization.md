# Algorithm Visualization

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Algorithm Visualization is one of Codrawithm's primary differentiators. The system provides an interactive, step-by-step visualization of data structures and algorithms with custom user-defined inputs, step annotations, and shareable links that preserve the full visualization state.

See also: [Workspace Types — Algorithm Visualization](workspace-types.md#workspace-type-5-algorithm-visualization).

---

## Core Design Principles

1. **Custom input is non-negotiable.** A visualization with a fixed, pre-built example teaches less than one the user constructed themselves.
2. **Step granularity is per comparison or per swap, not per "phase."** Fine-grained steps let learners find the exact moment they don't understand.
3. **Annotations are first-class.** The point is not just watching — it is building a personal annotated record of understanding.
4. **Share links are stateful.** A shared link must reproduce the exact algorithm, input, step, and annotations, not just link to the algorithm type.
5. **Accessibility.** Color is supplemented with labels, arrows, and step counters so visualizations are not unusable for color-blind users.

---

## Supported Algorithms

### Sorting Algorithms (Phase 1 — P0)

| Algorithm | Time Complexity (avg) | Space Complexity | Visualization Focus |
|-----------|----------------------|-----------------|---------------------|
| Bubble Sort | O(n²) | O(1) | Adjacent comparisons; swaps highlighted in red |
| Selection Sort | O(n²) | O(1) | Minimum-finding scan; selected element highlighted |
| Insertion Sort | O(n²) | O(1) | Insertion position scanning; shift animation |
| Merge Sort | O(n log n) | O(n) | Recursive split tree + merge arrows |
| Quick Sort | O(n log n) avg | O(log n) | Pivot selection; partition boundary arrows |
| Heap Sort | O(n log n) | O(1) | Heap tree view + array view side by side |

### Graph Algorithms (Phase 1 — P1)

| Algorithm | Description | Visualization Focus |
|-----------|-------------|---------------------|
| BFS | Breadth-first search | Level-by-level expansion; visited queue visualization |
| DFS | Depth-first search | Stack trace; backtrack animation |
| Dijkstra | Shortest path (non-negative weights) | Priority queue; distance table side panel |
| A* | Heuristic shortest path | Open/closed set; heuristic cost display |

### Tree Algorithms (Phase 1 — P1)

| Algorithm | Description | Visualization Focus |
|-----------|-------------|---------------------|
| BST Insert | Binary search tree insertion | Traversal path + insertion point animation |
| BST Delete | BST node deletion with successor replacement | Three cases (leaf, one child, two children) |
| AVL Rotation | AVL tree rebalancing rotations | Single/double rotation animation with balance factors |
| Heap Insert | Binary heap insertion + sift-up | Array + tree views; sift-up arrows |
| Heap Extract-Min/Max | Heap extraction + sift-down | Replacement + sift-down arrows |

---

## Step Model

Each algorithm execution is pre-computed into a sequence of immutable **steps**. A step captures:

```typescript
interface AlgorithmStep {
  stepIndex: number;
  totalSteps: number;
  description: string;           // Human-readable explanation of this step
  highlights: HighlightSet;      // Which elements are highlighted, and how
  stateSnapshot: AlgorithmState; // Full state of the data structure at this step
  annotations: string[];         // User-added annotations for this step
}

interface HighlightSet {
  comparing: number[];    // Indices being compared (shown in yellow)
  swapping: number[];     // Indices being swapped (shown in red)
  sorted: number[];       // Indices confirmed sorted (shown in green)
  pivot: number | null;   // Pivot index (quick sort)
  current: number | null; // Current pointer
}
```

The full step sequence is computed on the frontend (or backend for large inputs) when the user clicks "Generate Visualization." This is stored in the board's algorithm object and is immutable once generated for a given input.

### Step Playback Controls

```
| ⏮ First | ◀ Back | [Step 4 / 28] | ▶ Next | ⏭ Last | ▶▶ Auto-play |
                                              Speed: [────●──] 2x
```

- **First/Last:** Jump to the first or last step.
- **Back/Next:** Move one step at a time. Keyboard: Left/Right arrow keys.
- **Step counter:** Shows current step / total steps.
- **Auto-play:** Plays through steps automatically. Pauses at the last step or on user interaction.
- **Speed:** 0.5x to 10x speed. Default: 1x (approximately one step per 800 ms).

---

## Array Visualization

For sorting algorithms, the array is displayed as a row of vertical bars (bar chart visualization) with numeric labels beneath each bar.

### Visual Encoding

| State | Color | Meaning |
|-------|-------|---------|
| Default | Gray (#94a3b8) | Unsorted, not currently active |
| Comparing | Yellow (#fbbf24) | Elements currently being compared |
| Swapping | Red (#f87171) | Elements currently being swapped |
| Sorted | Green (#4ade80) | Elements in their final sorted position |
| Pivot | Purple (#c084fc) | Current pivot element (quick sort) |
| Current | Blue (#60a5fa) | Current pointer / cursor |

### Swap Animation

When a swap step occurs, the two bars animate horizontally to their new positions over 200–400 ms (configurable via speed slider). The animation is a CSS transition on the `left` property, not a JavaScript animation loop, to maintain 60 fps at small array sizes.

For large arrays (n > 100), animations are disabled and the state simply updates instantaneously.

---

## Graph Visualization

For graph algorithms (BFS, DFS, Dijkstra, A*):

### Graph Editor

Before running a graph algorithm, the user builds a custom graph using the graph editor:
- Click empty canvas to add a node. Nodes are labeled with sequential letters (A, B, C...) by default; label is editable.
- Click one node then another to add an edge. For weighted algorithms (Dijkstra, A*), a weight dialog appears.
- Drag nodes to reposition. The layout is saved with the visualization.
- Delete key removes selected nodes or edges.

### Graph Visualization States

| Node State | Color | Meaning |
|-----------|-------|---------|
| Unvisited | Gray | Not yet reached by the algorithm |
| In Queue/Frontier | Yellow | In BFS queue or DFS stack |
| Visiting | Orange | Currently being processed |
| Visited | Blue | Processing complete |
| Path | Green | Part of the final shortest path (Dijkstra/A*) |

Edge states mirror node states (highlighted when traversed).

### Side Panel

During BFS: shows the queue contents as an ordered list.  
During DFS: shows the call stack.  
During Dijkstra: shows a distance table (node → current shortest distance).

---

## Tree Visualization

Binary trees (BST, AVL, heap) are displayed as a centered tree with the following layout:
- Each node is a circle with its value inside.
- Edges connect parent to children.
- The layout auto-resizes as nodes are added or removed.
- For heap sort, the array is shown simultaneously below the tree, with lines connecting array indices to tree nodes.

### AVL Rotation Animation

For AVL rotations, the rotation is animated in two phases:
1. **Phase 1:** The subtree being rotated highlights (300 ms).
2. **Phase 2:** Nodes animate to their new positions via CSS transition (500 ms).

The step description explains whether it is a left rotation, right rotation, left-right, or right-left case.

---

## Annotations System

### Creating Annotations

Users can annotate any step:
1. Double-click on the step counter, or right-click → "Add Annotation to This Step."
2. A text input appears anchored to the step number.
3. Supports plain text and Markdown (bold, italic, inline code, links).
4. Multiple annotations can be added to a single step.

### Annotation Storage

Annotations are stored as part of the board's algorithm object:

```typescript
interface AlgorithmAnnotations {
  [stepIndex: number]: Annotation[];
}

interface Annotation {
  id: string;
  text: string;        // Markdown-formatted
  authorId: string;
  createdAt: string;   // ISO 8601
}
```

### Annotation Display

When viewing a step that has annotations, an annotation panel slides in from the right, showing all annotations for that step. Annotations are visible to all collaborators.

---

## Shareable State Links

The share URL for an algorithm visualization encodes:

```
https://codrawithm.app/board/{boardId}?
  algo=mergeSort
  &input=5,3,8,1,9,2
  &step=4
  &annotationsHash=abc123   // Hash referencing stored annotations
```

Opening a share link:
1. Loads the board.
2. Re-generates the visualization for the given algorithm and input.
3. Jumps to the specified step.
4. Shows all annotations for that step.

For read-only share links, annotations are included in the URL payload (base64-encoded) up to 4 KB. Beyond that, they are stored server-side and referenced by hash.

---

## Performance Constraints

| Constraint | Limit | Notes |
|-----------|-------|-------|
| Maximum array size for sorting | 200 elements | Larger inputs render without per-element animation |
| Maximum graph nodes | 50 nodes | More nodes may cause layout to become unreadable |
| Maximum tree depth | 20 levels | Auto-zoom required beyond this |
| Step computation time | < 50 ms | Measured by Jest benchmark (see NFR-007) |
| Bar chart render FPS | ≥ 55 fps | For arrays ≤ 50 elements |

---

## Accessibility

- **Color is not the only encoding.** Every state also has an icon or label badge.
- **Keyboard navigation.** Arrow keys navigate steps. Tab focuses controls.
- **Step descriptions.** Each step includes a plain-language `description` field that is also spoken by screen readers via `aria-live` region.
- **Reduced motion support.** If `prefers-reduced-motion` is set, swap animations are skipped.

---

## Related Documents

- [Workspace Types](workspace-types.md)
- [Teaching & Presentations](teaching-and-presentations.md)
- [Canvas Engine](../architecture/canvas-engine.md)
- [Feature Catalog — ALGO](../vision/feature-catalog.md#algorithm-visualization-algo)
