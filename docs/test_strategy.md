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
- Fixed fonts and themes (light/dark).
- Mock mode: either app env flag or Playwright `route()` interception.
- PRs fail on visual diffs unless approved; interaction tests must always pass.

---

## A) Screenshot (Visual) Tests

### Goal
One screenshot per **screen/route** in a stable "loaded" state, with minimal variants.

### Screen Map
Maintain `tests/visual/screen-map.yml` with:
- `id`, `path`, `setup`, `variants`, `notes`.

### Baseline Policy
- Store under `tests/visual/__screenshots__/<id>/<variant>.png`.
- Thresholds: start at `0.01`, ratchet down to `0.003`.
- Mask nondeterministic widgets (e.g., avatars).

### Coverage
- 100% of navigable screens.
- At least one "long content" variant for scrollable screens.

### Flake Hardening
- Wait for network idle + key selectors.
- Ensure fonts are loaded.
- Retry capture if DOM hash unchanged but diff > threshold.

---

## B) Interaction (Flow) Tests

### Goal
Cover **core flows** with Playwright; allow opt-in screenshots after each step.

### Flow Catalog
Maintain `tests/e2e/flows.yml`:
- `id`, `preconditions`, `steps` (action, selector, assert, snap, mask).

### Snapshot Policy
- Snap at start/end, after transitions, and complex states.
- Optional: snap at every step if flow is fragile.

### Assertion Style
- State assertions (`toBeVisible`, `toHaveText`, `toHaveCount`) preferred.
- DOM invariants for lists, not arbitrary waits.

---

## Fixtures & Scenarios
- Global dataset: one JSON tree (`user.json`, `projects.json`, `tasks.json`).
- Variants: short/medium/long lists.
- Edge packs: empty states, max lists, i18n, failed sync.
- Fixtures versioned in git.

---

## Variants Matrix
- **PRs**: Desktop, light theme.
- **Nightly**: Desktop (light+dark), mobile (390×844).
- Expand only when responsive differences matter.

---

## Naming Conventions
- Tests: `tests/visual/[id].spec.ts`, `tests/e2e/[flow].spec.ts`.
- Baselines: `__screenshots__/[id]/[variant].png`.
- Step screenshots: `__steps__/[flow]/[NN]-[slug].png`.
- Data-test IDs: semantic and stable.

---

## Gating & Review
- PR check 1: Visual diffs must be approved with a one-liner "why changed".
- PR check 2: Interaction flows must pass; failing step shows trace + screenshot.
- Labels:
  - `ui-sensitive`: run dark theme + mobile on PR.
  - `visual-update`: baseline update intended; auto-post diffs.
- Fail if new interactive element lacks `data-testid`.

---

## Flakiness Guardrails
- Disable timers/animations.
- Stub latency where loaders matter.
- Await visible state, not arbitrary sleeps.
- Scroll to top for consistent screenshots.

---

## Reports & Artifacts
- Publish:
  - Visual diffs (gallery).
  - Playwright HTML report + traces/videos.
  - Flow coverage table (flows × steps × screenshots).
- Keep last 20 PR runs of screenshot diffs.

---

## Incremental Rollout
**Day 1–2**: Mock mode, fixtures, freeze time, disable animations.  
**Day 3–4**: First 10 screen baselines, 3 core flows.  
**Day 5**: Wire CI (visual gating, e2e flows, artifacts).  
**Day 6–7**: Expand to full sitemap, add edge cases, nightly dark+mobile+cross-browser.

---

## Reviewer Rules
- Baseline changes require "why changed" note + UX explanation.
- New flows/screens require fixtures and catalog updates.
- Reject tests with arbitrary sleeps instead of state assertions.

---
