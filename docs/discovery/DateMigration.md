# Task: Convert `Date` fields in `WorkspaceData` to ISO strings for SvelteKit `load()`

## Problem

- In `src/lib/types/index.ts`, persisted types (`Task`, `Project`, `WorkspaceData`, etc.) contain fields of type `Date`.
- In SvelteKit, all data returned from `+page.ts` or `+layout.ts load()` must be **JSON-serializable**.
- Returning `Date` objects breaks this rule because they are stringified on the wire and rehydrated as strings, causing
  type drift.

## Goal

- Ensure all `Date` values are converted to **ISO strings** (`string` type) before being returned from any `load()`
  function.
- Keep persisted domain types (`Date`) unchanged internally.
- Add safe conversion at the **boundary layer** (DTOs or mappers).

## Acceptance Criteria

1. Introduce mapping helpers in `src/lib/api/persistence/` or `src/lib/types/` that:
    - Convert `Task` / `Project` / `WorkspaceData` objects into serializable DTOs (with `string` for dates).
    - Example: `{ createdAt: Date } → { createdAt: string }` using `toISOString()`.
    - Keep mapping **both directions**: `toDto(domain)` and `fromDto(dto)`.
2. Update all `+page.ts` (and any future `+layout.ts`) to:
    - Call `toDto()` before returning `data`.
    - Return only **plain JSON-serializable DTOs**.
3. Update `src/lib/types/` to clearly distinguish:
    - **Domain types** (with `Date`).
    - **DTO types** (with `string`).
4. Verify type safety: `$types.PageData` should reference the DTO types, not domain types.
5. Add a small test (or console.log check) to prove that `Date` values roundtrip through DTO → JSON → DTO without
   breaking.

## Non-Goals

- Do not change how persistence stores dates (they can stay as `Date` objects internally).
- Do not refactor unrelated services or stores. Focus on serialization boundary only.
