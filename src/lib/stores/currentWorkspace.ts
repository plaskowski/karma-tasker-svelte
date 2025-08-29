import { persisted } from 'svelte-persisted-store';
import { get } from 'svelte/store';
import { mockWorkspaces } from '$lib/data/mockData';

// Storage key for persistence
const STORAGE_KEY = 'karma-tasks';

// Use first workspace as default
if (!mockWorkspaces[0]?.id) {
  throw new Error('No workspaces defined. At least one workspace is required.');
}

// Current workspace ID store
export const currentWorkspaceId = persisted(STORAGE_KEY + '-currentWorkspace', mockWorkspaces[0].id);

/**
 * Function to change the current workspace
 */
export function setCurrentWorkspace(workspaceId: string) {
  currentWorkspaceId.set(workspaceId);
}

/**
 * Function to get the current workspace ID (for cases where immediate value is needed)
 */
export function getCurrentWorkspaceId(): string {
  return get(currentWorkspaceId);
}