# @codrawithm/connector-router

Orthogonal connector routing with a configurable clearance around obstacles. The router builds a sparse Hanan grid from the endpoint stubs and obstacle edges, then runs A* over that grid. Routes are deterministic and every segment is axis aligned.

## Install

```
npm install
```

## Use

```ts
import { routeConnector } from "@codrawithm/connector-router";

const route = routeConnector(
  { id: "cart", bounds: { x: 0, y: 0, width: 140, height: 70 }, side: "right" },
  { id: "paid", bounds: { x: 360, y: 0, width: 140, height: 70 }, side: "left" },
  {
    margin: 20,
    obstacles: [{ id: "note", bounds: { x: 200, y: -40, width: 60, height: 150 } }],
  },
);

if (route !== null) {
  console.log(route.points, route.length);
}
```

## Behaviour

- Endpoints name a side. The router leaves each node perpendicular to that side with a stub of `margin`, so connectors do not graze the shape they belong to.
- Other obstacles are inflated by `margin`; a route may run along the inflated boundary but never through its interior.
- Source and target rectangles are treated as hard obstacles so a detour cannot cut through its own endpoints.
- A* uses Manhattan distance and a fixed neighbour order, which makes ties resolve the same way on every run.
- Collinear points are removed from the result.
- A missing route returns `null`. Invalid bounds or a negative margin throw.

The router does not draw anything and has no dependency on the board schema. Feed it bounds from your document and use the points to build a polyline or a rounded path.

## Test

```
npm test
npm run typecheck
```
