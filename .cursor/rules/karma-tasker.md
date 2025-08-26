---
name: Karma Tasker Project Rules
scopes:
  - "*"
visibility: project
priority: high
---

## Development Workflow
- **Commit after each edit**: Commit immediately with a descriptive message.
- **Conventional commits**: `type: description` (feat, fix, refactor, docs, style, test, chore, etc.).
- **Include benefits in messages**: Explain impact/benefits, not just what changed.
- **Test before committing**: Ensure no linter/type errors.
- **Resolve TODO flow**: When completing an item in `TODO.md`, mark it `- [x]` and move it to `RESOLVED.md` in the same commit.
- **Squash rule**: When squashing, write a single updated message reflecting combined changes and benefits.

## Code Quality
- **Strict TypeScript**: No `any` in new code; prefer explicit types.
- **Svelte 5 runes**: Use `$state()`, `$derived()`, and `onclick` over deprecated patterns.
- **Clean imports**: Remove unused imports/exports after refactors.
- **Consistency**: Maintain naming, structure, and patterns across the codebase.

## Architecture Guidelines
- **Component separation**: Keep `TaskList` (container/logic) and `TaskItem` (presentation) separated.
- **Store management**: Use Svelte stores for global state; local component state for component-specific data.
- **GTD principles**: Align task organization with Getting Things Done.
- **MVP focus**: Keep features simple and essential; avoid unnecessary complexity.

## UI/UX Standards
- **Dark mode**: Ensure components work in light and dark themes.
- **Responsive**: Support a range of screen sizes.
- **Accessibility**: Semantic HTML, ARIA where appropriate, keyboard navigation.
- **Performance**: Use Svelte reactivity efficiently to avoid unnecessary re-renders.

## Project Specific
- **No tags**: Tags were removed for MVP; do not reintroduce without discussion.
- **GTD perspectives**: Use Inbox, Next, Waiting, Scheduled, Someday for categorization.
- **Mock data**: Development uses mock data with simulated delays/failures.
- **SvelteKit + Tailwind**: Stick to the current stack; avoid new deps unless necessary.
