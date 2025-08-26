# ViewModel Pattern Guide

## Introduction

ViewModels provide a clean way to separate presentation logic from UI components in SvelteKit applications. This pattern keeps components focused on rendering while ViewModels handle all data transformation and computed properties.

## Core Concept

A ViewModel is a pure function that takes application state and returns an object with computed properties and methods for the view to consume.

```typescript
State → ViewModel → View Properties
```

## Pattern Implementation

### 1. Define State Interface

Each ViewModel declares exactly what state it needs:

```typescript
// taskListViewModel.ts
export interface TaskListState {
  tasks: Task[];
  projects: Project[];
  currentView: ViewType;
  currentPerspectiveId?: string;
  currentProjectId?: string;
  currentWorkspace: string;
  perspectives: PerspectiveConfig[];
}
```

### 2. Create Factory Function

Use a factory function that returns the ViewModel object:

```typescript
export function createTaskListViewModel(state: TaskListState) {
  return {
    // Computed properties as getters
    get viewTitle(): string {
      if (state.currentView === 'all') return 'All';
      if (state.currentView === 'project' && state.currentProjectId) {
        const project = state.projects.find(p => p.id === state.currentProjectId);
        return project?.name || 'Project';
      }
      return 'Tasks';
    },
    
    get activeTasks(): Task[] {
      return state.tasks.filter(t => 
        !t.completed && 
        t.workspaceId === state.currentWorkspace
      );
    },
    
    get completedTasks(): Task[] {
      return state.tasks.filter(t => 
        t.completed && 
        t.workspaceId === state.currentWorkspace
      );
    },
    
    get taskCount(): number {
      return this.activeTasks.length;
    },
    
    get groupedTasks(): GroupedTasks {
      const tasks = this.filterWorkspaceTasks();
      
      if (state.currentView === 'perspective') {
        return this.groupByProject(tasks);
      }
      if (state.currentView === 'project') {
        return this.groupByPerspective(tasks);
      }
      return { ungrouped: tasks };
    },
    
    // Helper methods (not exposed as getters)
    filterWorkspaceTasks(): Task[] {
      return state.tasks.filter(t => t.workspaceId === state.currentWorkspace);
    },
    
    groupByProject(tasks: Task[]): GroupedTasks {
      const grouped: { [projectId: string]: Task[] } = {};
      
      tasks.forEach(task => {
        if (!grouped[task.projectId]) {
          grouped[task.projectId] = [];
        }
        grouped[task.projectId].push(task);
      });
      
      return grouped;
    },
    
    groupByPerspective(tasks: Task[]): GroupedTasks {
      // Grouping logic here
    },
    
    // Methods that return functions for event handlers
    createTaskClickHandler(onTaskClick: (task: Task) => void) {
      return (taskId: string) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) onTaskClick(task);
      };
    }
  };
}
```

### 3. Use in Component

Wire the ViewModel to Svelte's reactive system:

```svelte
<script lang="ts">
  import { tasks, projects, currentView, currentWorkspace } from '$lib/stores';
  import { createTaskListViewModel } from './taskListViewModel';
  import type { Task } from '$lib/domain/task/model';
  
  // Create ViewModel with reactive recreation
  const vm = $derived(createTaskListViewModel({
    tasks: $tasks,
    projects: $projects,
    currentView: $currentView,
    currentProjectId: $currentProjectId,
    currentWorkspace: $currentWorkspace,
    perspectives: $workspacePerspectives,
  }));
  
  // Event handlers can use ViewModel methods
  function handleTaskClick(task: Task) {
    selectedTask = task;
    showDetails = true;
  }
</script>

<!-- Clean template using ViewModel properties -->
<div class="task-list">
  <header>
    <h1>{vm.viewTitle}</h1>
    <span class="count">{vm.taskCount} active tasks</span>
  </header>
  
  {#if vm.activeTasks.length > 0}
    <section class="active">
      <h2>Active</h2>
      {#each vm.activeTasks as task}
        <TaskItem {task} onclick={() => handleTaskClick(task)} />
      {/each}
    </section>
  {/if}
  
  {#if vm.completedTasks.length > 0}
    <section class="completed">
      <h2>Completed</h2>
      {#each vm.completedTasks as task}
        <TaskItem {task} onclick={() => handleTaskClick(task)} />
      {/each}
    </section>
  {/if}
</div>
```

## Key Benefits

### 1. Testability

ViewModels are pure functions, making them trivial to test:

```typescript
import { createTaskListViewModel } from './taskListViewModel';
import type { TaskListState } from './taskListViewModel';

describe('TaskListViewModel', () => {
  test('viewTitle shows project name when in project view', () => {
    const state: TaskListState = {
      currentView: 'project',
      currentProjectId: 'project-1',
      projects: [
        { id: 'project-1', name: 'My Project', workspaceId: 'w1' }
      ],
      tasks: [],
      currentWorkspace: 'w1',
      perspectives: []
    };
    
    const vm = createTaskListViewModel(state);
    expect(vm.viewTitle).toBe('My Project');
  });
  
  test('activeTasks filters completed and other workspace tasks', () => {
    const state: TaskListState = {
      tasks: [
        { id: '1', completed: false, workspaceId: 'w1', ...},
        { id: '2', completed: true, workspaceId: 'w1', ...},
        { id: '3', completed: false, workspaceId: 'w2', ...},
      ],
      currentWorkspace: 'w1',
      // ... other required state
    };
    
    const vm = createTaskListViewModel(state);
    expect(vm.activeTasks).toHaveLength(1);
    expect(vm.activeTasks[0].id).toBe('1');
  });
});
```

### 2. Separation of Concerns

- **Component**: Handles rendering and user interactions
- **ViewModel**: Handles data transformation and computed properties
- **Store**: Holds application state
- **Service**: Handles business operations

### 3. Type Safety

TypeScript provides full IntelliSense and type checking:

```typescript
const vm = createTaskListViewModel(state);
vm.viewTitle;        // ✅ TypeScript knows this is a string
vm.activeTasks;      // ✅ TypeScript knows this is Task[]
vm.nonExistent;      // ❌ TypeScript error: Property doesn't exist
```

### 4. Reusability

ViewModels can be reused across different components:

```svelte
<!-- TaskListPage.svelte -->
<script>
  const vm = $derived(createTaskListViewModel({...}));
</script>

<!-- TaskListWidget.svelte -->
<script>
  const vm = $derived(createTaskListViewModel({...}));
</script>
```

## Best Practices

### DO: Keep ViewModels Pure

```typescript
// ✅ Good - Pure function
get sortedTasks() {
  return [...state.tasks].sort((a, b) => a.order - b.order);
}

// ❌ Bad - Side effect
get sortedTasks() {
  console.log('Sorting tasks'); // Side effect!
  return state.tasks.sort((a, b) => a.order - b.order); // Mutates array!
}
```

### DO: Use Descriptive Names

```typescript
// ✅ Good - Clear what it returns
get activeTaskCount(): number
get isProjectView(): boolean
get sortedByPriorityTasks(): Task[]

// ❌ Bad - Unclear
get count(): number
get check(): boolean
get tasks(): Task[]
```

### DO: Colocate with Component

```
lib/components/tasks/
├── TaskList.svelte
├── taskListViewModel.ts    # ✅ Colocated
└── TaskListItem.svelte
```

### DON'T: Create Generic ViewModels

```typescript
// ❌ Bad - Generic ViewModel for multiple components
export function createGenericViewModel(state) {
  return {
    get taskListTitle() { },    // Used by TaskList
    get sidebarTitle() { },      // Used by Sidebar
    get headerSubtitle() { }     // Used by Header
  };
}

// ✅ Good - Specific ViewModels
export function createTaskListViewModel(state) { }
export function createSidebarViewModel(state) { }
export function createHeaderViewModel(state) { }
```

### DON'T: Put Business Logic in ViewModels

```typescript
// ❌ Bad - Business logic in ViewModel
get processedTasks() {
  return state.tasks.map(task => {
    // Complex business rules
    task.priority = calculatePriority(task);
    task.score = calculateScore(task);
    return task;
  });
}

// ✅ Good - Call domain logic
get processedTasks() {
  return processTasksForDisplay(state.tasks); // Domain function
}
```

## When to Use ViewModels

### Use ViewModels When:

- **Complex computed properties** - Multiple derived values from state
- **Data transformation** - Grouping, sorting, filtering for display
- **Reusable view logic** - Same logic needed in multiple places
- **Testing is important** - Need to test view logic independently
- **Component is getting large** - Extract logic to simplify component

### Skip ViewModels When:

- **Simple components** - Just displaying props
- **Trivial logic** - Single-line computed values
- **Pure presentation** - No data transformation needed
- **Pass-through components** - Just forwarding props

## Example: Simple vs Complex

### Simple Component (No ViewModel Needed)

```svelte
<!-- TaskCount.svelte -->
<script>
  export let count: number;
</script>

<span class="count">{count} tasks</span>
```

### Complex Component (ViewModel Beneficial)

```svelte
<!-- TaskDashboard.svelte -->
<script>
  const vm = $derived(createDashboardViewModel({
    tasks: $tasks,
    projects: $projects,
    users: $users,
    currentPeriod: $selectedPeriod
  }));
</script>

<div class="dashboard">
  <h1>{vm.periodTitle}</h1>
  
  <div class="stats">
    <Stat label="Completion Rate" value={vm.completionRate} />
    <Stat label="Overdue" value={vm.overdueCount} />
    <Stat label="Due Today" value={vm.dueTodayCount} />
  </div>
  
  <div class="charts">
    <BarChart data={vm.tasksByProject} />
    <LineChart data={vm.completionTrend} />
  </div>
  
  <div class="lists">
    <TaskList title="High Priority" tasks={vm.highPriorityTasks} />
    <TaskList title="Recently Completed" tasks={vm.recentlyCompleted} />
  </div>
</div>
```

## Advanced Patterns

### Composing ViewModels

```typescript
export function createDashboardViewModel(state: DashboardState) {
  // Compose other ViewModels
  const taskListVm = createTaskListViewModel(state);
  const statsVm = createStatsViewModel(state);
  
  return {
    // Delegate to composed ViewModels
    ...taskListVm,
    ...statsVm,
    
    // Add dashboard-specific logic
    get dashboardTitle() {
      return `Dashboard - ${taskListVm.viewTitle}`;
    }
  };
}
```

### Memoization for Expensive Computations

```typescript
export function createTaskListViewModel(state: TaskListState) {
  let memoizedExpensiveValue: ExpensiveType | null = null;
  let memoizedStateHash: string | null = null;
  
  return {
    get expensiveComputation() {
      const currentHash = hashState(state);
      if (currentHash !== memoizedStateHash) {
        memoizedExpensiveValue = performExpensiveComputation(state);
        memoizedStateHash = currentHash;
      }
      return memoizedExpensiveValue;
    }
  };
}
```

## Migration Guide

### From Mixed Component Logic

**Before:**
```svelte
<script>
  // All logic in component
  $: activeTasks = $tasks.filter(t => !t.completed);
  $: completedTasks = $tasks.filter(t => t.completed);
  $: viewTitle = $currentView === 'all' ? 'All' : 'Tasks';
  $: groupedTasks = groupTasksByProject(activeTasks);
</script>
```

**After:**
```svelte
<script>
  // Logic extracted to ViewModel
  const vm = $derived(createTaskListViewModel({
    tasks: $tasks,
    currentView: $currentView
  }));
</script>
```

### From Derived Stores

**Before:**
```typescript
// In store file
export const activeTasks = derived(
  [tasks, currentWorkspace],
  ([$tasks, $workspace]) => 
    $tasks.filter(t => !t.completed && t.workspaceId === $workspace)
);
```

**After:**
```typescript
// In ViewModel
get activeTasks() {
  return state.tasks.filter(t => 
    !t.completed && 
    t.workspaceId === state.currentWorkspace
  );
}
```

## Summary

ViewModels provide a powerful pattern for managing complex view logic in SvelteKit applications. They offer:

- **Clean separation** between UI and logic
- **Excellent testability** with pure functions
- **Type safety** with TypeScript
- **Natural reactivity** with Svelte's `$derived`
- **Better maintainability** through cohesion

Use them wisely for complex components, but don't over-engineer simple ones. The goal is to make your codebase more maintainable, not more complex.