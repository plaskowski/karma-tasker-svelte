/**
 * API-specific types for the persistence layer.
 * These types represent the data as stored/transmitted, which may differ
 * from the domain types used in the application.
 */

// API Response wrapper types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp?: string;
    version?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Entity types as stored in the database/API
export interface WorkspaceDto {
  id: string;
  name: string;
  perspectives: PerspectiveConfigDto[];
  created_at: string; // ISO date string from API
  updated_at?: string;
}

export interface ProjectDto {
  id: string;
  workspace_id: string; // snake_case from API
  name: string;
  description?: string;
  order: number;
  is_default: boolean;
  icon?: string;
  created_at: string;
  updated_at?: string;
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
  completed_at?: string;
  due_date?: string;
  tags?: string[];
}

export interface PerspectiveConfigDto {
  id: string;
  name: string;
  icon?: string;
  order?: number;
  is_default?: boolean;
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
  description?: string;
  order?: number;
  is_default?: boolean;
  icon?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  order?: number;
  icon?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  workspace_id: string;
  project_id: string;
  perspective: string;
  due_date?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  project_id?: string;
  perspective?: string;
  completed?: boolean;
  order?: number;
  due_date?: string;
  tags?: string[];
}

// Batch operation types
export interface BatchUpdateRequest<T> {
  updates: Array<{
    id: string;
    data: T;
  }>;
}

export interface BatchDeleteRequest {
  ids: string[];
}

// Filter types for queries
export interface TaskFilter {
  workspace_id?: string;
  project_id?: string;
  perspective?: string;
  completed?: boolean;
  search?: string;
  tags?: string[];
  due_before?: string;
  due_after?: string;
}

export interface ProjectFilter {
  workspace_id?: string;
  is_default?: boolean;
}

// Sort options
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

// Query options combining filters, sorting, and pagination
export interface QueryOptions<TFilter = any> {
  filter?: TFilter;
  sort?: SortOptions[];
  page?: number;
  pageSize?: number;
}