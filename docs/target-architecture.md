# Target Architecture Guide

## Overview
This document defines the target architecture for the Karma Tasker application. It describes how the code should be organized after the refactoring is complete.

## Directory Structure

```
src/lib/
├── domain/                 # Business logic and rules (pure functions)
│   ├── task/
│   │   ├── model.ts        # Task types and interfaces
│   │   └── logic.ts        # Task business rules
│   ├── project/
│   │   ├── model.ts
│   │   └── logic.ts
│   ├── workspace/
│   │   ├── model.ts
│   │   └── logic.ts
│   └── perspective/
│       ├── model.ts
│       └── logic.ts
├── repositories/           # Data persistence layer
│   ├── taskRepository.ts
│   ├── projectRepository.ts
│   └── workspaceRepository.ts
├── services/              # Business operations orchestration
│   ├── taskService.ts
│   ├── projectService.ts
│   ├── workspaceService.ts
│   ├── navigationService.ts
│   ├── initService.ts
│   ├── devService.ts
│   └── index.ts           # Barrel export
├── stores/                # State management (Svelte stores)
│   ├── taskStore.ts       # Task state
│   ├── projectStore.ts    # Project state
│   ├── workspaceStore.ts  # Workspace state
│   ├── uiStore.ts         # UI state
│   ├── derivedStores.ts   # Computed values
│   └── index.ts           # Barrel export
├── components/            # UI components
│   ├── tasks/
│   │   ├── TaskList.svelte
│   │   ├── TaskItem.svelte
│   │   ├── TaskInlineEditor.svelte
│   │   └── taskListViewModel.ts
│   ├── navigation/
│   │   ├── Sidebar.svelte
│   │   └── sidebarViewModel.ts
│   ├── dialogs/
│   │   ├── NewTaskDialog.svelte
│   │   └── TaskDetailsDialog.svelte
│   └── forms/
│       └── TaskEditorForm.svelte
├── types/                 # Shared types and interfaces
│   └── index.ts          # Common types (ViewType, etc.)
└── data/                 # Mock data for development
    └── mockData.ts

```

## Layer Responsibilities

### 1. Domain Layer (`/lib/domain/`)

**Purpose**: Rich domain objects with encapsulated business logic

**Structure**:
- Each domain entity gets its own folder
- Domain entities with business methods
- Smart collections with filtering/sorting/grouping
- Value objects for immutable concepts
- Strategy patterns for varying behavior

**Example - Task Domain**:

```typescript
// domain/task/Task.ts - Rich domain entity
export class Task {
  private constructor(
    private readonly id: string,
    private title: string,
    private completed: boolean,
    private projectId: string,
    private workspaceId: string,
    private perspective: string,
    private order: number,
    private updatedAt: Date
  ) {}

  // Factory method with built-in validation
  static create(params: TaskParams): Task {
    const validation = this.validate(params);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    return new Task(/* ... */);
  }

  // Business methods encapsulate rules
  complete(): void {
    if (!this.canComplete()) {
      throw new BusinessRuleViolation('Cannot complete task without title');
    }
    this.completed = true;
    this.updatedAt = new Date();
  }

  canComplete(): boolean {
    return this.title.trim().length > 0;
  }

  isActive(): boolean {
    return !this.completed;
  }

  moveToProject(projectId: string): void {
    this.projectId = projectId;
    this.updatedAt = new Date();
  }

  // Getters for controlled access
  getId(): string { return this.id; }
  getTitle(): string { return this.title; }
  // ... other getters

  // For persistence
  toPersistence(): TaskData { /* ... */ }
}

// domain/task/TaskCollection.ts - Smart collection
export class TaskCollection {
  private tasks: Map<string, Task>;

  add(task: Task): void {
    // Automatically calculates order
    const nextOrder = this.getNextOrder();
    task.setOrder(nextOrder);
    this.tasks.set(task.getId(), task);
  }

  // Filtering returns new collections
  getActive(): TaskCollection {
    const active = Array.from(this.tasks.values())
      .filter(task => task.isActive());
    return new TaskCollection(active);
  }

  getByProject(projectId: string): TaskCollection { /* ... */ }
  
  // Sorting methods
  sortByOrder(): Task[] { /* ... */ }
  sortByPerspectiveThenOrder(perspectiveOrder: Map<string, number>): Task[] { /* ... */ }
  
  // Grouping methods
  groupByProject(): Map<string, Task[]> { /* ... */ }
  
  // Business calculations
  getNextOrder(): number { /* ... */ }
}
```

### 2. Repository Layer (`/lib/repositories/`)

**Purpose**: Data persistence abstraction, API simulation

**Responsibilities**:
- CRUD operations
- **WORKSPACE-SCOPED QUERIES**: All queries must filter by workspace
- Data persistence (using svelte-persisted-store)
- Simulated network delays
- Error simulation for development

**CRITICAL**: Repository methods ALWAYS require workspaceId parameter

**Example - Task Repository**:

```typescript
// repositories/taskRepository.ts
import { persisted } from 'svelte-persisted-store';
import type { Task, TaskDraft } from '$lib/domain/task/model';

const STORAGE_KEY = 'karma-tasks-tasks';
const taskStore = persisted<Task[]>(STORAGE_KEY, []);

export const taskRepository = {
  // ✅ ALWAYS workspace-scoped
  async getByWorkspace(workspaceId: string): Promise<Task[]> {
    await simulateDelay(100);
    return new Promise((resolve) => {
      taskStore.subscribe(tasks => {
        // Filter by workspace at repository level
        const workspaceTasks = tasks.filter(t => t.workspaceId === workspaceId);
        resolve(workspaceTasks);
      })();
    });
  },

  async create(draft: TaskDraft & { workspaceId: string, order: number }): Promise<Task> {
    await simulateDelay(300);
    await simulateOccasionalFailure(0.1);
    
    const newTask: Task = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    taskStore.update(tasks => [...tasks, newTask]);
    return newTask;
  },

  async update(id: string, updates: TaskUpdate): Promise<Task> {
    await simulateDelay(200);
    let updated: Task | undefined;
    
    taskStore.update(tasks => tasks.map(task => {
      if (task.id === id) {
        updated = { ...task, ...updates, updatedAt: new Date() };
        return updated;
      }
      return task;
    }));
    
    if (!updated) throw new Error(`Task ${id} not found`);
    return updated;
  },

  subscribe: taskStore.subscribe
};
```

### 3. Service Layer (`/lib/services/`)

**Purpose**: Business operation orchestration

**Responsibilities**:
- **WORKSPACE CONTEXT MANAGEMENT**: Load and switch workspace data
- Coordinate between repositories and stores
- Execute complex business operations
- Handle cross-domain operations
- Apply business rules from domain layer

**Example - Task Service**:

```typescript
// services/taskService.ts
import { Task, TaskCollection } from '$lib/domain/task';
import { taskRepository } from '$lib/repositories/taskRepository';
import { tasks } from '$lib/stores/taskStore';

export const taskService = {
  // ✅ ALWAYS loads for specific workspace
  async loadWorkspaceTasks(workspaceId: string): Promise<void> {
    const taskData = await taskRepository.getByWorkspace(workspaceId);
    const domainTasks = taskData.map(data => Task.fromPersistence(data));
    tasks.set(domainTasks); // Store only contains current workspace tasks
  },

  async switchWorkspace(newWorkspaceId: string): Promise<void> {
    // Clear previous workspace data
    tasks.set([]);
    // Load new workspace data
    await this.loadWorkspaceTasks(newWorkspaceId);
  },

  async createTask(params: CreateTaskParams): Promise<Task> {
    // Create domain entity (validation happens inside)
    const task = Task.create({
      title: params.title,
      description: params.description,
      projectId: params.projectId,
      workspaceId: params.workspaceId,
      perspective: params.perspective
    });

    // Get current tasks and add new one
    const allTasks = await taskRepository.getAll();
    const collection = new TaskCollection(
      allTasks.map(data => Task.fromPersistence(data))
    );
    collection.add(task); // Order calculated automatically

    // Persist
    await taskRepository.create(task.toPersistence());

    // Update store
    tasks.update(t => [...t, task]);
    
    return task;
  },

  async completeTask(taskId: string): Promise<Task> {
    const taskData = await taskRepository.getById(taskId);
    if (!taskData) throw new Error('Task not found');
    
    // Reconstitute domain entity
    const task = Task.fromPersistence(taskData);
    
    // Business logic is in the entity
    task.complete(); // Throws if business rules violated
    
    // Persist changes
    const updated = await taskRepository.update(taskId, task.toPersistence());
    
    // Update store
    tasks.update(list => 
      list.map(t => t.getId() === taskId ? task : t)
    );
    
    return task;
  }
};
```

### 4. Store Layer (`/lib/stores/`)

**Purpose**: Application state management

**CRITICAL PRINCIPLE**: Stores contain ONLY current workspace data

**Structure**:
- Simple writable stores for state
- **Workspace-scoped**: Only current workspace entities in memory
- Derived stores for computed values
- No business logic (just state containers)

**Example Stores**:

```typescript
// stores/taskStore.ts
import { writable } from 'svelte/store';
import type { Task } from '$lib/domain/task/model';

// ✅ Only contains current workspace's tasks
export const tasks = writable<Task[]>([]);

// stores/projectStore.ts
// ✅ Only contains current workspace's projects
export const projects = writable<Project[]>([]);

// stores/workspaceStore.ts
export const workspaces = writable<WorkspaceInfo[]>([]); // List of all workspaces
export const currentWorkspaceId = writable<string | null>(null);
export const perspectives = writable<Perspective[]>([]); // Current workspace only

// stores/navigationStore.ts
import { writable } from 'svelte/store';
import type { ViewType } from '$lib/types';

export const currentView = writable<ViewType>('perspective');
export const currentPerspectiveId = writable<string | undefined>();
export const currentProjectId = writable<string | undefined>();
export const showCompleted = writable(false);

// stores/derivedStores.ts
import { derived } from 'svelte/store';
import { tasks, navigation } from './index';

// ✅ No workspace filtering needed - tasks already scoped
export const filteredTasks = derived(
  [tasks, navigation],
  ([$tasks, $navigation]) => {
    const collection = new TaskCollection($tasks);
    
    switch ($navigation.currentView) {
      case 'perspective':
        return collection.getByPerspective($navigation.currentPerspectiveId);
      case 'project':
        return collection.getByProject($navigation.currentProjectId);
      default:
        return $tasks; // All tasks in current workspace
    }
  }
);
```

### 5. ViewModel Layer (`/lib/components/*/`)

**Purpose**: View logic and presentation preparation

**Responsibilities**:
- Transform store data for presentation
- Handle view-specific calculations
- Encapsulate complex view logic
- **IMPORTANT**: Components must NEVER have complex expressions - ALL logic goes in ViewModel

**Pure ViewModel Pattern Rules**:
1. **No complex expressions in components** - Even simple conditionals should be in ViewModel
2. **No direct prop access in template** - Everything accessed via `vm.property`
3. **No inline callbacks** - Use ViewModel methods like `vm.handleClick(id)`
4. **No data lookups in component** - ViewModel resolves all entities
5. **No string concatenation/formatting** - ViewModel provides formatted strings
6. **Consistent data passing** - Components receive ALL data through props, never access stores directly
   - Props provide consistency and explicit dependencies
   - Parent components access stores and pass data down
   - This makes components testable and reusable

**Example - TaskList ViewModel**:

```typescript
// components/tasks/taskListViewModel.ts
export interface TaskListState {
  tasks: Task[];
  projects: Project[];
  currentView: ViewType;
  currentPerspectiveId?: string;
  currentProjectId?: string;
  showCompleted: boolean;
}

export function createTaskListViewModel(state: TaskListState) {
  return {
    get viewTitle(): string {
      // Logic to determine view title based on current view
    },

    get groupedTasks(): GroupedTasks {
      // Logic to group tasks based on current view
    },

    get taskCount(): number {
      return filterActive(state.tasks).length;
    },

    shouldGroupByProject(): boolean {
      return state.currentView === 'perspective' || 
             state.currentView === 'all';
    }
  };
}
```

### 6. Component Layer (`/lib/components/`)

**Purpose**: UI presentation and user interaction

**Principles**:
- Keep components simple and focused
- Use ViewModels for complex logic
- Call services for business operations
- Subscribe to stores for reactive data

**Example Component Structure (Pure ViewModel Pattern)**:

```svelte
<!-- components/tasks/TaskList.svelte -->
<script lang="ts">
  import { createTaskListViewModel } from './taskListViewModel';
  import type { TaskListState } from './taskListViewModel';
  
  // Props interface - what the component receives
  interface Props {
    tasks: Task[];
    projects: Project[];
    perspectives: PerspectiveConfig[];  // ✅ Passed as prop
    currentView: ViewType;
    // ... other props
  }
  
  let { tasks, projects, perspectives, ... }: Props = $props();
  
  // ❌ BAD - Direct store access in component
  // import { workspacePerspectives } from '$lib/stores';
  // const perspectives = $workspacePerspectives;
  
  // Build state ONCE - no complex expressions here
  $: state = { tasks, projects, perspectives, ... };
  $: actions = { onTaskToggle, onTaskClick, ... };
  
  // Create ViewModel - single point of logic
  $: vm = createTaskListViewModel(state, actions);
</script>

<!-- Template uses ONLY vm - no logic, no expressions -->
<div class="task-list">
  <h2>{vm.viewTitle}</h2>
  
  {#each vm.taskGroups as group}
    <div class={vm.getGroupClass(group.id)}>
      <h3>{group.title}</h3>
      {#each group.tasks as task}
        <!-- No inline callbacks, use VM methods -->
        <button onclick={() => vm.handleTaskClick(task.id)}>
          {task.title}
        </button>
      {/each}
    </div>
  {/each}
  
  <!-- Even simple conditionals go through VM -->
  {#if vm.showCompletedSection}
    <!-- ... -->
  {/if}
</div>
```

**BAD Examples (what NOT to do)**:
```svelte
<!-- ❌ Complex expression in template -->
{group.id.startsWith('project-') ? 'capitalize' : ''}

<!-- ❌ Inline callback creation -->
onClick={(t) => toggleInlineEditor(t.id)}

<!-- ❌ Data lookup in component -->
currentProjectId ? projects.find(p => p.id === currentProjectId) : undefined

<!-- ❌ Direct prop access in template -->
{#each projects as project}

<!-- ❌ Logic in template -->
{#if showCompleted || tasks.length > 0}
```

**GOOD Examples (ViewModel handles everything)**:
```svelte
<!-- ✅ VM provides computed class -->
{vm.getGroupClass(group.id)}

<!-- ✅ VM provides method -->
onclick={vm.handleTaskClick}

<!-- ✅ VM resolves entities -->
{vm.currentProject}

<!-- ✅ Access via VM -->
{#each vm.projects as project}

<!-- ✅ VM computes visibility -->
{#if vm.shouldShowCompleted}
```

## Naming Conventions

### Files
- **Domain models**: `{entity}/model.ts` (e.g., `task/model.ts`)
- **Domain logic**: `{entity}/logic.ts` (e.g., `task/logic.ts`)
- **Repositories**: `{entity}Repository.ts` (e.g., `taskRepository.ts`)
- **Services**: `{entity}Service.ts` (e.g., `taskService.ts`)
- **Stores**: `{entity}Store.ts` (e.g., `taskStore.ts`)
- **ViewModels**: `{component}ViewModel.ts` (e.g., `taskListViewModel.ts`)

### Types/Interfaces
- **Entities**: PascalCase (e.g., `Task`, `Project`)
- **Drafts**: `{Entity}Draft` (e.g., `TaskDraft`)
- **Updates**: `{Entity}Update` (e.g., `TaskUpdate`)
- **Props**: `{Component}Props` (e.g., `TaskItemProps`)
- **State**: `{Component}State` (e.g., `TaskListState`)

### Functions
- **Domain logic**: camelCase verbs (e.g., `calculateNextOrder`, `validateTask`)
- **Services**: camelCase actions (e.g., `createTask`, `loadTasks`)
- **Repositories**: CRUD names (e.g., `create`, `update`, `getAll`, `getById`)

## Data Flow

```
User Interaction
       ↓
   Component
       ↓
   Service (orchestration)
    ↙     ↘
Domain   Repository
(rules)  (persistence)
    ↘     ↙
     Store
       ↓
   Component (reactive update)
```

## Key Principles

1. **Single Responsibility**: Each layer has one clear purpose
2. **Dependency Direction**: Components → Services → Domain/Repository → Store
3. **No Circular Dependencies**: Strict layering prevents cycles
4. **Workspace-Scoped Data Loading**: ALL entities (tasks, projects, perspectives) are loaded only from the current workspace
   - Repository methods ALWAYS require workspaceId
   - Service layer manages workspace switching
   - Stores contain ONLY current workspace data
   - Domain layer has NO workspace awareness
5. **Rich Domain Objects**: Business logic lives in domain entities, not utility functions
   - Entities protect their invariants
   - Business methods on entities (`task.complete()`)
   - Smart collections handle filtering/sorting/grouping (no workspace filtering needed)
   - Value objects for immutable concepts
6. **Pure Components**: NO logic in components - everything through ViewModel
   - No expressions beyond `vm.property`
   - No inline callbacks
   - No conditionals except `{#if vm.something}`
   - No data transformations
7. **Pure ViewModels**: All view logic encapsulated
   - Resolves all entities (no ID lookups in component)
   - Provides all computed properties
   - Handles all user interactions
   - Formats all display strings
8. **Tell, Don't Ask**: Objects should tell others what to do, not expose data for decisions
   - `task.complete()` not `if (canComplete(task)) { task.completed = true }`
   - Encapsulation over data exposure
9. **Reactive Updates**: Stores trigger UI updates automatically
10. **Error Handling**: Services handle and transform errors appropriately
11. **Type Safety**: Full TypeScript types throughout
12. **WorkspaceContext Pattern**: Use rich context objects instead of raw stores
    - Encapsulate workspace data access through methods
    - Pass context objects to components, not individual stores
    - Use methods like `hasPerspective()` instead of array operations

## Testing Strategy

- **Domain Logic**: Unit tests with pure functions
- **Repositories**: Mock persistence layer
- **Services**: Integration tests with mocked repositories
- **ViewModels**: Unit tests for presentation logic
- **Components**: Component tests with mocked services
- **E2E**: Full flow tests with real stores

## Recent Architectural Decisions (2024)

### 1. WorkspaceContext Pattern
**Decision**: Use rich context objects instead of passing individual stores or props.

**Implementation**:
```typescript
// ✅ GOOD - Pass context object
interface Props {
  workspace: WorkspaceContext;
  navigation: NavigationState;
}

// ❌ BAD - Pass individual pieces
interface Props {
  projects: Project[];
  perspectives: PerspectiveConfig[];
  currentProjectId: string;
  currentPerspectiveId: string;
}
```

**Benefits**:
- Cleaner component interfaces
- Encapsulated data access logic
- Easier refactoring and testing
- Methods provide better API than raw data

### 2. Unified Props Pattern
**Decision**: Component props should extend ViewState and Actions interfaces.

**Implementation**:
```typescript
// ViewModel defines the interfaces
export interface TaskListViewState {
  tasks: Task[];
  workspace: WorkspaceContext;
  navigation: NavigationState;
  showCompleted: boolean;
}

export interface TaskListActions {
  onTaskToggle: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
}

// Component props extend both
interface Props extends TaskListViewState, TaskListActions {}
```

**Benefits**:
- Props and ViewState stay in sync automatically
- Clear separation between data and actions
- Type safety across layers

### 3. No Direct Store Access Rule
**Decision**: Components must never access stores directly - all data flows through props from parent components.

**Implementation**:
```typescript
// ✅ GOOD - Parent accesses stores and passes data down
// In +page.svelte (parent):
import { workspaceContext } from '$lib/stores/workspaceContext';
import { navigation } from '$lib/stores/navigationStore';
<TaskList workspace={$workspaceContext} navigation={$navigation} />

// ❌ BAD - Component accesses store directly
// Inside TaskList.svelte:
import { workspaceProjects } from '$lib/stores';
const projects = $workspaceProjects;

// ❌ BAD - Even importing stores is prohibited
import { currentWorkspace, tasks } from '$lib/stores/taskStore';
```

**Store Access Hierarchy**:
1. **Route Components (+page.svelte)**: Can access stores directly
2. **Container Components**: Receive data via props, pass to children
3. **Presentation Components**: Pure components, only props

**Rationale**:
- **Testability**: Components with only props are easy to test
- **Reusability**: Components don't depend on specific store structure
- **Clear Dependencies**: All data dependencies are explicit in props
- **Maintainability**: Changing store structure only affects route components
- **Type Safety**: Props provide clear contracts

**Benefits**:
- Components are pure and testable
- Clear data flow from parent to child
- No hidden dependencies or side effects
- Easy to reason about component behavior
- Simple to mock data for testing

### 4. NavigationState as First-Class Object
**Decision**: Group navigation-related state into a single object.

**Implementation**:
```typescript
export interface NavigationState {
  currentView: ViewType;
  currentPerspectiveId?: string;
  currentProjectId?: string;
}

// Pass as single prop
<TaskList navigation={navigation} />
```

**Benefits**:
- Related state stays together
- Easier to pass through component hierarchy
- Clear navigation context

### 5. Configuration-Based View Logic
**Decision**: Replace switch statements with configuration objects where possible.

**Implementation**:
```typescript
// Instead of switch statements
const VIEW_CONFIG: Record<ViewType, ViewConfiguration> = {
  'perspective': {
    groupBy: 'project',
    getTitle: (ctx) => ctx.perspective?.name || 'Tasks'
  },
  'all': {
    groupBy: 'project',
    getTitle: () => 'All'
  }
};

// Use configuration
const config = VIEW_CONFIG[viewType];
const grouping = config.groupBy;
```

**Benefits**:
- More declarative code
- Easier to extend
- Less branching logic

## Migration Notes

When migrating existing code to this architecture:

1. Start with domain layer (no dependencies)
2. Build repositories with existing store data
3. Create services to orchestrate operations
4. Refactor stores to be simple state containers
5. Extract ViewModels from complex components
6. Update components to use services
7. Replace direct store access with context objects
8. Group related state into cohesive interfaces

This architecture provides clear separation of concerns, making the codebase maintainable, testable, and scalable.