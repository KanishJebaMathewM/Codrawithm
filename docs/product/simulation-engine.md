# Simulation Engine

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The Simulation workspace type allows users to build and animate dynamic systems — state machines, traffic simulations, distributed system models, cellular automata, and any other system that evolves step by step over time.

Priority: **P2** — planned after core canvas and algorithm visualization are stable.

The Simulation Engine reuses the step-playback infrastructure from Algorithm Visualization but generalizes it to arbitrary user-defined systems rather than pre-built algorithm step sequences.

---

## Core Concept

A simulation consists of:
- **Objects:** Visual elements on the canvas that have state (position, color, label, numeric properties).
- **Rules:** Conditions and actions that define how objects transition from one state to the next.
- **Timeline:** A discrete time axis. The simulation advances one tick at a time.
- **Playback Controls:** Same as algorithm visualization — forward, backward, auto-play, speed.

This model is intentionally simple and constrained. It is not a general programming environment — users define state and transitions visually, not in code.

---

## Use Cases

| Use Case | Description |
|---------|-------------|
| Finite State Machine | Visualize FSM states and transitions with an event sequence |
| Traffic Simulation | Cars moving through intersections with traffic lights |
| Distributed System | Nodes sending messages; show delivery, failure, retries |
| Cellular Automaton | Conway's Game of Life; rule-based grid evolution |
| Network Packet Flow | Packets traversing a network topology step by step |
| Algorithm Comparison | Side-by-side simulation of two algorithms on the same input |

---

## Simulation Objects

Each simulation object is a canvas shape extended with a **state bag** — a set of named properties that can change over time.

```typescript
interface SimulationObject {
  id: string;
  baseObjectId: string;        // References a canvas shape (rectangle, circle, etc.)
  stateBag: Record<string, SimulationValue>;  // Arbitrary key-value state
  currentStateLabel: string;   // Optional: shown inside the shape
  transitionRules: TransitionRule[];
}

type SimulationValue = string | number | boolean;

interface TransitionRule {
  condition: string;   // Simple expression: "state == 'waiting' && elapsed > 3"
  action: string;      // Simple action: "state = 'active'; color = 'green'"
  onTick: boolean;     // If true, evaluated every tick; if false, triggered by event
}
```

Rules use a simple, sandboxed expression language (not full JavaScript) to prevent code injection.

---

## Simulation Canvas Layout

```
┌───────────────────────────────────────────────────────────────────┐
│  Simulation Toolbar: [Add Object] [Add Rule] [Run] [Step] [Reset] │
├─────────────────────────────┬─────────────────────────────────────┤
│                             │  Properties Panel                    │
│   Canvas                    │  Selected: TrafficLight_01           │
│   (simulation objects and   │  State: { phase: "red",             │
│    transition arrows)       │           timer: 12 }               │
│                             │                                      │
│                             │  Transition Rules:                   │
│                             │  1. phase=="red" && timer>15         │
│                             │     → phase="green"; timer=0         │
│                             │  2. phase=="green" && timer>10       │
│                             │     → phase="yellow"; timer=0        │
├─────────────────────────────┴─────────────────────────────────────┤
│  [⏮ Reset] [◀ Back] [Tick 8 / --] [▶ Next] [▶▶ Auto-play]  1x ──●│
└───────────────────────────────────────────────────────────────────┘
```

---

## Rule Editor

Rules are edited via a structured form, not free-form code:

```
Condition:  [ state ] [ == ] [ "red" ]  AND  [ timer ] [ > ] [ 15 ]
Action:     Set [ state ] to [ "green" ]
            Set [ timer  ] to [ 0 ]
Trigger:    [ On every tick ▼ ]
```

The rule editor validates the expression before saving. Invalid rules are highlighted in red.

---

## Playback and Recording

The simulation can be played in two modes:

**Step Mode:** The user advances tick-by-tick using the Step button or arrow keys. Each tick applies all transition rules. The canvas updates to reflect the new state of all simulation objects.

**Record Mode:** The simulation runs automatically and records a snapshot of every tick. The recording can then be played back like a video — forward, backward, scrub to any tick.

**Step History:** The last 1,000 ticks are kept in memory. Earlier ticks can be retrieved from the recorded snapshot file.

---

## Comparison with Algorithm Visualization

| Feature | Algorithm Visualization | Simulation Engine |
|---------|------------------------|-------------------|
| Algorithm types | Pre-built (sort, BFS, etc.) | User-defined |
| Step definition | Pre-computed, immutable | Computed on tick |
| Input | Array or graph | Custom simulation objects |
| Determinism | Always deterministic | Rules can include randomness |
| Step annotation | ✓ | ✓ |
| Share link | ✓ | ✓ (includes rule definitions) |

---

## Built-in Templates

To reduce the setup barrier, the Simulation workspace ships with templates:

| Template | Description |
|---------|-------------|
| Traffic Light | 3 states: red, yellow, green with configurable durations |
| Conway's Game of Life | 20×20 grid, life rules pre-configured |
| Simple Queue | Producer → Queue → Consumer with configurable rates |
| Ping-Pong | Two nodes sending a message back and forth |
| State Machine (blank) | A blank 3-state FSM with empty transition rules |

---

## Related Documents

- [Algorithm Visualization](algorithm-visualization.md)
- [Workspace Types](workspace-types.md)
- [Canvas Engine](../architecture/canvas-engine.md)
