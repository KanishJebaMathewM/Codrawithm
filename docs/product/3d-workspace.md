# 3D Workspace

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

The 3D Workspace is a browser-native 3D sketching environment built into Codrawithm. It is designed for conceptual modeling — sketching out ideas in three dimensions collaboratively — not for professional CAD or 3D asset production.

Priority: **P2** — planned for Phase 3 after the core 2D canvas and algorithm visualization features are stable.

See [ADR-006](../architecture/architecture-decisions/ADR-006-3d-rendering-framework.md) for the rendering framework decision and [3D Rendering](../architecture/3d-rendering.md) for technical details.

---

## Target Use Cases

| Use Case | Example |
|---------|---------|
| Spatial concept sketching | Sketch the physical layout of a server room |
| Game level prototyping | Block out a level design before implementing it |
| Hardware product sketching | Sketch the shape of a device enclosure |
| AR/VR spatial design | Design the layout of a VR scene |
| Architecture visualization | Sketch a building's floor plan in 3D |
| Teaching 3D concepts | Demonstrate 3D coordinate systems, vectors |

---

## Interface

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  3D Toolbar: [Box] [Sphere] [Cylinder] [Cone] [Torus] | [Light]  │
├──────────────────────────┬───────────────────────────────────────┤
│                          │  Scene Hierarchy                      │
│                          │  ├── Box_001                          │
│   3D Viewport            │  ├── Sphere_002                       │
│   (Three.js / R3F)       │  └── Light_001 (Ambient)             │
│                          ├───────────────────────────────────────┤
│                          │  Properties (selected object)         │
│                          │  Position: X[0] Y[0] Z[0]            │
│                          │  Rotation: X[0] Y[0] Z[0]            │
│                          │  Scale:    X[1] Y[1] Z[1]            │
└──────────────────────────┴───────────────────────────────────────┘
```

### Camera Controls

| Gesture / Input | Action |
|----------------|--------|
| Left-drag | Orbit camera around scene center |
| Right-drag | Pan camera |
| Scroll wheel | Zoom in/out |
| Middle-drag | Pan camera (alternative) |
| F key | Frame selected object |
| Numpad 1 / 3 / 7 | Front / Right / Top view |
| Two-finger drag (touch) | Pan |
| Pinch (touch) | Zoom |
| Two-finger rotate (touch) | Orbit |

---

## Primitive Shapes

All primitives are created by clicking the toolbar icon then clicking in the 3D viewport.

| Primitive | Three.js Geometry | Default Dimensions |
|-----------|------------------|-------------------|
| Box | BoxGeometry | 1m × 1m × 1m |
| Sphere | SphereGeometry | radius 0.5m, 32 segments |
| Cylinder | CylinderGeometry | radius 0.5m, height 1m |
| Cone | ConeGeometry | radius 0.5m, height 1m |
| Torus | TorusGeometry | outer 0.5m, tube 0.1m |
| Plane | PlaneGeometry | 2m × 2m |

### Interaction with Primitives

- **Select:** Click to select. Shows bounding box gizmo.
- **Move:** Drag the X/Y/Z axis handle of the gizmo. Snap to grid if grid is enabled.
- **Rotate:** Click the rotation ring gizmo. Constrained to selected axis.
- **Scale:** Drag the uniform scale corner handle or per-axis scale handles.
- **Delete:** Delete key removes selected object.
- **Duplicate:** Ctrl+D duplicates in place.

---

## Materials

Each object has a material with the following configurable properties:

| Property | Options | Default |
|----------|---------|---------|
| Color | Color picker | #94a3b8 (slate) |
| Material Type | Flat, Phong, Wireframe, Lambert | Phong |
| Opacity | 0–100% | 100% |
| Roughness | 0–1 (Phong only) | 0.5 |
| Metalness | 0–1 (Phong only) | 0 |

---

## Lighting

| Light Type | Description | Default |
|-----------|-------------|---------|
| Ambient | Flat fill light, no shadows | Intensity 0.6, white |
| Directional | Parallel rays, cast shadows | Intensity 0.8, from upper right |
| Point | Omnidirectional from a point | Off by default |
| Spot | Cone-shaped beam | Off by default |

The default scene starts with one ambient and one directional light.

---

## Scene Hierarchy

The Scene Hierarchy panel (right side) shows all objects in the 3D scene as a flat list (Phase 1) or tree (Phase 2). Features:
- Click object name to select it in the viewport.
- Double-click to rename.
- Drag to reorder (visual order only; no effect on rendering).
- Eye icon to toggle visibility.
- Lock icon to prevent accidental selection.

---

## Grid and Snapping

- Grid plane rendered in the XZ plane (floor) at Y=0.
- Grid snapping quantizes translations to 0.25m, 0.5m, or 1m increments.
- Angle snapping quantizes rotations to 15° increments.
- Both toggleable in the toolbar.

---

## Collaboration in 3D

Real-time collaboration in the 3D workspace uses the same Yjs CRDT layer as the 2D canvas. Each 3D object's transform (position, rotation, scale) and material properties are CRDT-backed.

**Collaborative cursors in 3D:** Each collaborator's cursor is represented as a small floating sphere in the 3D scene at their ray-cast position on the last surface they hovered.

**Conflict behavior:** If two users move the same object simultaneously, the last-write-wins behavior applies at the field level (position X/Y/Z are separate CRDT fields). This may cause minor jumps but is acceptable for a sketching tool.

---

## Data Model

```typescript
interface ThreeDObject {
  id: string;
  type: "box" | "sphere" | "cylinder" | "cone" | "torus" | "plane" | "import";
  name: string;
  position: Vec3;    // { x, y, z }
  rotation: Vec3;    // Euler angles in radians
  scale: Vec3;
  material: {
    color: string;
    materialType: "flat" | "phong" | "wireframe" | "lambert";
    opacity: number;
    roughness: number;
    metalness: number;
  };
  visible: boolean;
  locked: boolean;
}

interface ThreeDScene {
  objects: ThreeDObject[];
  lights: ThreeDLight[];
  camera: { position: Vec3; target: Vec3; fov: number; };
  gridEnabled: boolean;
  gridSize: number;
}
```

---

## Import (Future)

In a later phase, the 3D workspace will support importing simple 3D files:

| Format | Status |
|--------|--------|
| GLTF / GLB | Planned (Phase 4) |
| OBJ + MTL | Planned (Phase 4) |
| STL | Planned (Phase 4) |

All imports will be validated for file size (max 50 MB) and sanitized before loading.

---

## Non-Goals

The 3D workspace explicitly does not aim to support:
- Animation rigging or keyframe animation.
- Physics simulation.
- NURBS or parametric modeling.
- Professional rendering (ray tracing, PBR pipelines).
- CAD-level precision (dimensioned drawings, constraints).

See [Non-Goals](../vision/non-goals.md#7-full-cad--professional-3d-modeling).

---

## Related Documents

- [3D Rendering Architecture](../architecture/3d-rendering.md)
- [ADR-006: 3D Rendering Framework](../architecture/architecture-decisions/ADR-006-3d-rendering-framework.md)
- [Workspace Types](workspace-types.md)
