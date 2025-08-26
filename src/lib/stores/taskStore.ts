import { writable, derived, get } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import type { Task, Project, Area, Workspace, ViewType } from '$lib/types';
import { mockTasks, mockProjects, mockAreas, mockWorkspaces } from '$lib/data/mockData';

// Storage key for persistence
const STORAGE_KEY = 'karma-tasks';

// Core data stores with persistence
export const tasks = persisted(STORAGE_KEY + '-tasks', mockTasks);
export const projects = persisted(STORAGE_KEY + '-projects', mockProjects);
export const areas = persisted(STORAGE_KEY + '-areas', mockAreas);
export const workspaces = persisted(STORAGE_KEY + '-workspaces', mockWorkspaces);

// Current state stores
export const currentView = writable<ViewType>('first');
export const currentProjectId = writable<string | undefined>();
export const currentWorkspace = persisted(STORAGE_KEY + '-currentWorkspace', 'personal');

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
export const filteredTasks = derived(
  [tasks, currentView, currentProjectId, currentWorkspace, workspaces],
  ([$tasks, $currentView, $currentProjectId, $currentWorkspace, $workspaces]) => {
    // Filter by current workspace first (treat tasks without workspaceId as 'personal' for backward compatibility)
    let filtered = $tasks.filter(task => {
      const taskWorkspace = task.workspaceId || 'personal';
      return taskWorkspace === $currentWorkspace;
    });

    // Filter by view
    if ($currentView === 'first') {
      // First: tasks with first perspective
      filtered = filtered.filter(task => task.perspective === 'first' && !task.completed);
    } else if ($currentView === 'project') {
      // Project view: specific project tasks
      if ($currentProjectId) {
        filtered = filtered.filter(task => task.projectId === $currentProjectId);
      }
    } else {
      // Perspective view: filter by perspective
      const perspectiveId = $currentView;
      if (perspectiveId === 'inbox') {
        // Inbox: tasks without perspective assigned
        filtered = filtered.filter(task => !task.perspective && !task.completed);
      } else {
        // Other perspectives: tasks with matching perspective
        filtered = filtered.filter(task => task.perspective === perspectiveId && !task.completed);
      }
    }

    return filtered;
  }
);

// Task count derived stores for sidebar
export const firstTaskCount = derived([tasks, currentWorkspace], ([$tasks, $currentWorkspace]) => 
  $tasks.filter(task => {
    const taskWorkspace = task.workspaceId || 'personal';
    return taskWorkspace === $currentWorkspace && task.perspective === 'first' && !task.completed;
  }).length
);

export const inboxTaskCount = derived([tasks, currentWorkspace], ([$tasks, $currentWorkspace]) => {
  return $tasks.filter(task => {
    const taskWorkspace = task.workspaceId || 'personal';
    return taskWorkspace === $currentWorkspace && !task.perspective && !task.completed;
  }).length;
});

// Derived store for workspace-filtered projects (excluding default projects)
export const workspaceProjects = derived(
  [projects, workspaces, currentWorkspace],
  ([$projects, $workspaces, $currentWorkspace]) => {
    const currentWorkspaceData = $workspaces.find(w => w.id === $currentWorkspace);
    const defaultProjectId = currentWorkspaceData?.defaultProjectId;
    
    return $projects.filter(project => {
      const projectWorkspace = project.workspaceId || 'personal';
      return projectWorkspace === $currentWorkspace && project.id !== defaultProjectId;
    });
  }
);

// Default project id for the current workspace
export const workspaceDefaultProjectId = derived(
  [workspaces, currentWorkspace],
  ([$workspaces, $currentWorkspace]) => {
    return $workspaces.find(w => w.id === $currentWorkspace)?.defaultProjectId;
  }
);

// Project list for selection controls (includes the default project)
export const workspaceProjectsForSelection = derived(
  [projects, workspaces, currentWorkspace],
  ([$projects, $workspaces, $currentWorkspace]) => {
    const currentWorkspaceData = $workspaces.find(w => w.id === $currentWorkspace);
    const defaultProjectId = currentWorkspaceData?.defaultProjectId;

    const list = $projects.filter(project => {
      const projectWorkspace = project.workspaceId || 'personal';
      return projectWorkspace === $currentWorkspace;
    });

    // Sort to put default project first, keep others stable
    return list.sort((a, b) => (a.id === defaultProjectId ? -1 : b.id === defaultProjectId ? 1 : 0));
  }
);

// Derived store for current workspace perspectives
export const workspacePerspectives = derived(
  [workspaces, currentWorkspace],
  ([$workspaces, $currentWorkspace]) => {
    const currentWorkspaceData = $workspaces.find(w => w.id === $currentWorkspace);
    return currentWorkspaceData?.perspectives || [];
  }
);

// Migration function to add workspaceId to existing tasks/projects and assign default projects
export function migrateToWorkspaces() {
  // Update tasks without workspaceId to use 'personal' and assign default project if missing
  tasks.update(taskList => 
    taskList.map(task => {
      const finalWorkspaceId = task.workspaceId || 'personal';
      const finalProjectId = task.projectId || `${finalWorkspaceId}-default`;
      
      return {
        ...task,
        workspaceId: finalWorkspaceId,
        projectId: finalProjectId
      };
    })
  );
  
  // Update projects without workspaceId to use 'personal'
  projects.update(projectList =>
    projectList.map(project => ({
      ...project,
      workspaceId: project.workspaceId || 'personal'
    }))
  );
}

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

        projectId: 'client-portal',
        workspaceId: 'work',
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        id: 'work-2', 
        title: 'Weekly team standup',
        description: '',
        completed: false,

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
  
  // Reset current state
  currentView.set('first');
  currentProjectId.set(undefined);
  currentWorkspace.set('personal');
  showCompleted.set(false);
  
  // Run migrations to ensure data consistency
  migrateToWorkspaces();
  addSampleWorkspaceTasks();
}

