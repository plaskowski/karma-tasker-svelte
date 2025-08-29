// ARCHITECTURE MIGRATION: This file needs to be split into multiple parts:
// - Stores (stays here but simplified): Just state containers
// - Services (lib/services/): Business logic for tasks, projects, workspaces
// - Repositories (lib/server/repositories/): Data persistence layer
// - Domain logic (lib/domain/): Business rules and validations

import { writable, derived, get } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';
import type { Task, Project, Workspace } from '$lib/types';
import { mockTasks, mockProjects, mockWorkspaces } from '$lib/data/mockData';
import { currentWorkspaceId } from './currentWorkspace';

// Storage key for persistence
const STORAGE_KEY = 'karma-tasks';

// MIGRATION: These persisted stores should move to repositories
// lib/server/repositories/taskRepository.ts
// lib/server/repositories/projectRepository.ts
// lib/server/repositories/workspaceRepository.ts
// Core data stores with persistence
export const tasks = persisted(STORAGE_KEY + '-tasks', mockTasks);
export const projects = persisted(STORAGE_KEY + '-projects', mockProjects);
export const workspaces = persisted(STORAGE_KEY + '-workspaces', mockWorkspaces);

// MIGRATION: UI state stores - these can stay here or move to lib/stores/uiStore.ts
export const showCompleted = writable(false);

// MIGRATION: These functions should move to lib/services/taskService.ts
// The service will handle business logic and call the repository for persistence
// Mock API functions with realistic delays
export async function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<Task> {
  // MIGRATION: Delay simulation moves to repository layer
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate occasional failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Network error');
  }

  // MIGRATION: Order calculation logic moves to lib/domain/task/logic.ts
  // Calculate the next order value for this project
  const currentTasks = get(tasks);
  const projectTasks = currentTasks.filter(t => t.projectId === taskData.projectId);
  const maxOrder = projectTasks.reduce((max, task) => Math.max(max, task.order || 0), 0);

  const newTask: Task = {
    ...taskData,
    id: crypto.randomUUID(),
    order: maxOrder + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tasks.update(taskList => [...taskList, newTask]);
  return newTask;
}

// MIGRATION: Move to lib/services/taskService.ts
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

// MIGRATION: Move to lib/services/taskService.ts
export async function deleteTask(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  tasks.update(taskList => taskList.filter(task => task.id !== id));
}


// MIGRATION: Move to lib/services/taskService.ts
export async function toggleTaskComplete(id: string): Promise<void> {
  const task = get(tasks).find(t => t.id === id);
  if (task) {
    await updateTask(id, { completed: !task.completed });
  }
}

// MIGRATION: Derived stores stay here but filtering logic could move to lib/domain/task/logic.ts
// Derived store for filtered tasks
export const workspacePerspectivesOrdered = derived(
  [workspaces, currentWorkspaceId],
  ([$workspaces, $currentWorkspaceId]) => {
    const ws = $workspaces.find(w => w.id === $currentWorkspaceId);
    return (ws?.perspectives || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
);

// MIGRATION: Filtering logic moved to +page.ts load function
// Tasks are now filtered server-side based on URL parameters

// First perspective id (default) for the current workspace
export const firstPerspectiveId = derived([workspaces, currentWorkspaceId], ([$workspaces, $currentWorkspaceId]) => {
  const ws = $workspaces.find(w => w.id === $currentWorkspaceId);
  return ws?.perspectives?.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.id;
});


// Derived store for workspace-filtered projects (sorted by order)
export const workspaceProjects = derived(
  [projects, currentWorkspaceId],
  ([$projects, $currentWorkspaceId]) => {
    return $projects
      .filter(project => project.workspaceId === $currentWorkspaceId)
      .sort((a, b) => a.order - b.order);
  }
);

// Default project id for the current workspace
// NOTE: Use the first project from workspace where needed.

// Derived store for current workspace perspectives (unordered)
export const workspacePerspectives = derived(
  [workspaces, currentWorkspaceId],
  ([$workspaces, $currentWorkspaceId]) => {
    const currentWorkspaceData = $workspaces.find(w => w.id === $currentWorkspaceId);
    return currentWorkspaceData?.perspectives || [];
  }
);



// MIGRATION: This function should move to a development utility service
// lib/services/devService.ts or lib/utils/dev.ts
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
  currentWorkspaceId.set(mockWorkspaces[0].id);
  showCompleted.set(false);
}

