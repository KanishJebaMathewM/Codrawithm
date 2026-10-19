# Testing Strategy

**Status:** Proposed  
**Last Updated:** 2024-01-15

---

## Overview

Codrawithm uses a multi-layer testing strategy covering unit tests, integration tests, end-to-end tests, visual regression tests, and canvas-specific tests. The goal is high confidence in correctness with fast feedback loops.

---

## Test Pyramid

```
         ┌────────────────────┐
         │   E2E / Visual     │  (Few, slow, high confidence)
         │   (Playwright)     │
         └────────────────────┘
        ┌──────────────────────┐
        │   Integration Tests  │  (Moderate, medium speed)
        │   (Vitest + testcont)│
        └──────────────────────┘
       ┌────────────────────────┐
       │   Unit Tests           │  (Many, fast, targeted)
       │   (Vitest / Rust tests)│
       └────────────────────────┘
```

---

## Unit Tests

### Frontend (Vitest)

Unit tests cover:
- Canvas utility functions (coordinate transforms, hit testing, bounding box computation).
- Algorithm step generators (bubble sort, merge sort, BFS, etc.).
- State management store reducers.
- Validation functions (input parsing, schema validation).
- UI component logic (not rendering — that's integration/visual).

```typescript
// features/algorithm-viz/sort/merge-sort.test.ts
import { generateMergeSortSteps } from './merge-sort';

describe('generateMergeSortSteps', () => {
  it('produces a correct step sequence for [5, 3, 8, 1]', () => {
    const steps = generateMergeSortSteps([5, 3, 8, 1]);
    expect(steps.at(-1)?.stateSnapshot.array).toEqual([1, 3, 5, 8]);
  });

  it('produces the expected number of comparison steps', () => {
    const steps = generateMergeSortSteps([4, 3, 2, 1]);
    const comparisons = steps.filter(s => s.highlights.comparing.length > 0);
    expect(comparisons.length).toBeGreaterThan(0);
  });
});
```

**Coverage target:** ≥ 80% for business logic modules. Lower tolerance for rendering code.

### Backend (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_algorithm_input_valid() {
        let result = parse_algorithm_input("5,3,8,1");
        assert_eq!(result.unwrap(), vec![5, 3, 8, 1]);
    }

    #[test]
    fn test_parse_algorithm_input_invalid() {
        let result = parse_algorithm_input("5,abc,8");
        assert!(result.is_err());
    }
}
```

---

## Integration Tests

### Frontend Integration Tests

Integration tests render components in a test environment and test user interactions:

```typescript
// features/canvas/tools/select-tool.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CanvasRoot } from '../canvas-root';

test('clicking a rectangle selects it', async () => {
  const { canvas } = render(<CanvasRoot initialObjects={[mockRectangle]} />);
  await userEvent.click(canvas, { clientX: 150, clientY: 90 }); // Center of mock rect
  expect(screen.getByTestId('selection-box')).toBeInTheDocument();
});
```

### Backend Integration Tests (with testcontainers-rs)

```rust
#[tokio::test]
async fn test_create_board() {
    let pg = PostgresContainer::start().await;
    let pool = PgPool::connect(&pg.connection_string()).await.unwrap();
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();

    let user = create_test_user(&pool).await;
    let board = create_board(&pool, user.id, "Test Board").await.unwrap();

    assert_eq!(board.title, "Test Board");
    assert_eq!(board.owner_id, user.id);
}
```

---

## End-to-End Tests (Playwright)

E2E tests simulate real user interactions in a browser against a running application.

**Setup:** Playwright spins up the full app (frontend + backend via Docker Compose) before running.

```typescript
// e2e/canvas/draw-rectangle.spec.ts
import { test, expect } from '@playwright/test';

test('user can draw a rectangle and label it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New Board' }).click();

  // Activate rectangle tool
  await page.keyboard.press('r');

  // Draw rectangle by drag
  const canvas = page.locator('canvas').first();
  await canvas.dragTo(canvas, {
    sourcePosition: { x: 100, y: 100 },
    targetPosition: { x: 300, y: 200 },
  });

  // Label the rectangle
  await page.keyboard.type('API Server');
  await page.keyboard.press('Escape');

  // Verify rectangle exists
  await expect(page.getByText('API Server')).toBeVisible();
});
```

**Key E2E scenarios:**
- Draw shapes, connect with arrows, add text.
- Algorithm visualization: create input, step through, annotate.
- Collaboration: two browsers edit the same board.
- Sharing: copy link, open in incognito, verify read-only.
- Export: PNG and JSON export produce correct output.

---

## Visual Regression Tests

Visual regression tests capture screenshots of key UI states and compare them against baselines.

**Tool:** Playwright's built-in screenshot comparison with `--update-snapshots` flag for baseline updates.

```typescript
test('canvas renders correctly with 20 shapes', async ({ page }) => {
  await loadBoardWithFixture(page, 'fixtures/twenty-shapes.json');
  await expect(page).toHaveScreenshot('twenty-shapes.png', { threshold: 0.01 });
});
```

Baseline screenshots are committed to the repository. CI fails if a PR changes the visual output beyond the threshold.

---

## Canvas-Specific Tests

### Hit Testing Tests

```typescript
test('hit test returns the topmost object at a point', () => {
  const objects = [rect1, rect2_overlapping_rect1];
  const hit = hitTest({ x: 150, y: 100 }, objects);
  expect(hit?.id).toBe(rect2_overlapping_rect1.id);
});
```

### Algorithm Step Tests

All algorithm step generators have tests verifying:
- The final state is correctly sorted / traversed.
- Each step contains correct `highlights`.
- Step count is within expected range.
- Edge cases: empty array, single element, already sorted, reverse sorted.

---

## Performance Benchmarks

Performance tests run separately from the CI test suite (they are slow):

```typescript
// benchmarks/canvas-fps.bench.ts
bench('canvas FPS with 500 objects', () => {
  // Measures fps via requestAnimationFrame callback
});
```

See [ADR-015](../architecture/architecture-decisions/ADR-015-performance-measurement.md) for performance measurement strategy.

---

## Test Coverage

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Frontend unit | Vitest | ≥ 80% (business logic) |
| Frontend integration | Testing Library | Key interaction paths |
| Backend unit | Rust tests | ≥ 80% (service layer) |
| Backend integration | testcontainers | All API endpoints |
| E2E | Playwright | 20 critical user journeys |
| Visual regression | Playwright screenshots | Key canvas states |

---

## Related Documents

- [Coding Standards](coding-standards.md)
- [Performance Engineering](performance-engineering.md)
- [ADR-015: Performance Measurement](../architecture/architecture-decisions/ADR-015-performance-measurement.md)
