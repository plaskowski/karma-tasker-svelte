/**
 * Request types for persistence API mutations.
 * These define the shape of data for create/update operations.
 */

import type { FieldUpdate } from './fieldUpdates';

// Workspace requests
export interface CreateWorkspaceRequest {
  name: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
}

// Perspective requests
export interface CreatePerspectiveRequest {
  name: string;
  icon: string;
  order: number;
}

export interface UpdatePerspectiveRequest {
  name?: string;
  icon?: string;
  order?: number;
}

// Project requests
export interface CreateProjectRequest {
  name: string;
  order: number;
  icon: string;
}

export interface UpdateProjectRequest {
  name?: string;
  order?: number;
  icon?: string;
}

// Task requests
export interface CreateTaskRequest {
  title: string;
  description?: string;
  project_id: string;
  perspective: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: FieldUpdate<string>;
  project_id?: string;
  perspective?: string;
  completed?: boolean;
  order?: number;
}

// Filter types
export interface TaskFilter {
  project_id?: string;
  perspective?: string;
  completed?: boolean;
  search?: string; // For text search in title/description
}