# Architecture Migration Plan - Karma Tasker

## Overview
This document outlines where each piece of the current codebase should be relocated in the new Domain-Organized MVC Pattern architecture.

## New Architecture Structure

```
src/
├── lib/
│   ├── server/              # Server-only code (future backend)
│   │   ├── repositories/   # Data persistence layer
│   │   └── services/       # Business logic services
│   ├── domain/             # Domain models and business logic
│   │   ├── task/
│   │   ├── project/
│   │   ├── workspace/
│   │   └── perspective/
│   ├── services/           # Client-side services
│   ├── stores/             # Simplified state management
│   ├── components/         # UI components organized by feature
│   │   ├── tasks/
│   │   ├── projects/
│   │   ├── navigation/
│   │   └── shared/
│   └── utils/              # Shared utilities
└── routes/
    └── (app)/              # Application routes
```

## File Migration Map

### 1. `/src/lib/stores/taskStore.ts` (180+ lines)
**Split into:**
- **lib/stores/taskStore.ts** - Keep only simple state stores
  - `tasks`, `projects`, `workspaces` (as simple stores, not persisted)
  - `currentView`, `currentPerspectiveId`, `currentProjectId`
  - `currentWorkspace`, `showCompleted`
  
- **lib/stores/uiStore.ts** - UI-specific state
  - Navigation state
  - Modal/dialog state
  - Editor state

- **lib/services/taskService.ts** - Task business logic
  - `addTask()`
  - `updateTask()`
  - `deleteTask()`
  - `toggleTaskComplete()`

- **lib/server/repositories/taskRepository.ts** - Data persistence
  - localStorage persistence logic
  - Mock delay simulation
  - Future API calls

- **lib/domain/task/logic.ts** - Pure business logic
  - `calculateNextOrder()`
  - `filterTasksByView()`
  - `groupTasksByProject()`
  - `groupTasksByPerspective()`

- **lib/utils/dev.ts** - Development utilities
  - `resetToInitialState()`

### 2. `/src/lib/types/index.ts`
**Split into:**
- **lib/domain/task/model.ts** - Task interface
- **lib/domain/project/model.ts** - Project interface
- **lib/domain/workspace/model.ts** - Workspace interface
- **lib/domain/perspective/model.ts** - PerspectiveConfig interface
- **lib/types/index.ts** - Keep UI types (ViewType, AppState)

### 3. `/src/lib/components/TaskList.svelte`
**Refactor to:**
- **lib/components/tasks/TaskList.svelte** - Simplified container
- **lib/domain/task/logic.ts** - Extract grouping logic
- **lib/services/viewService.ts** - Extract view title logic

### 4. `/src/lib/components/TaskItem.svelte`
**Move to:**
- **lib/components/tasks/TaskItem.svelte** - Pure presentation component

### 5. `/src/lib/components/Sidebar.svelte`
**Move to:**
- **lib/components/navigation/Sidebar.svelte**
- **lib/utils/icons.ts** - Extract icon mapping logic

### 6. `/src/lib/components/TaskEditorForm.svelte`
**Move to:**
- **lib/components/tasks/TaskEditorForm.svelte**

### 7. `/src/lib/components/TaskInlineEditor.svelte`
**Move to:**
- **lib/components/tasks/TaskInlineEditor.svelte**

### 8. `/src/lib/components/TaskDetailsDialog.svelte`
**Move to:**
- **lib/components/tasks/TaskDetailsDialog.svelte**

### 9. `/src/routes/+page.svelte` (400+ lines)
**Refactor to:**
- **routes/(app)/+page.svelte** - Simplified orchestration
- **lib/services/navigationService.ts** - URL management
- Extract business logic to services
- Keep only view coordination

### 10. `/src/lib/data/mockData.ts`
**Move to:**
- **lib/server/repositories/mockData.ts** - Mock data for development

## Implementation Phases

### Phase 1: Service Layer (Current Focus)
1. Create `lib/services/taskService.ts`
2. Create `lib/server/repositories/taskRepository.ts`
3. Extract business logic from `taskStore.ts`
4. Create `lib/domain/task/logic.ts` for pure functions

### Phase 2: Domain Models
1. Create domain folders structure
2. Move interfaces to domain models
3. Add domain-specific logic to each domain

### Phase 3: Component Organization
1. Create component folders by feature
2. Move components to new locations
3. Update import paths

### Phase 4: Route Simplification
1. Extract URL management to service
2. Simplify `+page.svelte`
3. Remove business logic from route

### Phase 5: Store Simplification
1. Remove business logic from stores
2. Create UI-specific stores
3. Update store subscriptions

## Benefits After Migration

1. **Clear Separation of Concerns**
   - Business logic separate from UI
   - Data access abstracted
   - Pure functions testable

2. **Improved Testability**
   - Services can be unit tested
   - Domain logic is pure functions
   - Mocking is straightforward

3. **Better Scalability**
   - Easy to add new features
   - Clear patterns to follow
   - Swap mock for real API easily

4. **Maintainability**
   - Find code quickly
   - Changes are predictable
   - Less coupling between modules

## Migration Guidelines

1. **Start Small** - Migrate one service at a time
2. **Test Continuously** - Ensure functionality remains intact
3. **Update Imports** - Fix imports as files move
4. **Document Changes** - Update this document as migration progresses
5. **Keep Working** - App should remain functional throughout

## Status Tracking

- [ ] Phase 1: Service Layer
- [ ] Phase 2: Domain Models  
- [ ] Phase 3: Component Organization
- [ ] Phase 4: Route Simplification
- [ ] Phase 5: Store Simplification

## Notes

- This is a gradual migration, not a rewrite
- Each phase should be completed and tested before moving to the next
- The application should remain functional at all times
- Consider creating a feature flag to switch between old and new implementations during transition