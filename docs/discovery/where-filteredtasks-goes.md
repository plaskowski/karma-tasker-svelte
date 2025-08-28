# Where `filteredTasks` Logic Goes in Target Architecture

## Current State
`filteredTasks` is a derived Svelte store that:
1. Filters tasks by current workspace
2. Then filters by view type (perspective/project/all)
3. Returns filtered task array

## Target Architecture Options

### Option 1: TaskCollection Methods (Domain Layer) ✅ RECOMMENDED
```typescript
// domain/task/TaskCollection.ts
export class TaskCollection {
  // View-based filtering
  filterByView(
    navigation: NavigationState,
    workspaceId: string,
    perspectives: PerspectiveCollection
  ): TaskCollection {
    let filtered = this.getByWorkspace(workspaceId);
    
    switch (navigation.currentView) {
      case 'perspective':
        const effectivePerspective = perspectives.getEffectiveId(
          navigation.currentView,
          navigation.currentPerspectiveId
        );
        return filtered.getByPerspective(effectivePerspective);
        
      case 'project':
        return navigation.currentProjectId 
          ? filtered.getByProject(navigation.currentProjectId)
          : filtered;
          
      case 'project-all':
        return filtered.getWithProject();
        
      case 'all':
      default:
        return filtered;
    }
  }
}
```

**Usage in derived store:**
```typescript
// stores/derivedStores.ts
export const filteredTasks = derived(
  [tasks, navigation, currentWorkspace, workspaceContext],
  ([$tasks, $navigation, $currentWorkspace, $workspace]) => {
    const collection = new TaskCollection($tasks);
    return collection
      .filterByView($navigation, $currentWorkspace, $workspace.getPerspectives())
      .toArray();
  }
);
```

### Option 2: Service Layer
```typescript
// services/taskFilterService.ts
export const taskFilterService = {
  filterTasksForCurrentView(
    tasks: Task[],
    navigation: NavigationState,
    workspaceId: string,
    perspectives: PerspectiveConfig[]
  ): Task[] {
    // Filtering logic here
  }
};
```

**Pros:** Keeps domain pure
**Cons:** Service for just filtering feels like overkill

### Option 3: Keep in Derived Store (Status Quo)
Keep the logic in the derived store as-is, since it's UI-specific filtering.

**Pros:** Simple, already works
**Cons:** Business logic mixed with store layer

## Recommendation: Option 1 - TaskCollection Method

**Why:**
1. **Cohesion**: Filtering is a core collection operation
2. **Reusability**: Can be used anywhere, not just in stores
3. **Testability**: Easy to unit test without Svelte
4. **OO Principle**: Collection knows how to filter itself
5. **Clean Store**: Derived store becomes a simple wrapper

## Implementation Plan

1. Add `filterByView()` method to TaskCollection
2. Update derived store to use TaskCollection
3. Keep derived store for reactivity, but logic moves to domain

This keeps the **reactive layer thin** while the **business logic lives in the domain**.