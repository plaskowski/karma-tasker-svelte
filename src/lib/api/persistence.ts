import type { 
  WorkspaceDto, 
  ProjectDto, 
  TaskDto,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
  ProjectFilter,
  QueryOptions
} from './types';

/**
 * Persistence API interface for all database operations.
 * This abstraction allows us to switch between different storage backends
 * (localStorage, IndexedDB, REST API, etc.) without changing the application code.
 * 
 * All methods work with DTO types, not domain types. The application layer
 * is responsible for mapping between DTOs and domain models.
 */
export interface PersistenceAPI {
  // Workspace operations
  getWorkspaces(): Promise<WorkspaceDto[]>;
  getWorkspace(id: string): Promise<WorkspaceDto | null>;
  createWorkspace(request: CreateWorkspaceRequest): Promise<WorkspaceDto>;
  updateWorkspace(id: string, request: UpdateWorkspaceRequest): Promise<WorkspaceDto>;
  deleteWorkspace(id: string): Promise<void>;

  // Project operations
  getProjects(options?: QueryOptions<ProjectFilter>): Promise<ProjectDto[]>;
  getProjectsByWorkspace(workspaceId: string): Promise<ProjectDto[]>;
  getProject(id: string): Promise<ProjectDto | null>;
  createProject(request: CreateProjectRequest): Promise<ProjectDto>;
  updateProject(id: string, request: UpdateProjectRequest): Promise<ProjectDto>;
  deleteProject(id: string): Promise<void>;

  // Task operations
  getTasks(options?: QueryOptions<TaskFilter>): Promise<TaskDto[]>;
  getTasksByWorkspace(workspaceId: string): Promise<TaskDto[]>;
  getTask(id: string): Promise<TaskDto | null>;
  createTask(request: CreateTaskRequest): Promise<TaskDto>;
  updateTask(id: string, request: UpdateTaskRequest): Promise<TaskDto>;
  deleteTask(id: string): Promise<void>;
}

/**
 * Configuration for persistence adapters
 */
export interface PersistenceConfig {
  /** Storage key prefix for localStorage adapter */
  storagePrefix?: string;
}