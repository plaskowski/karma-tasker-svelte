## Prioritized Tasks for Improving SvelteKit Alignment

Thank you for the feedback! Based on the review, I've compiled a prioritized list of individual tasks to address the key misalignments and suggestions. I've skipped anything related to SSR as requested. Prioritization is based on impact (e.g., structural changes first for scalability, then refactoring for maintainability, and minor tweaks last). I've grouped them into High, Medium, and Low priority categories, with estimated effort (low/medium/high) and rationale tied to SvelteKit best practices and your project rules (e.g., MVP focus, clean breaks, GTD alignment).

Each task includes a brief description, why it matters, and a suggested conventional commit message for when you implement it (per your rules: commit after each edit, use `type: description` with benefits).

### High Priority (Core Structural Improvements – Do These First for Better Scalability)
These address fundamental SvelteKit strengths like file-based routing and separation of concerns, which will make the app more maintainable as it grows.

1. **Expand Routing to Use Nested File-Based Routes**  
   - **Description**: Refactor the single-root route setup by introducing nested routes (e.g., `routes/perspectives/[perspectiveId]/+page.svelte` for perspective views, `routes/projects/[projectId]/+page.svelte` for projects). Move relevant logic from `NavigationService` and URL params into route params and load functions. Update `Sidebar.svelte` and navigation to use SvelteKit's built-in linking (e.g., `<a href="/perspectives/{id}">`).  
   - **Why**: Aligns with "Prefer file-based nesting over manual routers" from your architecture doc, improving URL structure, code-splitting, and browser history without custom param parsing. Reduces tight coupling in `+page.ts` and services.  
   - **Effort**: Medium (involves file reorganization and testing navigation).  
   - **Suggested Commit**: `refactor: implement nested routes for perspectives and projects – improves navigation scalability and aligns with SvelteKit conventions`.

2. **Abstract Persistence Logic into Dedicated Services/Repositories**  
   - **Description**: Follow `docs/discovery/MIGRATION_PLAN.md` to extract DB calls (e.g., from `+page.svelte`'s handlers like `handleUpdateTask`) into a new `src/lib/services/persistenceService.ts` or repository pattern. Use it in load functions and components via imports, removing direct `db` access from routes.  
   - **Why**: Separates concerns (UI from data), making it easier to swap persistence (e.g., localStorage to future backend) and test business logic. Aligns with "Clean breaks when refactoring" and reduces mixing in routes.  
   - **Effort**: Medium (refactor handlers, update imports).  
   - **Suggested Commit**: `refactor: abstract persistence into service layer – enhances maintainability and prepares for backend integration`.

### Medium Priority (Refactoring for Consistency and Best Practices)
These improve state management and reactivity, building on your existing use of runes and stores.

3. **Increase Consistent Use of Runes for Local State Across Components**  
   - **Description**: Audit components (e.g., `TaskList.svelte`, `TaskEditorForm.svelte`, `Sidebar.svelte`) and replace plain `let` declarations with `$state` where appropriate (e.g., for toggles like `showCompleted` or editor states). Ensure derived values use `$derived`. Continue migrating any remaining components to Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`) for uniform reactivity management, as seen in strong usage in `TaskList.svelte`.  
   - **Why**: Fully leverages Svelte 5's reactive system for efficient updates, following your rules on "Svelte 5 runes" and avoiding deprecated patterns. Improves performance in reactive UIs like task lists and ensures consistent adoption across the codebase.  
   - **Effort**: Low (mostly find-and-replace with testing).  
   - **Suggested Commit**: `refactor: expand rune usage for local state in components – boosts reactivity and aligns with Svelte 5 best practices`.

4. **Refactor Event Handling from createEventDispatcher to Callback Props**  
   - **Description**: Replace `createEventDispatcher` with callback props (e.g., `export let on: () => void`) in components like `TaskInlineEditor.svelte`, `TaskEditorForm.svelte`, and `NewTaskDialog.svelte` for better type safety and consistency.  
   - **Why**: Aligns with Svelte 5 best practices for event handling, making it more explicit and reducing reliance on dispatchers.  
   - **Effort**: Medium (update components and test events).  
   - **Suggested Commit**: `refactor: replace createEventDispatcher with callback props – improves type safety and event handling consistency`.

5. **Enhance Store Usage for Cross-Component State**  
   - **Description**: Create or refine stores in `src/lib/services/` (e.g., a `navigationStore.ts` for `currentView`, `currentPerspectiveId`) and use them consistently instead of passing everything via props or URL params. Update `MainView.svelte` and `SidebarView.svelte` to subscribe where needed. Examine services like `tasks.ts`, `workspaceService.ts`, and `navigation.ts` to ensure effective use of Svelte stores for global state, reducing unnecessary re-renders.  
   - **Why**: Follows "Use Svelte stores for global state" from your rules and architecture doc ("stores only for cross-route or long-lived UI state"). Reduces prop drilling and makes state more predictable.  
   - **Effort**: Medium (introduce stores, refactor props).  
   - **Suggested Commit**: `refactor: implement consistent stores for navigation state – reduces prop drilling and improves state management flow`.

6. **Integrate SvelteKit Form Actions for Task Forms**  
   - **Description**: Refactor forms in `TaskEditorForm.svelte` and `NewTaskDialog.svelte` to use SvelteKit's built-in `<form action>` and `use:enhance` for submissions, handling validation with Zod (already a dep). Move custom handlers (e.g., `handleCreateTask`) into form actions.  
   - **Why**: Leverages SvelteKit's progressive enhancement for forms, improving accessibility and reducing custom JS for submissions. Aligns with MVP simplicity and your accessibility rules.  
   - **Effort**: Medium (update forms, test submissions).  
   - **Suggested Commit**: `feat: add SvelteKit form actions to task editors – enhances form handling reliability and accessibility`.

### Low Priority (Minor Tweaks and Optimizations)
These are polish items that can wait until after core changes.

7. **Audit and Clean Dependencies/Config**  
   - **Description**: Review `package.json` for unused deps (e.g., ensure `svelte-persisted-store` isn't overlapping with localStorage logic). Run `npm dedupe` and check for Svelte 5 compatibility warnings in dev mode.  
   - **Why**: Maintains a lean codebase per "Stick to the current stack; avoid new dependencies unless necessary." Prevents bloat in an MVP.  
   - **Effort**: Low (quick audit and commands).  
   - **Suggested Commit**: `chore: audit and dedupe dependencies – keeps codebase lean and up-to-date`.

8. **Refine Task Grouping and Filtering Logic**  
   - **Description**: Move any remaining inline filtering/grouping (e.g., in `+page.ts` or `taskGrouping.ts`) into pure functions in `src/lib/helpers/` or a dedicated service, ensuring they use runes for reactivity where computed.  
   - **Why**: Aligns with GTD principles and "Keep utilities pure and typed" from your architecture doc, improving reusability.  
   - **Effort**: Low (extract functions, update calls).  
   - **Suggested Commit**: `refactor: extract task grouping to pure helpers – improves code reusability and GTD alignment`.

9. **Audit Performance and Accessibility**  
   - **Description**: Review SvelteKit configuration (`svelte.config.js`, `vite.config.ts`), routing, and HTML structure for optimizations like bundle size, lazy loading, and accessibility features (e.g., ARIA attributes, keyboard navigation).  
   - **Why**: Ensures alignment with UI/UX standards for performance and accessibility, supporting a range of screen sizes and themes.  
   - **Effort**: Medium (analysis and minor fixes).  
   - **Suggested Commit**: `chore: audit and optimize performance/accessibility – improves user experience and app efficiency`.

### Implementation Notes
- **Order**: Start with High priority to unlock benefits for the rest (e.g., better routing simplifies state management).
- **Testing**: After each task, run `npx playwright test --reporter=line` (per your rules) and fix any linter/type errors before committing.
- **Commits**: Remember to commit immediately after each edit using the file-based message method (read/write `.git/COMMIT_EDITMSG`, then `git commit -F`). Touch `.idea/agent-hooks/refresh-trigger` post-edit for IDE refresh.
- **Scope**: These tasks respect your MVP focus—nothing adds complexity, just refines existing code.
