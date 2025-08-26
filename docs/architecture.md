# Architecture Guide

## Overview

Karma Tasker follows a **Domain-Organized MVC Pattern** with **ViewModels** for complex components. The application uses Supabase for data persistence and real-time synchronization. This architecture provides clear separation of concerns, excellent testability, and maintains the simplicity that SvelteKit promotes.

## Architecture Principles

1. **Separation of Concerns** - Each layer has a single, well-defined responsibility
2. **Domain-First** - Business logic lives in domain models, not UI components
3. **Testability** - Business logic is isolated and easily testable
4. **Simplicity** - Avoid over-engineering; add complexity only when needed
5. **Cohesion** - Related code stays together

## Project Structure

```
src/
├── lib/
│   ├── repositories/       # Data persistence layer (Supabase)
│   │   ├── taskRepository.ts
│   │   └── projectRepository.ts
│   ├── domain/             # Domain models and business logic
│   │   ├── task/
│   │   │   ├── model.ts   # Task entity definition
│   │   │   └── logic.ts   # Task business rules
│   │   ├── project/
│   │   ├── workspace/
│   │   └── perspective/
│   ├── services/           # Business services
│   │   ├── taskService.ts # Task operations
│   │   └── navigationService.ts
│   ├── stores/             # State management
│   │   ├── taskStore.ts   # Simple state containers
│   │   └── uiStore.ts     # UI-specific state
│   ├── components/         # UI components by feature
│   │   ├── tasks/
│   │   │   ├── TaskList.svelte
│   │   │   ├── taskListViewModel.ts
│   │   │   └── TaskItem.svelte
│   │   ├── navigation/
│   │   └── shared/
│   └── utils/              # Shared utilities
└── routes/
    └── (app)/              # Application routes
        └── +page.svelte    # Lean route components
```

## Layer Responsibilities

### Domain Layer (`lib/domain/`)
**Purpose**: Define business entities and rules

- Pure TypeScript/JavaScript - no framework dependencies
- Business logic and validation rules
- Domain models (entities)
- Business calculations and transformations

```typescript
// lib/domain/task/logic.ts
export function calculateNextOrder(tasks: Task[]): number {
  return Math.max(...tasks.map(t => t.order), 0) + 1;
}
```

### Service Layer (`lib/services/`)
**Purpose**: Coordinate business operations

- Orchestrate domain logic
- Handle complex workflows
- Manage transactions
- Call repositories for data

### Repository Layer (`lib/repositories/`)
**Purpose**: Abstract data persistence (currently mock, future Supabase)

- Data access logic  
- Mock data for development
- Future: Supabase client interactions
- Future: Real-time subscriptions

### Store Layer (`lib/stores/`)
**Purpose**: Manage application state

- Simple state containers
- Derived stores for computed values
- No business logic - just state
- Bridge between services and components

### Component Layer (`lib/components/`)
**Purpose**: User interface and interaction

- Presentation logic only
- User event handling
- Delegate business logic to ViewModels
- Call services for operations

```svelte
<!-- lib/components/tasks/TaskList.svelte -->
<script>
  import { createTaskListViewModel } from './taskListViewModel';
  
  const vm = $derived(createTaskListViewModel({
    tasks: $tasks,
    currentView: $currentView
  }));
</script>

<h1>{vm.viewTitle}</h1>
```

### ViewModel Layer
**Purpose**: Bridge between components and business logic

- Transform data for display
- Complex computed properties
- Component-specific business logic
- Keep components clean

See [ViewModel Pattern Guide](./viewmodel-pattern.md) for detailed information.

## Data Flow

```
User Action → Component → Service → Domain Logic → Repository → Store → Component Update
```

1. **User interacts** with a component
2. **Component calls** a service method
3. **Service orchestrates** domain logic
4. **Domain logic** performs business rules
5. **Repository** persists changes
6. **Store updates** trigger reactivity
7. **Components re-render** with new state

## Best Practices

### 1. Keep Components Simple
- Components should focus on presentation
- Extract complex logic to ViewModels
- Use services for operations

### 2. Domain Logic is Pure
- No side effects in domain functions
- Easy to test with simple unit tests
- Framework-agnostic

### 3. Services Orchestrate
- Services know about multiple domains
- Handle complex workflows
- Manage error handling and retries

### 4. Stores are Dumb
- Stores just hold state
- No business logic in stores
- Use derived stores for computed values

### 5. ViewModels for Complex Components
- When a component has complex display logic
- Multiple computed properties
- Data transformation for display

## Supabase Integration (Future)

The application is designed to use Supabase for data persistence. Currently using mock data, but the repository layer abstracts this so switching to Supabase will be straightforward.

### Planned Features
- Real-time synchronization across devices
- User authentication and workspaces
- Optimistic updates for better UX
- Offline support with sync queue

## Testing Strategy

### Unit Tests
- **Domain Logic**: Pure functions, easy to test
- **ViewModels**: Pass mock state, assert outputs
- **Services**: Mock repositories, test orchestration

### Integration Tests
- **Components + ViewModels**: Test together
- **Services + Repositories**: Test data flow with mock Supabase client
- **Stores + Services**: Test state management

### E2E Tests
- Full user workflows
- Critical business paths
- Cross-component interactions

## Migration Path

Currently migrating from a monolithic structure. See [Migration Plan](discovery/MIGRATION_PLAN.md) for details.

### Phase 1: Service Extraction ✅
- Extract business logic from stores
- Create service layer
- Implement repository pattern

### Phase 2: Domain Modeling
- Define domain entities
- Extract business rules
- Create pure domain functions

### Phase 3: Component Refactoring
- Implement ViewModels for complex components
- Organize components by feature
- Clean up component logic

### Phase 4: Final Cleanup
- Simplify route components
- Update all imports
- Remove deprecated code

## Common Patterns

### Creating a New Feature

1. **Define the domain model** in `lib/domain/[feature]/model.ts`
2. **Add business logic** in `lib/domain/[feature]/logic.ts`
3. **Create a service** in `lib/services/[feature]Service.ts`
4. **Add repository** if needed in `lib/repositories/`
5. **Create store** for state in `lib/stores/`
6. **Build components** in `lib/components/[feature]/`
7. **Add ViewModel** if component is complex

### Adding a New View

1. **Create route** in `src/routes/`
2. **Define ViewModel** for complex view logic
3. **Wire up stores** in the route component
4. **Keep route lean** - delegate to components and services

## Future Considerations

### When to Add Complexity

Only add architectural complexity when:
- Multiple developers join the team
- Business logic becomes complex
- Testing becomes difficult
- Performance issues arise
- Real backend integration begins

### Potential Enhancements

- **Optimistic Updates**: Update UI before Supabase confirms
- **Offline Support**: Queue changes when offline
- **Caching Layer**: For performance optimization
- **Event Bus**: For complex inter-component communication
- **State Machines**: For complex UI workflows
- **Validation Layer**: For complex form validation with Zod

## Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Excellent testability
- ✅ Maintainable codebase
- ✅ Scalable structure
- ✅ Natural SvelteKit integration

The key is to start simple and add complexity only when needed, always keeping the core principles in mind.