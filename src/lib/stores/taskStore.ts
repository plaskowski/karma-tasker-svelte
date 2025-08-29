// ARCHITECTURE MIGRATION: This file needs to be split into multiple parts:
// - Stores (stays here but simplified): Just state containers
// - Services (lib/services/): Business logic for tasks, projects, workspaces
// - Repositories (lib/server/repositories/): Data persistence layer
// - Domain logic (lib/domain/): Business rules and validations

import { writable } from 'svelte/store';
import type { Task } from '$lib/types';
import { db } from '$lib/api/persistence/localStorageAdapter';
import { toDomainTask } from '$lib/api/persistence/mappers';

// MIGRATION: These stores are deprecated - data should be loaded via +page.ts
// Only keeping them temporarily for backward compatibility with existing code
// TODO: Remove these once all components use data from load function

// MIGRATION: UI state stores - these can stay here or move to lib/stores/uiStore.ts
export const showCompleted = writable(false);

// MIGRATION: These functions should move to lib/services/taskService.ts
// The service will handle business logic and call the repository for persistence
// Mock API functions with realistic delays
export async function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Promise<Task> {
  // Use workspace-scoped API
  const wsApi = db.forWorkspace(taskData.workspaceId);
  const taskDto = await wsApi.createTask({
    title: taskData.title,
    description: taskData.description || undefined,
    project_id: taskData.projectId,
    perspective: taskData.perspective
  });
  
  return toDomainTask(taskDto, taskData.workspaceId);
}

// MIGRATION: Move to lib/services/taskService.ts
export async function updateTask(id: string, updates: Partial<Task>, workspaceId: string): Promise<Task> {
  // Map domain updates to DTO format
  const updateRequest: any = {};
  if (updates.title !== undefined) updateRequest.title = updates.title;
  if (updates.description !== undefined) updateRequest.description = updates.description;
  if (updates.projectId !== undefined) updateRequest.project_id = updates.projectId;
  if (updates.perspective !== undefined) updateRequest.perspective = updates.perspective;
  if (updates.completed !== undefined) updateRequest.completed = updates.completed;
  if (updates.order !== undefined) updateRequest.order = updates.order;
  
  const wsApi = db.forWorkspace(workspaceId);
  const taskDto = await wsApi.updateTask(id, updateRequest);
  return toDomainTask(taskDto, workspaceId);
}

// MIGRATION: Move to lib/services/taskService.ts
export async function deleteTask(id: string, workspaceId: string): Promise<void> {
  const wsApi = db.forWorkspace(workspaceId);
  await wsApi.deleteTask(id);
}


// MIGRATION: Move to lib/services/taskService.ts
export async function toggleTaskComplete(id: string, workspaceId: string): Promise<void> {
  // Get the current task state from the database
  const wsApi = db.forWorkspace(workspaceId);
  const taskDto = await wsApi.getTask(id);
  if (taskDto) {
    await wsApi.updateTask(id, { completed: !taskDto.completed });
  }
}

// MIGRATION: Workspace-specific filtering and derived stores moved to +page.ts load function
// Data is now loaded and filtered based on URL parameters



// MIGRATION: This function should move to a development utility service
// lib/services/devService.ts or lib/utils/dev.ts
// Function to reset app to initial state (temporary for development)
export function resetToInitialState() {
  // Clear all localStorage keys with karma-tasks prefix
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('karma-tasks-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Force reload to refresh the UI
    window.location.reload();
  }
}

