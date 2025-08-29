import type { Task, Project, Workspace, PerspectiveConfig } from '$lib/types';
import type { 
  TaskDto, 
  ProjectDto, 
  WorkspaceDto, 
  PerspectiveConfigDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest
} from './types';

/**
 * Mappers to convert between API DTOs and domain models.
 * This layer handles all data transformation concerns.
 */

// ===== To Domain =====

export function toDomainWorkspace(dto: WorkspaceDto): Workspace {
  return {
    id: dto.id,
    name: dto.name,
    perspectives: dto.perspectives.map(toDomainPerspective),
    createdAt: new Date(dto.created_at)
  };
}

export function toDomainProject(dto: ProjectDto): Project {
  return {
    id: dto.id,
    workspaceId: dto.workspace_id, // Convert snake_case to camelCase
    name: dto.name,
    icon: dto.icon,
    order: dto.order,
    createdAt: new Date(dto.created_at)
  };
}

export function toDomainTask(dto: TaskDto): Task {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    workspaceId: dto.workspace_id,
    projectId: dto.project_id,
    perspective: dto.perspective,
    completed: dto.completed,
    order: dto.order,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at)
  };
}

export function toDomainPerspective(dto: PerspectiveConfigDto): PerspectiveConfig {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon || 'inbox', // Provide default icon if not present
    order: dto.order || 0 // Provide default order if not present
  };
}

// ===== To DTO =====

export function toWorkspaceDto(workspace: Workspace): WorkspaceDto {
  return {
    id: workspace.id,
    name: workspace.name,
    perspectives: workspace.perspectives.map(toPerspectiveDto),
    created_at: workspace.createdAt.toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id,
    workspace_id: project.workspaceId,
    name: project.name,
    description: undefined,
    order: project.order,
    is_default: false,
    icon: project.icon,
    created_at: project.createdAt.toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function toTaskDto(task: Task): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    workspace_id: task.workspaceId,
    project_id: task.projectId,
    perspective: task.perspective,
    completed: task.completed,
    order: task.order,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
    completed_at: task.completed ? new Date().toISOString() : undefined
  };
}

export function toPerspectiveDto(perspective: PerspectiveConfig): PerspectiveConfigDto {
  return {
    id: perspective.id,
    name: perspective.name,
    icon: perspective.icon,
    order: perspective.order
  };
}

// ===== Request Builders =====

export function toCreateWorkspaceRequest(
  workspace: Omit<Workspace, 'id' | 'createdAt'>
): CreateWorkspaceRequest {
  return {
    name: workspace.name,
    perspectives: workspace.perspectives.map(p => ({
      name: p.name,
      icon: p.icon,
      order: p.order
    }))
  };
}

export function toUpdateWorkspaceRequest(
  updates: Partial<Workspace>
): UpdateWorkspaceRequest {
  return {
    name: updates.name,
    perspectives: updates.perspectives?.map(toPerspectiveDto)
  };
}

export function toCreateProjectRequest(
  project: Omit<Project, 'id'>
): CreateProjectRequest {
  return {
    workspace_id: project.workspaceId,
    name: project.name,
    description: undefined,
    order: project.order,
    is_default: false,
    icon: project.icon
  };
}

export function toUpdateProjectRequest(
  updates: Partial<Project>
): UpdateProjectRequest {
  return {
    name: updates.name,
    description: undefined,
    order: updates.order,
    icon: updates.icon
  };
}

export function toCreateTaskRequest(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>
): CreateTaskRequest {
  return {
    title: task.title,
    description: task.description,
    workspace_id: task.workspaceId,
    project_id: task.projectId,
    perspective: task.perspective
  };
}

export function toUpdateTaskRequest(
  updates: Partial<Task>
): UpdateTaskRequest {
  return {
    title: updates.title,
    description: updates.description,
    project_id: updates.projectId,
    perspective: updates.perspective,
    completed: updates.completed,
    order: updates.order
  };
}

// ===== Batch Operations =====

export function toDomainWorkspaces(dtos: WorkspaceDto[]): Workspace[] {
  return dtos.map(toDomainWorkspace);
}

export function toDomainProjects(dtos: ProjectDto[]): Project[] {
  return dtos.map(toDomainProject);
}

export function toDomainTasks(dtos: TaskDto[]): Task[] {
  return dtos.map(toDomainTask);
}

export function toWorkspaceDtos(workspaces: Workspace[]): WorkspaceDto[] {
  return workspaces.map(toWorkspaceDto);
}

export function toProjectDtos(projects: Project[]): ProjectDto[] {
  return projects.map(toProjectDto);
}

export function toTaskDtos(tasks: Task[]): TaskDto[] {
  return tasks.map(toTaskDto);
}