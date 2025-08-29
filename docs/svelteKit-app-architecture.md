# Canonical SvelteKit App Structure (Frontend-Only)

A concise guide to structure a SvelteKit SPA that leans on SvelteKit’s strengths.

## 1) Directory Layout (Keep features in `routes/`, reusables in `lib/`)

```
src/
  lib/
    components/          # Reusable UI building blocks
    stores/              # Global/shared state (writable/derived)
    utils/               # Pure helpers (formatters, fetch wrappers)
    types/               # TS types & interfaces
    styles/              # Global CSS (variables, resets)
  routes/
    +layout.svelte       # Root app shell (theme, base grid)
    +layout.ts           # Root layout load (session/config)
    +page.svelte         # Landing page (or redirect)
    about/+page.svelte   # Example public page
    dashboard/+page.svelte
    settings/+page.svelte
    items/
      +page.svelte       # List
      [id]/+page.svelte  # Details
```

**Rule of thumb:**

* Route-specific code lives next to the route.
* Cross-feature code lives in `lib/`.

## 2) Routing & Layouts

* Use **layouts** for shared UI and data: `+layout.svelte` (+ optional `+layout.ts`).
* Prefer **file-based nesting** over manual routers.
* Co-locate small feature components next to their route when they’re not reused elsewhere.

## 3) Data Flow: `load` first, stores second

* Fetch per-route data in `+page.ts` / `+layout.ts` with `load()`; return plain objects.
* Use **stores** only for cross-route or long-lived UI state (theme, auth profile, ephemeral cache).
* Derive from route `data` when possible to avoid duplication.

**Minimal example**

```ts
// src/routes/items/+page.ts
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch('/api/items.json');
  const items = await res.json();
  return { items };
};
```

```svelte
<!-- src/routes/items/+page.svelte -->
<script lang="ts">
  export let data: { items: Array<{id:string; name:string}> };
</script>
<ul>{#each data.items as it}<li>{it.name}</li>{/each}</ul>
```

## 4) Stores (global shared state)

```
// src/lib/stores/session.ts
import { writable, derived } from 'svelte/store';
export const user = writable<{ id: string; name: string } | null>(null);
export const isSignedIn = derived(user, (u) => !!u);
```

Use stores for: theme, auth snapshot, feature flags, lightweight client cache.
Avoid stores for: per-page fetch results (keep in `load`), transient component-local state.

## 5) Components

* **Presentational** (dumb) components go in `lib/components/Ui*`.
* **Feature wrappers** (smart) that are route-specific live next to the route.
* Naming: `UiButton.svelte`, `UiCard.svelte`, `FeatureFilters.svelte`.
* Keep inputs explicit via `export let ...` and prefer slots for composition.

## 6) Styling & Theming

* Prefer component-scoped CSS in `.svelte` files.
* Put tokens and themes in `src/lib/styles/` (e.g., `tokens.css`).
* Use CSS variables for dark/light; toggle on `<html data-theme="dark">`.

```
/* src/lib/styles/tokens.css */
:root { --bg: white; --fg: #111; }
html[data-theme="dark"] { --bg: #111; --fg: #eee; }
```

## 7) Utilities & Types

* `lib/utils/` for pure, side-effect-free helpers (`date.ts`, `format.ts`, `assert.ts`).
* `lib/types/` for shared TS types.
* Keep fetch wrappers small; import them in `load()` or components as needed.

## 8) Progressive Enhancement & Islands

* Let SvelteKit handle **code-splitting**; import heavy libs only where used.
* Prefer **SSR-compatible code**; guard browser-only APIs with `import { browser } from '$app/environment'`.
* Add interactivity at the component level; don’t over-lift state.

## 9) Conventions

* One screen per `+page.svelte`; co-locate `+page.ts` and small helpers.
* Keep route data serializable; avoid putting class instances in `load` returns.
* Avoid global singletons when a layout store or `data` prop suffices.

## 10) Do / Don’t (Quick Checks)

**Do**

* Co-locate feature code with its route.
* Use layouts for shared chrome & shared data.
* Keep utilities pure and typed.

**Don’t**

* Centralize everything under `lib/featureX` detached from routes.
* Overuse stores for per-page data.
* Recreate routers or global event buses.

## TL;DR

* **Features live in `routes/`; reusables in `lib/`.**
* **Use layouts for structure and data; use stores only for cross-route state.**
* **Lean on file-based routing and automatic code-splitting.**

---

## Appendix A - State Levels & Stores

### 1. Component-local state

* Plain variables in `.svelte`.
* Use when logic is simple and doesn’t need reuse.

### 2. Feature/route-scoped instance store

* A **factory function** that returns a store + methods.
* Lives in `lib/features/<feature>/<feature>.store.ts`.
* Created inside the component/route → scoped, not global.

```ts
// lib/features/cart/cart.store.ts
import { writable, derived } from 'svelte/store';
import { addItemApi, removeItemApi } from '$lib/services/cart';

export function createCart(initial = []) {
  const items = writable(initial);
  const total = derived(items, $ => $.reduce((s, x) => s + x.price, 0));

  async function add(it) { await addItemApi(it); items.update(v => [...v, it]); }
  async function remove(id) { await removeItemApi(id); items.update(v => v.filter(i => i.id !== id)); }

  return { items, total, add, remove };
}
```

```svelte
<script lang="ts">
  import { createCart } from '$lib/features/cart/cart.store';
  const cart = createCart([]);
</script>

{#each $cart.items as it}
  <li>{it.name}</li>
{/each}
<button on:click={() => cart.add({id: 'x', name: 'New'})}>Add</button>
```

### 3. Global singleton store

* Exported from `lib/stores/*` and imported everywhere.
* Use sparingly for **true cross-route state** (auth, theme).
* Avoid for per-page data.

```ts
// lib/stores/session.ts
import { writable, derived } from 'svelte/store';
export const user = writable<{ id: string; name: string } | null>(null);
export const isSignedIn = derived(user, (u) => !!u);
```

**Rule:**

* Singleton store → only for global, cross-route state.
* Instance store → for complex local/feature logic.
* `load()` → for route data fetching.

