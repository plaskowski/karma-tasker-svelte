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
export const currentView = writable<ViewType>('focus');
export const currentProjectId = writable<string | undefined>();
export const currentWorkspace = persisted(STORAGE_KEY + '-currentWorkspace', 'personal');
export const searchQuery = writable('');

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

export async function toggleTaskStar(id: string): Promise<void> {
  const task = get(tasks).find(t => t.id === id);
  if (task) {
    await updateTask(id, { starred: !task.starred });
  }
}

export async function toggleTaskComplete(id: string): Promise<void> {
  const task = get(tasks).find(t => t.id === id);
  if (task) {
    await updateTask(id, { completed: !task.completed });
  }
}

// Derived store for filtered tasks
export const filteredTasks = derived(
  [tasks, currentView, currentProjectId, currentWorkspace, searchQuery],
  ([$tasks, $currentView, $currentProjectId, $currentWorkspace, $searchQuery]) => {
    // Filter by current workspace first (treat tasks without workspaceId as 'personal' for backward compatibility)
    let filtered = $tasks.filter(task => {
      const taskWorkspace = task.workspaceId || 'personal';
      return taskWorkspace === $currentWorkspace;
    });

    // Filter by view
    switch ($currentView) {
      case 'inbox':
        filtered = filtered.filter(task => !task.projectId && !task.completed);
        break;
      case 'next':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'focus':
        filtered = filtered.filter(task => task.starred && !task.completed);
        break;
      case 'project':
        if ($currentProjectId) {
          filtered = filtered.filter(task => task.projectId === $currentProjectId);
        }
        break;
      case 'waiting':
        filtered = filtered.filter(task => !task.completed && !task.starred && !task.dueDate);
        break;
      case 'scheduled':
        filtered = filtered.filter(task => !task.completed && task.dueDate);
        break;
      case 'someday':
        filtered = filtered.filter(task => !task.completed && !task.starred && !task.dueDate);
        break;
    }

    // Filter by search
    if ($searchQuery) {
      const query = $searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }
);

// Task count derived stores for sidebar
export const focusTaskCount = derived([tasks, currentWorkspace], ([$tasks, $currentWorkspace]) => 
  $tasks.filter(task => {
    const taskWorkspace = task.workspaceId || 'personal';
    return taskWorkspace === $currentWorkspace && task.starred && !task.completed;
  }).length
);

export const inboxTaskCount = derived([tasks, currentWorkspace], ([$tasks, $currentWorkspace]) => 
  $tasks.filter(task => {
    const taskWorkspace = task.workspaceId || 'personal';
    return taskWorkspace === $currentWorkspace && !task.projectId && !task.completed;
  }).length
);

// Derived store for workspace-filtered projects
export const workspaceProjects = derived(
  [projects, currentWorkspace],
  ([$projects, $currentWorkspace]) => $projects.filter(project => {
    const projectWorkspace = project.workspaceId || 'personal';
    return projectWorkspace === $currentWorkspace;
  })
);

// Migration function to add workspaceId to existing tasks/projects
export function migrateToWorkspaces() {
  // Update tasks without workspaceId to use 'personal'
  tasks.update(taskList => 
    taskList.map(task => ({
      ...task,
      workspaceId: task.workspaceId || 'personal'
    }))
  );
  
  // Update projects without workspaceId to use 'personal'
  projects.update(projectList =>
    projectList.map(project => ({
      ...project,
      workspaceId: project.workspaceId || 'personal'
    }))
  );
}

