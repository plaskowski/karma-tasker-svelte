# Architecture Discovery Document - Karma Tasker

## Current State Analysis

### Existing Structure
```
src/
├── lib/
│   ├── components/     # UI components (mixed concerns)
│   │   ├── Sidebar.svelte
│   │   ├── TaskList.svelte
│   │   ├── TaskItem.svelte
│   │   ├── TaskEditorForm.svelte
│   │   └── ...
│   ├── stores/         # State management + business logic
│   │   └── taskStore.ts (monolithic - 180+ lines)
│   ├── types/          # TypeScript interfaces
│   │   └── index.ts
│   └── data/           # Mock data
│       └── mockData.ts
└── routes/
    └── +page.svelte    # Main page (400+ lines, mixed concerns)
```

### Current Issues

1. **Mixed Concerns**
   - `taskStore.ts` contains: state, business logic, API simulation, data transformation
   - `+page.svelte` handles: routing, state management, event handling, UI logic
   - Components contain business logic alongside presentation

2. **Tight Coupling**
   - Components directly import and manipulate stores
   - No clear separation between data access and business logic
   - Mock data tightly coupled with store implementation

3. **Testing Challenges**
   - Business logic embedded in components/stores is hard to test
   - No clear interfaces for mocking/stubbing
   - UI and logic intertwined

4. **Scalability Concerns**
   - Adding new features requires modifying multiple files
   - No clear patterns for extending functionality
   - Difficult to swap data sources (mock → real API)

## Research: Official and Community-Recommended Patterns

### Official SvelteKit Recommendations
Based on the official documentation and community best practices:

1. **Route-centric organization** - Components used in single routes should be colocated with those routes
2. **`$lib/server` pattern** - Server-only code with automatic client-side import prevention
3. **Minimal abstraction** - Leverage SvelteKit's built-in features rather than over-abstracting

### Community-Promoted Patterns (2024)

#### MVC-Like Pattern with lib/server
The most promoted pattern for enterprise SvelteKit applications:
```
src/lib/
├── server/
│   ├── httpConsumers/      # Domain-organized API integrations
│   │   ├── tasks/
│   │   │   ├── models/     # Request/response models
│   │   │   └── index.ts    # API consumer
│   │   └── projects/
│   └── db/                 # Database access
└── dtos/                   # Data Transfer Objects
    └── views/              # Composite DTOs for UI
```

#### Clean Architecture / Hexagonal Architecture
Promoted by thought leaders like Niko Heikkila:
- Domain at the center
- Parse, don't validate (using Zod or similar)
- Ports and adapters pattern
- Technology-agnostic domain logic

## Common SvelteKit Architecture Patterns

### 1. **Feature-Based Structure**
```
src/lib/features/
├── tasks/
│   ├── components/
│   ├── stores/
│   ├── services/
│   └── types.ts
├── projects/
└── workspaces/
```
**Pros:** High cohesion, easy to find related code, scales well
**Cons:** Can lead to duplication, cross-feature dependencies

### 2. **Domain-Driven Design (DDD)**
```
src/lib/
├── domain/          # Business entities and logic
├── application/     # Use cases / services
├── infrastructure/  # External concerns (API, storage)
└── presentation/    # UI components
```
**Pros:** Clear boundaries, testable, follows SOLID principles
**Cons:** Can be overkill for smaller apps, learning curve

### 3. **Service-Repository Pattern**
```
src/lib/
├── services/       # Business logic
├── repositories/   # Data access
├── stores/        # State management
└── components/    # UI only
```
**Pros:** Clear separation, familiar pattern, testable
**Cons:** May need additional abstraction layers

### 4. **MVVM-like Pattern**
```
src/lib/
├── views/         # Svelte components (View)
├── viewmodels/    # Component logic (ViewModel)
├── models/        # Data structures and business logic
└── services/      # External interactions
```
**Pros:** Familiar to many developers, clear responsibilities
**Cons:** May not align perfectly with Svelte's reactive model

## Recommendations for Karma Tasker

### Revised Recommendation Based on Research

After researching official and community best practices, I recommend a **Modified MVC Pattern with lib/server** approach that aligns with SvelteKit conventions:

### Proposed Architecture: **Domain-Organized MVC Pattern**

```
src/
├── lib/
│   ├── server/              # Server-only code (SvelteKit convention)
│   │   ├── domain/         # Domain logic (if needed for server)
│   │   ├── repositories/  # Data access layer
│   │   │   └── task.ts
│   │   └── services/       # Business logic
│   │       └── taskService.ts
│   ├── domain/             # Shared domain models and logic
│   │   ├── task/
│   │   │   ├── model.ts   # Task entity
│   │   │   └── logic.ts   # Task business rules
│   │   └── project/
│   ├── stores/             # Client state management
│   │   ├── taskStore.ts   # Simplified, UI state only
│   │   └── uiStore.ts      # UI-specific state
│   ├── components/         # Reusable components
│   │   ├── tasks/
│   │   └── shared/
│   └── utils/
└── routes/
    ├── (app)/              # Grouped routes for main app
    │   └── +page.svelte    # Keep route components lean
    └── api/                # API endpoints if needed
```

### Why This Revised Approach?

1. **Follows SvelteKit Conventions** - Uses `lib/server` pattern as recommended
2. **Clean Domain Modeling** - Separate domain logic from infrastructure
3. **MVC Pattern** - Proven pattern that works well with SvelteKit
4. **Parse, Don't Validate** - Can integrate Zod for robust data validation
5. **Future-Ready** - Easy to transition from mock to real API/database

### Implementation Plan

#### Phase 1: Service Layer (Current Task)
1. Extract business logic from `taskStore.ts` into `TaskService`
2. Create repository abstraction for data persistence
3. Simplify stores to just hold state

#### Phase 2: Feature Reorganization
1. Move task-related components into `features/tasks/`
2. Move project-related code into `features/projects/`
3. Move workspace-related code into `features/workspaces/`

#### Phase 3: Shared Infrastructure
1. Create shared API service for future backend
2. Abstract localStorage into repository pattern
3. Extract common UI components

#### Phase 4: Clean Up
1. Refactor `+page.svelte` to use new structure
2. Remove redundant code
3. Update imports and dependencies

### Benefits of Proposed Architecture

1. **Separation of Concerns** - Each layer has clear responsibilities
2. **Testability** - Services and repositories can be unit tested
3. **Flexibility** - Easy to swap implementations (mock → real API)
4. **Maintainability** - Clear structure makes changes predictable
5. **Scalability** - New features follow established patterns

### Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-engineering | High complexity for simple app | Start simple, evolve as needed |
| Migration disruption | Breaking existing functionality | Implement gradually, test thoroughly |
| Team learning curve | Slower initial development | Document patterns, provide examples |

### Decision Criteria

Before proceeding, consider:
1. Is the app expected to grow significantly?
2. Will there be multiple developers?
3. Is testability a priority?
4. How important is the ability to swap data sources?

### Next Steps

1. **Review this document** with stakeholders
2. **Decide on approach** - full implementation or simplified version
3. **Create proof of concept** - implement one feature fully
4. **Evaluate and adjust** - refine based on POC results
5. **Full implementation** - roll out across all features

## Alternative: Minimal Refactoring

If full architecture change is too much, consider minimal improvements:

1. **Extract services** - Just pull business logic into service classes
2. **Simplify stores** - Make stores pure state containers
3. **Keep current structure** - Don't reorganize files
4. **Add tests** - Focus on testing critical business logic

This provides some benefits without major disruption.

## Questions for Discussion

1. What is the expected lifetime and growth of this application?
2. How many developers will work on this codebase?
3. What are the performance requirements?
4. How important is real-time collaboration features?
5. What is the timeline for moving from mock data to real backend?

## Key Insights from Research

Based on official documentation and community best practices:

1. **SvelteKit favors simplicity** - The framework encourages minimal abstraction and leveraging built-in features
2. **lib/server is crucial** - This pattern is the official way to separate server-only code
3. **MVC pattern is dominant** - Most enterprise SvelteKit apps use MVC-like architecture
4. **Domain modeling matters** - Clean domain modeling helps manage complexity
5. **DTOs are recommended** - Data Transfer Objects provide clear data contracts

## ViewModel Pattern for Components

### The Problem
Components currently mix UI logic with business logic, making them hard to test and maintain. We need a pattern that separates these concerns while working naturally with Svelte's reactivity.

### Recommended Pattern: Stateless ViewModels with Closure

After discussion, we've identified an elegant pattern that combines the benefits of ViewModels with Svelte's reactive system:

#### Pattern Structure

```typescript
// lib/components/tasks/taskListViewModel.ts

// 1. Define the state interface for this ViewModel
export interface TaskListState {
  tasks: Task[];
  projects: Project[];
  currentView: ViewType;
  currentPerspectiveId?: string;
  currentProjectId?: string;
  currentWorkspace: string;
  perspectives: PerspectiveConfig[];
}

// 2. Create a factory function that returns the ViewModel object
export function createTaskListViewModel(state: TaskListState) {
  return {
    // Computed properties as getters
    get viewTitle() {
      if (state.currentView === 'all') return 'All';
      if (state.currentView === 'project' && state.currentProjectId) {
        const project = state.projects.find(p => p.id === state.currentProjectId);
        return project?.name || 'Project';
      }
      // ... more logic
    },
    
    get activeTasks() {
      return state.tasks.filter(t => 
        !t.completed && 
        t.workspaceId === state.currentWorkspace
      );
    },
    
    get groupedTasks() {
      const workspaceTasks = this.filterWorkspaceTasks();
      
      if (state.currentView === 'perspective') {
        return this.groupByProject(workspaceTasks);
      }
      // ... more logic
    },
    
    // Private helper methods
    filterWorkspaceTasks() {
      return state.tasks.filter(t => t.workspaceId === state.currentWorkspace);
    },
    
    groupByProject(tasks: Task[]) {
      // grouping logic
    }
  };
}
```

#### Component Usage

```svelte
<script lang="ts">
  import { tasks, projects, currentView, ... } from '$lib/stores';
  import { createTaskListViewModel } from './taskListViewModel';
  
  // Create ViewModel with reactive recreation on store changes
  const vm = $derived(createTaskListViewModel({
    tasks: $tasks,
    projects: $projects,
    currentView: $currentView,
    currentProjectId: $currentProjectId,
    currentWorkspace: $currentWorkspace,
    perspectives: $workspacePerspectives,
  }));
</script>

<!-- Clean template using ViewModel properties -->
<div>
  <h1>{vm.viewTitle}</h1>
  
  {#each vm.groupedTasks as group}
    <TaskGroup {group} />
  {/each}
  
  <footer>
    Showing {vm.activeTasks.length} active tasks
  </footer>
</div>
```

### Benefits of This Pattern

1. **Separation of Concerns**
   - Component handles UI and wiring
   - ViewModel handles all business logic and computed values
   - State management stays in stores

2. **Testability**
   - ViewModels are pure functions - easy to unit test
   - Just pass mock state objects to test
   - No need to mount components to test logic

3. **Natural Reactivity**
   - `$derived` ensures ViewModel recreates when stores change
   - All computed values update automatically
   - No manual subscription management

4. **Developer Experience**
   - Clean component templates with `vm.property` syntax
   - IntelliSense works perfectly with typed ViewModels
   - Easy to understand data flow

5. **Maintainability**
   - Each ViewModel declares its own state requirements via interface
   - Related logic stays together in the ViewModel
   - Easy to refactor without touching components

### Key Principles

1. **Colocate ViewModel with Component** - Keep the ViewModel in the same folder as the component that uses it
2. **Define State Interface** - Each ViewModel explicitly declares what state it needs
3. **Use Factory Functions** - `createViewModel()` pattern allows closure over state
4. **Keep ViewModels Pure** - No side effects, just transformations
5. **One ViewModel per Complex Component** - Simple components don't need ViewModels

### When to Use ViewModels

**Use ViewModels when:**
- Component has complex computed properties
- Multiple derived values from stores
- Business logic that needs testing
- Grouping, filtering, or transforming data

**Skip ViewModels when:**
- Component is purely presentational
- Logic is trivial (single line expressions)
- Component just passes props through

### Testing Example

```typescript
import { createTaskListViewModel } from './taskListViewModel';

test('viewTitle shows project name', () => {
  const state: TaskListState = {
    currentView: 'project',
    currentProjectId: 'p1',
    projects: [{ id: 'p1', name: 'My Project', ... }],
    // ... other required state
  };
  
  const vm = createTaskListViewModel(state);
  expect(vm.viewTitle).toBe('My Project');
});
```

## Conclusion

After researching official and community recommendations, the **Domain-Organized MVC Pattern with lib/server** emerges as the best approach for Karma Tasker, enhanced with the **ViewModel pattern** for complex components.

This combined approach:
- Aligns with SvelteKit conventions
- Provides clear separation of concerns at all levels
- Makes business logic easily testable
- Scales well as the application grows
- Maintains excellent developer experience

**Final Architecture Recommendation:** 
1. Use Domain-Organized MVC for overall structure
2. Implement stateless ViewModels for complex components
3. Keep stores simple and focused on state management
4. Extract business logic to services and domain models
5. Use lib/server pattern for future backend integration

This approach balances best practices with pragmatism, ensuring the codebase remains maintainable without unnecessary complexity.