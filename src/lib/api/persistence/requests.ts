/**
 * Request types for persistence API mutations.
 * These define the shape of data for create/update operations.
 */

// Wrapper for optional fields that can be explicitly cleared
export interface FieldUpdate<T> {
  value: T;
  clear: boolean;
}

// Helper type to create update wrappers
export type OptionalFieldUpdate<T> = T | FieldUpdate<T> | undefined;

// Helper functions for working with field updates
export function clearField<T>(): FieldUpdate<T> {
  return { value: undefined as T, clear: true };
}

export function updateField<T>(value: T): FieldUpdate<T> {
  return { value, clear: false };
}

export function getFieldValue<T>(field: OptionalFieldUpdate<T>): T | undefined {
  if (field === undefined) {
    return undefined;
  }
  if (typeof field === 'object' && field !== null && 'clear' in field) {
    return field.clear ? undefined : field.value;
  }
  return field;
}

export function shouldUpdateField<T>(field: OptionalFieldUpdate<T>): boolean {
  if (field === undefined) {
    return false; // Don't update
  }
  if (typeof field === 'object' && field !== null && 'clear' in field) {
    return true; // Always update for explicit FieldUpdate
  }
  return true; // Update for direct values
}

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
  description?: OptionalFieldUpdate<string>;
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