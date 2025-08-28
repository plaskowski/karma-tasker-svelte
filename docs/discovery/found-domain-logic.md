# Business Logic Found for Domain Layer Extraction

## Overview
This document catalogs all the business logic found in the current codebase that should be moved to the domain layer according to our architecture plan.

## Task Domain Logic (`domain/task/logic.ts`)

### From `taskStore.ts`
```typescript
// Order calculation (lines 55-58)
calculateNextOrder(tasks: Task[], projectId: string): number {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const maxOrder = projectTasks.reduce((max, task) => Math.max(max, task.order || 0), 0);
  return maxOrder + 1;
}

// Task filtering by workspace (lines 120-122)
filterTasksByWorkspace(tasks: Task[], workspaceId: string): Task[] {
  return tasks.filter(task => task.workspaceId === workspaceId);
}

// Task filtering by perspective (lines 125-130)
filterTasksByPerspective(tasks: Task[], perspectiveId: string, availablePerspectives: PerspectiveConfig[]): Task[] {
  const isKnownPerspective = availablePerspectives.some(p => p.id === perspectiveId);
  const effectivePerspective = isKnownPerspective ? perspectiveId : availablePerspectives[0]?.id;
  return tasks.filter(task => task.perspective === effectivePerspective);
}

// Task filtering by project (lines 132-135)
filterTasksByProject(tasks: Task[], projectId: string): Task[] {
  return tasks.filter(task => task.projectId === projectId);
}

// Task filtering for project-all view (line 138)
filterTasksWithProject(tasks: Task[]): Task[] {
  return tasks.filter(task => task.projectId);
}

// Complex view-based filtering (lines 116-145)
filterTasksByView(
  tasks: Task[], 
  view: ViewType, 
  navigation: NavigationState,
  workspaceId: string,
  perspectives: PerspectiveConfig[]
): Task[] {
  // First filter by workspace
  let filtered = filterTasksByWorkspace(tasks, workspaceId);
  
  switch (view) {
    case 'perspective':
      return filterTasksByPerspective(filtered, navigation.currentPerspectiveId, perspectives);
    case 'project':
      return navigation.currentProjectId 
        ? filterTasksByProject(filtered, navigation.currentProjectId)
        : filtered;
    case 'project-all':
      return filterTasksWithProject(filtered);
    case 'all':
      return filtered; // No additional filtering
    default:
      return filtered;
  }
}
```

### From `taskListViewModel.ts`
```typescript
// Active/completed task separation (lines 46-47)
filterActiveTasks(tasks: Task[]): Task[] {
  return tasks.filter(t => !t.completed);
}

filterCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter(t => t.completed);
}

// Task sorting by order (line 108, 123)
sortTasksByOrder(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => a.order - b.order);
}

// Determine grouping type based on view (lines 50-61)
getGroupingTypeForView(view: ViewType): 'project' | 'perspective' | 'none' {
  switch (view) {
    case 'perspective':
    case 'all':
      return 'project';
    case 'project':
    case 'project-all':
      return 'perspective';
    default:
      return 'none';
  }
}

// Filter ungrouped tasks (line 71)
filterTasksWithoutProject(tasks: Task[]): Task[] {
  return tasks.filter(t => !t.projectId);
}
```

### From `workspaceContext.ts`
```typescript
// Task sorting by perspective then order (lines 158-165)
sortTasksByPerspectiveThenOrder(tasks: Task[], perspectives: PerspectiveConfig[]): Task[] {
  return [...tasks].sort((a, b) => {
    const perspA = a.perspective ? getPerspectiveOrder(a.perspective, perspectives) : Number.MAX_SAFE_INTEGER;
    const perspB = b.perspective ? getPerspectiveOrder(b.perspective, perspectives) : Number.MAX_SAFE_INTEGER;
    if (perspA !== perspB) return perspA - perspB;
    return a.order - b.order;
  });
}

// Task sorting by project then order (lines 167-175)
sortTasksByProjectThenOrder(tasks: Task[], projects: Project[]): Task[] {
  return [...tasks].sort((a, b) => {
    const projectA = projects.find(p => p.id === a.projectId);
    const projectB = projects.find(p => p.id === b.projectId);
    const orderA = projectA?.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = projectB?.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.order - b.order;
  });
}

// Task grouping by project (lines 178-190)
groupTasksByProject(tasks: Task[], projects: Project[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    if (task.projectId) {
      const existing = groups.get(task.projectId) || [];
      existing.push(task);
      groups.set(task.projectId, existing);
    }
  });
  
  return groups;
}

// Task grouping by perspective (lines 192-210)
groupTasksByPerspective(tasks: Task[], perspectives: PerspectiveConfig[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>();
  
  // Initialize with all perspectives
  perspectives.forEach(p => {
    groups.set(p.id, []);
  });
  
  tasks.forEach(task => {
    const perspectiveId = task.perspective || perspectives[0]?.id;
    if (perspectiveId) {
      const existing = groups.get(perspectiveId) || [];
      existing.push(task);
      groups.set(perspectiveId, existing);
    }
  });
  
  return groups;
}
```

## Project Domain Logic (`domain/project/logic.ts`)

### From `workspaceContext.ts`
```typescript
// Project sorting by order (line 82)
sortProjectsByOrder(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => a.order - b.order);
}

// Get default project (lines 85-89)
getDefaultProject(projects: Project[]): Project | undefined {
  const sorted = sortProjectsByOrder(projects);
  return sorted[0];
}

// Project validation
validateProject(projectId: string | undefined, projects: Project[]): boolean {
  return projectId ? projects.some(p => p.id === projectId) : false;
}
```

### From `taskStore.ts`
```typescript
// Filter projects by workspace (lines 159-161)
filterProjectsByWorkspace(projects: Project[], workspaceId: string): Project[] {
  return projects.filter(project => project.workspaceId === workspaceId);
}
```

## Perspective Domain Logic (`domain/perspective/logic.ts`)

### From `workspaceContext.ts`
```typescript
// Get perspective order (lines 124-127)
getPerspectiveOrder(perspectiveId: string, perspectives: PerspectiveConfig[]): number {
  const index = perspectives.findIndex(p => p.id === perspectiveId);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

// Get default perspective (line 113)
getDefaultPerspective(perspectives: PerspectiveConfig[]): PerspectiveConfig | undefined {
  return perspectives[0]; // Already ordered
}

// Validate perspective
validatePerspective(perspectiveId: string | undefined, perspectives: PerspectiveConfig[]): boolean {
  return perspectiveId ? perspectives.some(p => p.id === perspectiveId) : false;
}
```

### From `taskStore.ts`
```typescript
// Sort perspectives by order (lines 110, 151)
sortPerspectivesByOrder(perspectives: PerspectiveConfig[]): PerspectiveConfig[] {
  return perspectives.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
```

### From `workspaceContext.ts`
```typescript
// Get effective perspective ID based on navigation (lines 148-155)
getEffectivePerspectiveId(
  navigation: { currentView: string; currentPerspectiveId?: string },
  perspectives: PerspectiveConfig[]
): string {
  if (navigation.currentView === 'perspective' && navigation.currentPerspectiveId) {
    return navigation.currentPerspectiveId;
  }
  return getDefaultPerspective(perspectives)?.id || '';
}

// Get effective project ID based on navigation (lines 139-146)
getEffectiveProjectId(
  navigation: { currentView: string; currentProjectId?: string },
  projects: Project[]
): string {
  if (navigation.currentView === 'project' && navigation.currentProjectId) {
    return navigation.currentProjectId;
  }
  return getDefaultProject(projects)?.id || '';
}
```

## Workspace Domain Logic (`domain/workspace/logic.ts`)

### From `taskStore.ts`
```typescript
// Get workspace perspectives ordered (lines 106-112)
getWorkspacePerspectivesOrdered(workspace: Workspace): PerspectiveConfig[] {
  return sortPerspectivesByOrder(workspace.perspectives || []);
}

// Get first perspective for workspace (lines 149-152)
getFirstPerspectiveId(workspace: Workspace): string | undefined {
  const ordered = getWorkspacePerspectivesOrdered(workspace);
  return ordered[0]?.id;
}
```

## View Domain Logic (`domain/view/logic.ts`)

### From `taskListViewModel.ts`
```typescript
// Get view title (lines 151-157)
getViewTitle(
  view: ViewType,
  currentProject?: Project,
  currentPerspective?: PerspectiveConfig
): string {
  switch (view) {
    case 'all': return 'All';
    case 'project-all': return 'All Projects';
    case 'project': return currentProject?.name || 'Project';
    case 'perspective': return currentPerspective?.name || 'Tasks';
    default: return 'Tasks';
  }
}

// Determine if badges should be shown (lines 192-206)
shouldShowProjectBadge(view: ViewType, groupingType: string): boolean {
  return groupingType !== 'project' && view !== 'project';
}

shouldShowPerspectiveBadge(view: ViewType, groupingType: string): boolean {
  return groupingType !== 'perspective' && view !== 'perspective';
}
```

## Summary of Business Rules to Extract

### Task Business Rules
1. **Order Calculation**: Next order is max order in project + 1
2. **Filtering**: By workspace, perspective, project, completion status
3. **Sorting**: By order, by perspective then order, by project then order
4. **Grouping**: By project or perspective
5. **Active/Completed**: Tasks without completed flag are active

### Project Business Rules
1. **Ordering**: Projects have numeric order field
2. **Default**: First project by order is default
3. **Filtering**: By workspace

### Perspective Business Rules  
1. **Ordering**: Perspectives have order field
2. **Default**: First perspective is default
3. **Effective ID**: Based on current view context

### Workspace Business Rules
1. **Perspectives**: Workspaces contain ordered perspectives
2. **Projects**: Workspaces contain projects

### View Business Rules
1. **Grouping Strategy**: Different views group differently
2. **Badge Display**: Show badges based on grouping strategy
3. **Title Generation**: Each view has specific title logic

## Migration Priority

1. **High Priority** (Core business logic):
   - Task order calculation
   - Task filtering functions
   - Task sorting functions
   - Task grouping functions

2. **Medium Priority** (View logic):
   - View-based grouping determination
   - Badge display rules
   - Title generation

3. **Low Priority** (Simple accessors):
   - Get default project/perspective
   - Simple validation functions