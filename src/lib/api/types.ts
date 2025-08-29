/**
 * API-specific types for the persistence layer.
 * These types represent the data as stored/transmitted, which may differ
 * from the domain types used in the application.
 */

// Entity types as stored in the database/API
export interface WorkspaceDto {
  id: string;
  name: string;
  perspectives: PerspectiveConfigDto[];
  created_at: string; // ISO date string from API
}

export interface ProjectDto {
  id: string;
  workspace_id: string; // snake_case from API
  name: string;
  order: number;
  icon?: string;
  created_at: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  workspace_id: string;
  project_id: string;
  perspective: string;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface PerspectiveConfigDto {
  id: string;
  name: string;
  icon?: string;
  order?: number;
}

// Request types for mutations
export interface CreateWorkspaceRequest {
  name: string;
  perspectives?: Omit<PerspectiveConfigDto, 'id'>[];
}

export interface UpdateWorkspaceRequest {
  name?: string;
  perspectives?: PerspectiveConfigDto[];
}

export interface CreateProjectRequest {
  workspace_id: string;
  name: string;
  order?: number;
  icon?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  order?: number;
  icon?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  workspace_id: string;
  project_id: string;
  perspective: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  project_id?: string;
  perspective?: string;
  completed?: boolean;
  order?: number;
}

// Filter types for queries
export interface TaskFilter {
  workspace_id?: string;
  project_id?: string;
  perspective?: string;
  completed?: boolean;
  search?: string; // For text search in title/description
}

export interface ProjectFilter {
  workspace_id?: string;
}

// Sort options
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

// Query options combining filters and sorting
export interface QueryOptions<TFilter = any> {
  filter?: TFilter;
  sort?: SortOptions[];
}