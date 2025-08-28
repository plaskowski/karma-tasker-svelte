# Refactoring Plan: Karma Tasker Architecture Migration

## Overview
This document outlines the step-by-step plan to migrate the current codebase to the target architecture defined in `target-architecture.md`.

## YAGNI Principle (You Aren't Gonna Need It)
**CRITICAL: Only implement what is currently used in the application. Do not add:**
- Features "for the future"
- Methods that aren't called
- Abstractions without immediate use
- "Nice to have" functionality
- Speculative generalizations

**Every piece of code must have a current consumer in the existing application.**

## Current State Assessment

### What We Have
- ✅ WorkspaceContext pattern partially implemented
- ✅ NavigationState as single store
- ✅ No direct store access rule in components
- ⚠️ Mixed business logic in stores and components
- ⚠️ No clear domain/service/repository separation
- ❌ No domain layer
- ❌ No repository layer
- ❌ No service layer
- ❌ ViewModels not fully extracted

### Technical Debt to Address
1. `taskStore.ts` contains mixed concerns (state, business logic, persistence)
2. Business logic scattered across components and stores
3. Direct manipulation of store data without service layer
4. No clear separation between data persistence and state management

## Migration Phases

### Phase 1: Domain Layer Creation (Object-Oriented)
**Goal**: Create rich domain objects that encapsulate both data and business logic

#### 1.1 Create Domain Structure (Minimal)
```
src/lib/domain/
├── task/
│   ├── Task.ts              # Task entity with business methods
│   ├── TaskCollection.ts    # Smart collection for task operations
│   └── index.ts            
├── project/
│   ├── Project.ts           # Simple project entity
│   ├── ProjectCollection.ts # Basic collection for projects
│   └── index.ts
├── perspective/
│   ├── Perspective.ts       # Simple value object
│   ├── PerspectiveCollection.ts # Basic collection
│   └── index.ts
└── shared/
    ├── errors.ts           # ValidationError only
    └── types.ts            # Shared types
```

#### 1.2 Domain Object Principles

**Rich domain objects provide:**
- **Encapsulation**: Business logic lives with the data it operates on
- **Invariant Protection**: Objects maintain their own validity
- **Meaningful APIs**: Methods like `task.complete()` vs utility functions
- **Type Safety**: Can't pass wrong arguments when methods are on object
- **Discoverability**: IDE shows all available operations

**Examples of Domain Objects:**

```typescript
// domain/task/Task.ts - Rich domain entity
export class Task {
  // Factory method with validation
  static create(params: TaskParams): Task {
    const validation = this.validate(params);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    return new Task(/* ... */);
  }

  // Business methods
  complete(): void {
    if (!this.canComplete()) {
      throw new BusinessRuleViolation('Cannot complete task without title');
    }
    this.completed = true;
    this.updatedAt = new Date();
  }

  moveToProject(projectId: string): void {
    this.projectId = projectId;
    this.updatedAt = new Date();
  }
}

  // Filtering returns new collections
  getActive(): TaskCollection {
    const active = this.tasks.values()
      .filter(task => task.isActive());
    return new TaskCollection(active);
  }

  // Grouping returns map
  groupByProject(): Map<string, Task[]> {
    const groups = new Map<string, Task[]>();
    this.tasks.forEach(task => {
      const projectId = task.getProjectId();
      if (!groups.has(projectId)) {
        groups.set(projectId, []);
      }
      groups.get(projectId)!.push(task);
    });
    return groups;
  }
}
```

#### 1.3 Create Domain Entities
- [ ] Create `Task` entity with:
  - `complete()` / `uncomplete()` - toggle functionality
  - `isActive()` - filtering
  - `updateTitle()`, `updateDescription()` - inline editor
  - `toPersistence()` / `fromPersistence()` - storage
- [ ] Create `TaskCollection` with:
  - `getActive()` / `getCompleted()` - TaskList filtering
  - `getByProject()` / `getByPerspective()` - view filtering
  - `sortByOrder()` - default sorting
  - `groupByProject()` / `groupByPerspective()` - view grouping
- [ ] Create `Project` entity with:
  - Basic getters - display
  - `toPersistence()` / `fromPersistence()` - storage
- [ ] Create `ProjectCollection` with:
  - `getSortedByOrder()` - sidebar display
  - `getDefault()` - new task defaults
- [ ] Create `Perspective` value object with:
  - Basic getters - display
- [ ] Create `PerspectiveCollection` with:
  - `getDefault()` - new task defaults  
  - `getEffectiveId()` - navigation logic
- [ ] Create `ValidationError` class

#### 1.4 Benefits of Object-Oriented Domain

**Why OO instead of functional?**

1. **Encapsulation**: Business rules stay with the data they govern
2. **Tell, Don't Ask**: `task.complete()` vs `if (canComplete(task))`
3. **Invariant Protection**: Objects maintain their own validity
4. **Discoverability**: IDE shows all methods available on an object
5. **Cleaner Services**: Services just orchestrate, entities handle logic

**Real-world example:**
```typescript
// Service with OO domain
async function createTask(params: CreateTaskParams) {
  // Entity handles validation internally
  const task = Task.create(params);
  
  // Collection handles order calculation
  const tasks = new TaskCollection(await repository.getAll());
  tasks.add(task);
  
  // Simple persistence
  await repository.save(task.toPersistence());
  return task;
}

async function completeTask(taskId: string) {
  const data = await repository.getById(taskId);
  const task = Task.fromPersistence(data);
  
  // Entity handles business rules
  task.complete(); // Throws if rules violated
  
  await repository.save(task.toPersistence());
  return task;
}
```

#### 1.5 Remove Business Logic from Current Locations
- [ ] Remove logic from `taskStore.ts`
- [ ] Remove logic from `workspaceContext.ts`
- [ ] Remove logic from component files

### Phase 2: Repository Layer (Data Persistence)
**Goal**: Centralize all data persistence operations with WORKSPACE-SCOPED queries and future Supabase integration in mind

#### 2.1 Create Repository Structure
```
src/lib/repositories/
├── interfaces/
│   └── repository.ts      # Common repository interface
├── local/
│   ├── taskRepository.ts  # LocalStorage implementation
│   ├── projectRepository.ts
│   └── workspaceRepository.ts
├── supabase/              # Future: Supabase implementation
│   ├── taskRepository.ts  # Same interface, different implementation
│   ├── projectRepository.ts
│   └── workspaceRepository.ts
├── factory.ts             # Repository factory for switching implementations
└── utils.ts               # simulateDelay, simulateFailure
```

#### 2.2 Implement Repositories with Swappable Backends
- [ ] Create repository interface that both local and Supabase will implement
- [ ] **CRITICAL**: All repository methods require workspaceId parameter
- [ ] Create LocalStorage implementation (filters by workspace in memory)
- [ ] Create repository factory for easy switching
- [ ] Move persisted stores to local repositories
- [ ] Add simulated network delays (prep for real network calls)
- [ ] Add error simulation for development

#### 2.3 Repository Interface Pattern (Supabase-Ready)
```typescript
// interfaces/repository.ts
export interface Repository<T> {
  // Standard CRUD operations - ALL WORKSPACE-SCOPED
  getByWorkspace(workspaceId: string): Promise<T[]>;
  getById(workspaceId: string, id: string): Promise<T | null>;
  create(workspaceId: string, item: Omit<T, 'id' | 'workspaceId'>): Promise<T>;
  update(workspaceId: string, id: string, updates: Partial<T>): Promise<T>;
  delete(workspaceId: string, id: string): Promise<void>;
  
  // Real-time subscription (works with both local and Supabase)
  subscribe(workspaceId: string, callback: (items: T[]) => void): () => void;
  
  // Batch operations - ADD ONLY WHEN NEEDED
  // createMany - NOT YET USED
  // updateMany - NOT YET USED
  // deleteMany - NOT YET USED
  
  // Query operations - ADD ONLY WHEN NEEDED
  // query - NOT YET USED
  // count - NOT YET USED
}

// Factory pattern for easy switching
export function createRepository<T>(
  type: 'local' | 'supabase',
  entityName: string
): Repository<T> {
  if (type === 'supabase') {
    // Future: return new SupabaseRepository<T>(entityName);
    throw new Error('Supabase not yet implemented');
  }
  return new LocalRepository<T>(entityName);
}
```

#### 2.4 Supabase Integration Strategy

**Current (Phase 2)**: LocalStorage Implementation
```typescript
// repositories/local/taskRepository.ts
export class LocalTaskRepository implements Repository<Task> {
  private store = persisted<Task[]>('karma-tasks', []);
  
  // ✅ WORKSPACE-SCOPED: Filter in memory for LocalStorage
  async getByWorkspace(workspaceId: string): Promise<Task[]> {
    // Simulate network delay for realistic behavior
    await simulateDelay(100);
    const allTasks = get(this.store);
    return allTasks.filter(t => t.workspaceId === workspaceId);
  }
  
  async create(workspaceId: string, task: Omit<Task, 'id' | 'workspaceId'>): Promise<Task> {
    await simulateDelay(300);
    const newTask = { ...task, workspaceId, id: crypto.randomUUID() };
    this.store.update(tasks => [...tasks, newTask]);
    return newTask;
  }
  
  subscribe(workspaceId: string, callback: (tasks: Task[]) => void) {
    return this.store.subscribe(allTasks => {
      const workspaceTasks = allTasks.filter(t => t.workspaceId === workspaceId);
      callback(workspaceTasks);
    });
  }
}
```

**Future (Post-MVP)**: Supabase Implementation
```typescript
// repositories/supabase/taskRepository.ts
export class SupabaseTaskRepository implements Repository<Task> {
  private client = createClient(url, key);
  
  // ✅ WORKSPACE-SCOPED: Query filters at database level
  async getByWorkspace(workspaceId: string): Promise<Task[]> {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId); // Efficient DB filtering
    if (error) throw error;
    return data;
  }
  
  async create(workspaceId: string, task: Omit<Task, 'id' | 'workspaceId'>): Promise<Task> {
    const { data, error } = await this.client
      .from('tasks')
      .insert({ ...task, workspace_id: workspaceId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  
  subscribe(workspaceId: string, callback: (tasks: Task[]) => void) {
    const channel = this.client
      .channel(`tasks-${workspaceId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `workspace_id=eq.${workspaceId}` // Real-time filtered by workspace
        },
        (payload) => {
          // Fetch fresh workspace data and callback
          this.getByWorkspace(workspaceId).then(callback);
        }
      )
      .subscribe();
    
    return () => channel.unsubscribe();
  }
}
```

#### 2.5 Migration Benefits
- **Zero service layer changes**: Services don't know if using local or Supabase
- **Gradual migration**: Can migrate one entity at a time
- **Feature flags**: Easy A/B testing between implementations
- **Offline support**: Can fall back to local when offline
- **Development mode**: Use local storage for development, Supabase for production

### Phase 3: Service Layer (Business Operations)
**Goal**: Orchestrate complex operations that involve multiple domains, handle side effects, coordinate between layers, and **manage workspace context switching**

#### 3.1 Service Layer Purpose

**Services are the orchestrators that:**
- **Coordinate** between domain logic, repositories, and stores
- **Handle side effects** like API calls, notifications, analytics
- **Manage transactions** ensuring multiple operations succeed or fail together
- **Apply business workflows** that span multiple domains
- **Maintain consistency** between different data stores
- **Handle errors** and provide user-friendly messages
- **Manage loading states** and optimistic updates

**Key Difference from Domain Logic:**
- **Domain logic**: "How do we calculate task order?" (pure function)
- **Service**: "Create a task, calculate its order, save it, update the store, notify other services" (orchestration with side effects)

#### 3.2 Create Service Structure
```
src/lib/services/
├── taskService.ts         # Task CRUD operations
├── devService.ts          # Development utilities
└── index.ts               # Barrel export
```

#### 3.3 Service Layer Examples (Minimal)

```typescript
// services/taskService.ts - Workspace-aware orchestration
import { Task, TaskCollection } from '$lib/domain/task';
import { taskRepository } from '$lib/repositories/taskRepository';
import { tasks, currentWorkspaceId } from '$lib/stores';

export const taskService = {
  // ✅ Load tasks for specific workspace
  async loadWorkspaceTasks(workspaceId: string): Promise<void> {
    const taskData = await taskRepository.getByWorkspace(workspaceId);
    const domainTasks = taskData.map(data => Task.fromPersistence(data));
    tasks.set(domainTasks); // Store only contains current workspace tasks
  },

  async switchWorkspace(newWorkspaceId: string): Promise<void> {
    // Clear ALL previous workspace data
    tasks.set([]);
    projects.set([]);
    perspectives.set([]);
    
    // Load new workspace data
    await Promise.all([
      this.loadWorkspaceTasks(newWorkspaceId),
      projectService.loadWorkspaceProjects(newWorkspaceId),
      workspaceService.loadWorkspacePerspectives(newWorkspaceId)
    ]);
  },

  async createTask(params: CreateTaskParams): Promise<Task> {
    const workspaceId = get(currentWorkspaceId);
    if (!workspaceId) throw new Error('No workspace selected');
    
    // Create domain entity (validation happens inside)
    const task = Task.create({ ...params, workspaceId });
    
    // Get current workspace tasks to calculate order
    const workspaceTasks = await taskRepository.getByWorkspace(workspaceId);
    const collection = new TaskCollection(workspaceTasks);
    collection.add(task); // Sets order automatically
    
    // Persist and update store
    await taskRepository.create(workspaceId, task.toPersistence());
    tasks.update(t => [...t, task]);
    
    return task;
  },
  
  async toggleTaskComplete(taskId: string): Promise<void> {
    const taskData = await taskRepository.getById(taskId);
    if (!taskData) throw new Error('Task not found');
    
    // Reconstitute domain entity
    const task = Task.fromPersistence(taskData);
    
    // Toggle completion (business logic in entity)
    if (task.isCompleted()) {
      task.uncomplete();
    } else {
      task.complete(); // Throws if rules violated
    }
    
    // Persist and update store
    await taskRepository.update(taskId, task.toPersistence());
    tasks.update(list => 
      list.map(t => t.getId() === taskId ? task : t)
    );
  },
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    await taskRepository.update(taskId, updates);
    tasks.update(list => 
      list.map(t => t.id === taskId ? { ...t, ...updates } : t)
    );
  },

  async deleteTask(taskId: string): Promise<void> {
    await taskRepository.delete(taskId);
    tasks.update(list => list.filter(t => t.id !== taskId));
  }
};
```

#### 3.4 Implement Services
- [ ] Create `taskService.ts` with:
  - `addTask()` - create new tasks
  - `updateTask()` - edit tasks
  - `toggleTaskComplete()` - complete/uncomplete
  - `deleteTask()` - remove tasks
- [ ] Create `devService.ts` with:
  - `resetToInitialState()` - development reset function

#### 3.5 Service Responsibilities Summary

| Responsibility | Domain Logic | Service Layer | Example |
|---------------|--------------|---------------|----------|
| Business Rules | ✅ Defines them | Uses them | `canCompleteTask()` |
| Calculations | ✅ Pure functions | Calls them | `calculateNextOrder()` |
| Validation | ✅ Pure validation | Applies & handles errors | `validateTask()` |
| Persistence | ❌ | Coordinates with repos | `repository.create()` |
| State Updates | ❌ | ✅ Updates stores | `tasks.update()` |
| Side Effects | ❌ | ✅ Handles all | notifications, analytics |
| Loading States | ❌ | ✅ Manages | `loading.set()` |
| Error Handling | ❌ | ✅ User-friendly | try/catch with messages |
| Transactions | ❌ | ✅ Coordinates | multi-step operations |
| Cross-Domain | ❌ | ✅ Orchestrates | task + project updates |

### Phase 4: Store Layer Simplification
**Goal**: Make stores simple state containers that hold ONLY current workspace data

#### 4.1 Refactor Existing Stores
- [ ] Remove business logic from `taskStore.ts`
- [ ] Create clean `uiStore.ts` for UI state
- [ ] Move derived stores to `derivedStores.ts`
- [ ] Merge `currentWorkspace` into `workspaceContext`

#### 4.2 Store Structure
```
src/lib/stores/
├── taskStore.ts       # writable<Task[]> - current workspace only
├── projectStore.ts    # writable<Project[]> - current workspace only  
├── workspaceStore.ts  # writable<WorkspaceInfo[]> - list of all workspaces
├── currentWorkspace.ts # writable<string> - current workspace ID
├── perspectives.ts    # writable<Perspective[]> - current workspace only
├── navigationStore.ts # Already done ✅
├── uiStore.ts         # UI state (showCompleted, etc.)
├── workspaceContext.ts # Already done ✅
├── derivedStores.ts   # All computed values (no workspace filtering needed)
└── index.ts           # Barrel export
```

### Phase 5: ViewModel Extraction
**Goal**: Move all view logic out of components

#### 5.1 Extract ViewModels
- [ ] Complete `taskListViewModel.ts` extraction
- [ ] Create `sidebarViewModel.ts`
- [ ] Create `taskDetailsViewModel.ts`
- [ ] Create `taskEditorViewModel.ts`

#### 5.2 ViewModel Pattern Rules
- All conditionals in ViewModel
- All data transformations in ViewModel
- All formatting in ViewModel
- Components only call VM methods

### Phase 6: Component Purification
**Goal**: Make components pure presentation layers

#### 6.1 Update Components
- [ ] Update TaskList to pure ViewModel pattern
- [ ] Update Sidebar to pure ViewModel pattern
- [ ] Update TaskDetailsDialog to use ViewModel
- [ ] Update TaskEditorForm to use ViewModel

#### 6.2 Component Rules
- No logic in templates
- No direct store access
- All data via props
- All actions via callbacks

### Phase 7: URL Management Service
**Goal**: Extract URL management from +page.svelte

#### 7.1 Create Navigation Service
- [ ] Move URL update logic to `navigationService.ts`
- [ ] Create route parameter parsing
- [ ] Handle browser navigation events
- [ ] Provide navigation helpers

### Phase 8: Testing Infrastructure
**Goal**: Ensure testability at all layers

#### 8.1 Test Structure
```
tests/
├── unit/
│   ├── domain/       # Pure function tests
│   ├── viewmodels/   # ViewModel logic tests
│   └── services/     # Service logic tests
├── integration/      # Service + Repository tests
└── e2e/              # Full flow tests
```

## What to Actually Build First (MVP Refactoring)

### Minimal Domain Layer
1. **Task entity** - just `complete()`, `isActive()`, basic getters
2. **TaskCollection** - just `getActive()`, `sortByOrder()`, `groupByProject()`
3. **Simple validation** - only what's currently validated

### Minimal Repository Layer  
1. **LocalTaskRepository** - just CRUD, no fancy queries
2. **Use existing persisted stores** - don't reinvent the wheel
3. **No abstraction for abstraction's sake**

### Minimal Service Layer
1. **taskService** - just the 3-4 methods currently in taskStore.ts
2. **No orchestration complexity** - services are thin wrappers initially


## Implementation Order

### Sprint 1: Minimal Domain
1. Create domain layer structure
2. Extract types to domain models
3. Extract business logic to domain
4. Create repository layer
5. Implement task repository

### Sprint 2: Services
1. Create service layer structure
2. Implement task service
3. Implement workspace service
4. Connect services to repositories
5. Update stores to use services

### Sprint 3: Store Cleanup
1. Remove business logic from stores
2. Create clean store structure
3. Move derived logic to derivedStores
4. Merge currentWorkspace into workspaceContext

### Sprint 4: ViewModels
1. Complete taskListViewModel
2. Create remaining ViewModels
3. Update components to use ViewModels
4. Remove all logic from components

### Sprint 5: Polish
1. Extract URL management
2. Clean up +page.svelte
3. Add error handling
4. Add loading states
5. Write tests

## Success Criteria

### Architecture Goals
- [ ] Clear separation of concerns
- [ ] No business logic in components
- [ ] No business logic in stores
- [ ] All business rules in domain layer
- [ ] All persistence in repository layer
- [ ] All orchestration in service layer
- [ ] All view logic in ViewModels

### Code Quality Goals
- [ ] Full TypeScript type safety
- [ ] No circular dependencies
- [ ] Consistent naming conventions
- [ ] Pure functions where possible
- [ ] Testable at every layer

### Component Goals
- [ ] Components are pure presentation
- [ ] No direct store access in components
- [ ] All data flows through props
- [ ] ViewModels handle all logic

## Risk Mitigation

### Gradual Migration
- Each phase can be done incrementally
- App remains functional during migration
- Can pause between phases

### Rollback Plan
- Git branches for each phase
- Feature flags for new architecture
- Parallel implementation where needed

### Testing Strategy
- Write tests for new code first
- Maintain existing functionality
- E2E tests to catch regressions

## Supabase Integration Strategy

### Why Repository Pattern is Perfect for Supabase

The repository pattern creates an abstraction layer that makes Supabase integration seamless:

1. **Interface Consistency**: Services interact with repositories through a consistent interface, whether using LocalStorage or Supabase
2. **Incremental Migration**: Can migrate one entity at a time without breaking the app
3. **Environment-Based Switching**: Use LocalStorage for development, Supabase for production
4. **Real-time Ready**: Repository interface includes subscription methods that map directly to Supabase real-time features

### Implementation Approach

#### Step 1: Current State (LocalStorage)
```typescript
// services/taskService.ts - workspace-aware from the start
const repository = createRepository<Task>('local', 'tasks');
const workspaceId = get(currentWorkspaceId);
const tasks = await repository.getByWorkspace(workspaceId);
```

#### Step 2: Supabase Migration (No Service Changes)
```typescript
// services/taskService.ts - EXACT SAME CODE
const repository = createRepository<Task>('supabase', 'tasks');
const workspaceId = get(currentWorkspaceId);
const tasks = await repository.getByWorkspace(workspaceId);  // Now hits Supabase!
```

### Database Schema Preparation

The domain models we create now will map directly to Supabase tables:

```sql
-- Domain model becomes database schema
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  workspace_id UUID REFERENCES workspaces(id),
  perspective TEXT,
  completed BOOLEAN DEFAULT FALSE,
  order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time subscriptions
ALTER TABLE tasks REPLICA IDENTITY FULL;
```

### Authentication & Authorization

Repository layer will handle Supabase auth:

```typescript
class SupabaseRepository<T> {
  constructor(
    private tableName: string,
    private client = createClient(url, key)
  ) {}
  
  async getByWorkspace(workspaceId: string): Promise<T[]> {
    // RLS + workspace filtering for multi-tenant security
    const { data } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('workspace_id', workspaceId);
    return data;
  }
}
```

### Offline Support Strategy

Repository factory can provide offline fallback:

```typescript
export function createRepository<T>(preferred: 'local' | 'supabase'): Repository<T> {
  if (preferred === 'supabase' && navigator.onLine) {
    try {
      return new SupabaseRepository<T>();
    } catch {
      console.warn('Falling back to local storage');
      return new LocalRepository<T>();
    }
  }
  return new LocalRepository<T>();
}
```

### Migration Timeline

1. **Now**: Build with LocalStorage repository
2. **MVP**: Complete app with local persistence
3. **Post-MVP Phase 1**: Add Supabase auth
4. **Post-MVP Phase 2**: Migrate repositories to Supabase
5. **Post-MVP Phase 3**: Add real-time collaboration

## Next Steps

1. **Immediate**: Start with Phase 1.1 - Create domain structure
2. **This Week**: Complete domain layer extraction
3. **Next Week**: Begin repository layer implementation with Supabase interface in mind
4. **Ongoing**: Update this plan as we learn

## Notes

- WorkspaceContext pattern is working well - keep it
- NavigationState consolidation was successful - build on it
- No direct store access rule is good - enforce it
- Consider using dependency injection for services
- May need to adjust plan based on discoveries during implementation