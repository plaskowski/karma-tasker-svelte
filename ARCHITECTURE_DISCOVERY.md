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

## Conclusion

After researching official and community recommendations, the **Domain-Organized MVC Pattern with lib/server** emerges as the best approach for Karma Tasker. This pattern:
- Aligns with SvelteKit conventions
- Is widely adopted in the community
- Provides clear separation of concerns
- Scales well as the application grows

**Revised Recommendation:** 
1. Start with extracting domain models and business logic
2. Implement the lib/server pattern for future backend integration
3. Keep stores simple and focused on UI state
4. Avoid over-engineering - add complexity only as needed

This approach balances best practices with pragmatism, ensuring the codebase remains maintainable without unnecessary complexity.