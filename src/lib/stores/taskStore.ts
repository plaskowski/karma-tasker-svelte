import { writable, derived, get } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import type { Task, Project, Workspace, ViewType } from '$lib/types';
import { mockTasks, mockProjects, mockWorkspaces } from '$lib/data/mockData';

// Storage key for persistence
const STORAGE_KEY = 'karma-tasks';

// Core data stores with persistence
export const tasks = persisted(STORAGE_KEY + '-tasks', mockTasks);
export const projects = persisted(STORAGE_KEY + '-projects', mockProjects);
export const workspaces = persisted(STORAGE_KEY + '-workspaces', mockWorkspaces);

// Current state stores
// Default to perspective view; will be set on mount based on workspace config
export const currentView = writable<ViewType>('perspective');
export const currentPerspectiveId = writable<string>('inbox');
export const currentProjectId = writable<string | undefined>();
// Use first workspace as default
if (!mockWorkspaces[0]?.id) {
  throw new Error('No workspaces defined. At least one workspace is required.');
}
export const currentWorkspace = persisted(STORAGE_KEY + '-currentWorkspace', mockWorkspaces[0].id);

export const showCompleted = writable(false);

// Mock API functions with realistic delays
export async function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate occasional failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Network error');
  }

  const newTask: Task = {
    ...taskData,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tasks.update(taskList => [...taskList, newTask]);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  tasks.update(taskList => 
    taskList.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    )
  );

  const updatedTask = get(tasks).find(t => t.id === id)!;
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  tasks.update(taskList => taskList.filter(task => task.id !== id));
}



export async function toggleTaskComplete(id: string): Promise<void> {
  const task = get(tasks).find(t => t.id === id);
  if (task) {
    await updateTask(id, { completed: !task.completed });
  }
}

// Derived store for filtered tasks
export const workspacePerspectivesOrdered = derived(
  [workspaces, currentWorkspace],
  ([$workspaces, $currentWorkspace]) => {
    const ws = $workspaces.find(w => w.id === $currentWorkspace);
    return (ws?.perspectives || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
);

export const filteredTasks = derived(
  [tasks, currentView, currentPerspectiveId, currentProjectId, currentWorkspace, workspacePerspectivesOrdered],
  ([$tasks, $currentView, $currentPerspectiveId, $currentProjectId, $currentWorkspace, $workspacePerspectivesOrdered]) => {
    // Filter by current workspace first
    let filtered = $tasks.filter(task => {
      return task.workspaceId === $currentWorkspace;
    });

    // Filter by view
    if ($currentView === 'perspective') {
      // Perspective view: filter by perspective id
      const perspectiveId = $currentPerspectiveId;
      const isKnownPerspective = $workspacePerspectivesOrdered.some(p => p.id === perspectiveId);
      const effectivePerspective = isKnownPerspective ? perspectiveId : $workspacePerspectivesOrdered[0]?.id;
      filtered = filtered.filter(task => task.perspective === effectivePerspective && !task.completed);
    } else if ($currentView === 'project') {
      // Project view: specific project tasks
      if ($currentProjectId) {
        filtered = filtered.filter(task => task.projectId === $currentProjectId);
      }
    } else if ($currentView === 'project-all') {
      // Project All view: all tasks in workspace (excluding those without projects)
      filtered = filtered.filter(task => task.projectId);
    } else if ($currentView === 'all') {
      // All view: keep all tasks for current workspace (both active and completed)
      // No additional filtering
    }

    return filtered;
  }
);

// First perspective id (default) for the current workspace
export const firstPerspectiveId = derived([workspaces, currentWorkspace], ([$workspaces, $currentWorkspace]) => {
  const ws = $workspaces.find(w => w.id === $currentWorkspace);
  return ws?.perspectives?.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.id;
});


// Derived store for workspace-filtered projects
export const workspaceProjects = derived(
  [projects, currentWorkspace],
  ([$projects, $currentWorkspace]) => {
    return $projects.filter(project => {
      return project.workspaceId === $currentWorkspace;
    });
  }
);

// Default project id for the current workspace
// NOTE: Use the first project from workspace where needed.

// Derived store for current workspace perspectives (unordered)
export const workspacePerspectives = derived(
  [workspaces, currentWorkspace],
  ([$workspaces, $currentWorkspace]) => {
    const currentWorkspaceData = $workspaces.find(w => w.id === $currentWorkspace);
    return currentWorkspaceData?.perspectives || [];
  }
);


// Function to add sample tasks to Work and Hobby workspaces (for demo purposes)
export function addSampleWorkspaceTasks() {
  const currentTasks = get(tasks);
  
  // Check if Work/Hobby workspaces already have tasks
  const hasWorkTasks = currentTasks.some(task => task.workspaceId === 'work');
  const hasHobbyTasks = currentTasks.some(task => task.workspaceId === 'hobby');
  
  const sampleTasks: Task[] = [];
  
  if (!hasWorkTasks) {
    sampleTasks.push(
      {
        id: 'work-1',
        title: 'Design user dashboard mockups',
        description: '',
        completed: false,

        perspective: 'first',
        projectId: 'client-portal',
        workspaceId: 'work',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'work-2', 
        title: 'Weekly team standup',
        description: '',
        completed: false,

        perspective: 'inbox',
        projectId: 'meetings',
        workspaceId: 'work',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'work-3',
        title: 'Refactor authentication endpoints',
        description: '',
        completed: false,

        perspective: 'next',
        projectId: 'api-redesign',
        workspaceId: 'work',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'work-4',
        title: 'Update API documentation',
        description: '',
        completed: false,

        perspective: 'next',
        projectId: 'api-redesign',
        workspaceId: 'work',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  }
  
  if (!hasHobbyTasks) {
    sampleTasks.push(
      {
        id: 'hobby-1',
        title: 'Photography workshop signup',
        description: '',
        completed: false,

        perspective: 'inbox',
        projectId: 'photography',
        workspaceId: 'hobby',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'hobby-2',
        title: 'Arduino project - LED matrix',
        description: '',
        completed: false,

        perspective: 'ideas',
        projectId: 'electronics',
        workspaceId: 'hobby',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'hobby-3',
        title: 'Practice guitar scales',
        description: '',
        completed: false,

        perspective: 'ideas',
        projectId: 'music',
        workspaceId: 'hobby',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
  }
  
  if (sampleTasks.length > 0) {
    tasks.update(taskList => [...taskList, ...sampleTasks]);
  }
}

// Function to reset app to initial state (temporary for development)
export function resetToInitialState() {
  // Reset all stores to initial mock data
  tasks.set(mockTasks);
  projects.set(mockProjects);
  workspaces.set(mockWorkspaces);
  
  // Reset current state to first workspace
  if (!mockWorkspaces[0]?.id) {
    throw new Error('No workspaces defined. At least one workspace is required.');
  }
  currentWorkspace.set(mockWorkspaces[0].id);
  const ws = mockWorkspaces[0];
  const firstPerspective = ws.perspectives?.[0];
  if (firstPerspective) {
    currentView.set('perspective');
    currentPerspectiveId.set(firstPerspective.id);
  }
  currentProjectId.set(undefined);
  showCompleted.set(false);
  
  // Add sample tasks for other workspaces
  addSampleWorkspaceTasks();
}

