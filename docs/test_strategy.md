# SvelteKit Test Strategy: Visual & Interaction Tests

## Objectives
Two complementary test types to protect against regressions and AI sloppiness:
- **Screenshot (visual) tests**: cover every screen in a stable "loaded" state using global mock data.
- **Interaction (flow) tests**: Playwright user flows with optional step-by-step screenshots.

---

## Ground Rules
- Freeze time, RNG, and network: deterministic fixtures.
- Disable animations via `prefers-reduced-motion` + CSS guard.
- Fixed browser (Chromium in PRs), fixed viewport (1280×800), fixed timezone (Europe/Warsaw).
- Fixed theme: **dark mode only** (default for all tests).
- Mock mode: either app env flag or Playwright `route()` interception.
- PRs fail on visual diffs unless approved; interaction tests must always pass.

---

## A) Screenshot (Visual) Tests

### Goal
One screenshot per **screen/view** in a stable "loaded" state, with minimal set of variants.

### Baseline Policy
- Have one test file per screen/view under `tests/visual/[id].spec.ts` with test per variant.
- Store screenshot under `tests/visual/__screenshots__/[id]/[variant].png`.

### Coverage
- 100% of navigable screens in both empty and full state.

---

## B) Interaction (Flow) Tests

### Goal
Cover **core flows** with Playwright; allow opt-in screenshots after each step to cover complex states.

### Assertion Style
- State assertions (`toBeVisible`, `toHaveText`, `toHaveCount`) preferred.
- DOM invariants for lists, not arbitrary waits.

---

## Fixtures & Scenarios
- Use existing mockData.ts dataset
- Screenshots for after every major expected visual change (e.g. dialog opened, item added, filter applied).

---

## Naming Conventions
- Tests: `tests/visual/[id].spec.ts`, `tests/e2e/[flow].spec.ts`.
- Baselines: `tests/visual/__screenshots__/[id]/[variant].png`.
- Step screenshots: `tests/e2e/__steps__/[flow]/[NN]-[slug].png`.
- Introduce data-test IDs where needed.

---

## Gating & Review
- PR check 1: Visual diffs must be approved with a one-liner "why changed".
- PR check 2: Interaction flows must pass; failing step shows trace + screenshot.
- Fail if new interactive element lacks `data-testid`.

---

## Flakiness Guardrails
- Disable timers/animations.
- Stub latency where loaders matter.
- Await visible state, not arbitrary sleeps.
- Scroll to top for consistent screenshots.

---

