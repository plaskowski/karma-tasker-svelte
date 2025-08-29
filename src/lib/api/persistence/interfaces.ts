import type { 
  WorkspaceDto, 
  ProjectDto, 
  TaskDto,
  PerspectiveDto
} from './dto';

import type {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreatePerspectiveRequest,
  UpdatePerspectiveRequest,
  TaskFilter
} from './requests';

/**
 * Top-level persistence API for workspace management.
 * This interface handles workspace-level operations and provides
 * access to workspace-scoped operations.
 */
export interface WorkspaceAPI {
  // Workspace management
  getWorkspaces(): Promise<WorkspaceDto[]>;
  getWorkspace(id: string): Promise<WorkspaceDto | null>;
  createWorkspace(request: CreateWorkspaceRequest): Promise<WorkspaceDto>;
  updateWorkspace(id: string, request: UpdateWorkspaceRequest): Promise<WorkspaceDto>;
  deleteWorkspace(id: string): Promise<void>;
  
  // Get workspace-scoped API for a specific workspace
  forWorkspace(workspaceId: string): WorkspaceScopedAPI;
}

/**
 * Workspace-scoped persistence API.
 * All operations in this interface are scoped to a specific workspace.
 * Projects, tasks, and perspectives can only be accessed through this interface.
 */
export interface WorkspaceScopedAPI {
  // The workspace this API is scoped to
  readonly workspaceId: string;
  
  // Perspective operations within this workspace
  getPerspectives(): Promise<PerspectiveDto[]>;
  getPerspective(perspectiveId: string): Promise<PerspectiveDto | null>;
  createPerspective(request: CreatePerspectiveRequest): Promise<PerspectiveDto>;
  updatePerspective(perspectiveId: string, request: UpdatePerspectiveRequest): Promise<PerspectiveDto>;
  deletePerspective(perspectiveId: string): Promise<void>;
  
  // Project operations within this workspace
  getProjects(): Promise<ProjectDto[]>;
  getProject(projectId: string): Promise<ProjectDto | null>;
  createProject(request: CreateProjectRequest): Promise<ProjectDto>;
  updateProject(projectId: string, request: UpdateProjectRequest): Promise<ProjectDto>;
  deleteProject(projectId: string): Promise<void>;

  // Task operations within this workspace
  getTasks(filter?: TaskFilter): Promise<TaskDto[]>;
  getTask(taskId: string): Promise<TaskDto | null>;
  createTask(request: CreateTaskRequest): Promise<TaskDto>;
  updateTask(taskId: string, request: UpdateTaskRequest): Promise<TaskDto>;
  deleteTask(taskId: string): Promise<void>;
}

/**
 * Configuration for persistence adapters
 */
export interface PersistenceConfig {
  /** Storage key prefix for localStorage adapter */
  storagePrefix?: string;
}