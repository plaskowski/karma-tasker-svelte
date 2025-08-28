# Workspace-Scoped Architecture

## Core Principle
**ALL entities are loaded only from the current workspace** (except the workspace list itself).

## Data Scoping Hierarchy

```
Application
├── Workspaces[]          # Only list loaded (id, name)
└── Current Workspace      # Everything else scoped here
    ├── Tasks[]            # Only this workspace's tasks
    ├── Projects[]         # Only this workspace's projects  
    └── Perspectives[]     # Only this workspace's perspectives
```

## Repository Layer - Always Workspace-Scoped

```typescript
// repositories/taskRepository.ts
export const taskRepository = {
  // ALWAYS requires workspaceId
  async getByWorkspace(workspaceId: string): Promise<TaskData[]> {
    // LocalStorage: filter in memory
    const all = await this.getAll();
    return all.filter(t => t.workspaceId === workspaceId);
  },
  
  // Future Supabase: query at DB level
  async getByWorkspace(workspaceId: string): Promise<TaskData[]> {
    return this.client
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspaceId);
  }
}

// repositories/projectRepository.ts
export const projectRepository = {
  async getByWorkspace(workspaceId: string): Promise<ProjectData[]> {
    // Only fetch projects for current workspace
    const all = await this.getAll();
    return all.filter(p => p.workspaceId === workspaceId);
  }
}

// repositories/workspaceRepository.ts
export const workspaceRepository = {
  async getAllWorkspaces(): Promise<WorkspaceInfo[]> {
    // Only load minimal info for workspace list
    return this.getAll().map(w => ({
      id: w.id,
      name: w.name
    }));
  },
  
  async getWorkspaceDetails(workspaceId: string): Promise<Workspace> {
    // Load full details only for current workspace
    return this.getById(workspaceId);
  }
}
```

## Service Layer - Workspace Context Manager

```typescript
// services/workspaceService.ts
export const workspaceService = {
  private currentWorkspaceId: string | null = null;
  
  async loadWorkspace(workspaceId: string): Promise<void> {
    this.currentWorkspaceId = workspaceId;
    
    // Load ALL entities for this workspace
    await Promise.all([
      this.loadTasks(workspaceId),
      this.loadProjects(workspaceId),
      this.loadPerspectives(workspaceId)
    ]);
  },
  
  async switchWorkspace(newWorkspaceId: string): Promise<void> {
    // Clear ALL current workspace data
    tasksStore.set([]);
    projectsStore.set([]);
    perspectivesStore.set([]);
    
    // Load new workspace data
    await this.loadWorkspace(newWorkspaceId);
  },
  
  private async loadTasks(workspaceId: string): Promise<void> {
    const tasks = await taskRepository.getByWorkspace(workspaceId);
    tasksStore.set(tasks.map(t => Task.fromPersistence(t)));
  },
  
  private async loadProjects(workspaceId: string): Promise<void> {
    const projects = await projectRepository.getByWorkspace(workspaceId);
    projectsStore.set(projects.map(p => Project.fromPersistence(p)));
  },
  
  private async loadPerspectives(workspaceId: string): Promise<void> {
    const workspace = await workspaceRepository.getWorkspaceDetails(workspaceId);
    perspectivesStore.set(workspace.perspectives);
  }
}
```

## Store Layer - Current Workspace Only

```typescript
// stores/index.ts

// Only workspace list is global
export const workspaces = writable<WorkspaceInfo[]>([]);

// Everything else is current-workspace-scoped
export const currentWorkspaceId = writable<string | null>(null);
export const tasks = writable<Task[]>([]);           // Only current workspace
export const projects = writable<Project[]>([]);     // Only current workspace  
export const perspectives = writable<Perspective[]>([]);  // Only current workspace

// Derived stores work with workspace-scoped data
export const filteredTasks = derived(
  [tasks, navigation],
  ([$tasks, $navigation]) => {
    // No workspace filtering needed - $tasks already scoped
    const collection = new TaskCollection($tasks);
    
    switch ($navigation.currentView) {
      case 'perspective':
        return collection.getByPerspective($navigation.currentPerspectiveId);
      case 'project':
        return collection.getByProject($navigation.currentProjectId);
      // etc...
    }
  }
);

export const sortedProjects = derived(
  projects,
  $projects => {
    // No workspace filtering - $projects already scoped
    return [...$projects].sort((a, b) => a.order - b.order);
  }
);
```

## Domain Layer - No Workspace Awareness

```typescript
// domain/task/TaskCollection.ts
export class TaskCollection {
  // No workspace methods needed - collection is pre-scoped
  
  getByProject(projectId: string): TaskCollection {
    // Simple filtering - no workspace check
    return this.filter(task => task.getProjectId() === projectId);
  }
  
  getByPerspective(perspectiveId: string): TaskCollection {
    // Simple filtering - no workspace check
    return this.filter(task => task.getPerspective() === perspectiveId);
  }
}

// domain/project/ProjectCollection.ts
export class ProjectCollection {
  // No workspace filtering - collection only has current workspace's projects
  
  getDefault(): Project | undefined {
    return this.getSortedByOrder()[0];
  }
}
```

## Benefits of Workspace Scoping

1. **Memory Efficiency**
   - Only 1 workspace's data in memory
   - Can support unlimited workspaces

2. **Simpler Logic**
   - No workspace filtering in domain layer
   - No workspace checks in business logic
   - Collections work with pre-scoped data

3. **Better Performance**
   - Smaller datasets to filter/sort
   - Faster UI updates
   - Less memory usage

4. **Cleaner Architecture**
   - Clear separation of concerns
   - Domain layer stays pure
   - Workspace management isolated to service layer

5. **Supabase Ready**
   - Natural fit for RLS (Row Level Security)
   - Queries already workspace-scoped
   - Easy to add user-scoping later

## Application Lifecycle

### Initial Load
```typescript
// App.svelte or +page.svelte
onMount(async () => {
  // Load workspace list (minimal)
  const workspaces = await workspaceRepository.getAllWorkspaces();
  workspacesStore.set(workspaces);
  
  // Load current workspace data
  const activeWorkspaceId = getActiveWorkspaceId();
  await workspaceService.loadWorkspace(activeWorkspaceId);
});
```

### Workspace Switch
```typescript
async function handleWorkspaceChange(newWorkspaceId: string) {
  // Service handles all the cleanup and reloading
  await workspaceService.switchWorkspace(newWorkspaceId);
  
  // UI automatically updates via store reactivity
}
```

## What This Means for Implementation

1. **Repository Methods** - Always take workspaceId parameter
2. **Service Layer** - Manages workspace context and switching
3. **Store Layer** - Holds only current workspace data
4. **Domain Layer** - No workspace logic at all
5. **Components** - Work with pre-scoped data

## No Mixed Data

❌ **Never This:**
```typescript
const allTasks = getAllTasks();
const workspaceTasks = allTasks.filter(t => t.workspaceId === currentId);
```

✅ **Always This:**
```typescript
const workspaceTasks = getTasksByWorkspace(currentId);
```