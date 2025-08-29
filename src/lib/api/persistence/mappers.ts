import type { Task, Project, Workspace, PerspectiveConfig } from '$lib/types';
import type { 
  TaskDto, 
  ProjectDto, 
  WorkspaceDto, 
  PerspectiveDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest
} from './index';

/**
 * Mappers to convert between API DTOs and domain models.
 * This layer handles all data transformation concerns.
 */

// ===== To Domain =====

export function toDomainWorkspace(dto: WorkspaceDto, perspectives: PerspectiveConfig[]): Workspace {
  return {
    id: dto.id,
    name: dto.name,
    perspectives,
    createdAt: new Date(dto.created_at)
  };
}

export function toDomainProject(dto: ProjectDto, workspaceId: string): Project {
  return {
    id: dto.id,
    workspaceId,
    name: dto.name,
    icon: dto.icon,
    order: dto.order,
    createdAt: new Date(dto.created_at)
  };
}

export function toDomainTask(dto: TaskDto, workspaceId: string): Task {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    workspaceId,
    projectId: dto.project_id,
    perspective: dto.perspective,
    completed: dto.completed,
    order: dto.order,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at)
  };
}

export function toDomainPerspective(dto: PerspectiveDto): PerspectiveConfig {
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
    created_at: workspace.createdAt.toISOString()
  };
}

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    order: project.order,
    icon: project.icon,
    created_at: project.createdAt.toISOString()
  };
}

export function toTaskDto(task: Task): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    project_id: task.projectId,
    perspective: task.perspective,
    completed: task.completed,
    order: task.order,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString()
  };
}

export function toPerspectiveDto(perspective: PerspectiveConfig): PerspectiveDto {
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
    name: workspace.name
  };
}

export function toUpdateWorkspaceRequest(
  updates: Partial<Workspace>
): UpdateWorkspaceRequest {
  return {
    name: updates.name
  };
}

export function toCreateProjectRequest(
  project: Omit<Project, 'id' | 'workspaceId'>
): CreateProjectRequest {
  return {
    name: project.name,
    order: project.order,
    icon: project.icon
  };
}

export function toUpdateProjectRequest(
  updates: Partial<Project>
): UpdateProjectRequest {
  return {
    name: updates.name,
    order: updates.order,
    icon: updates.icon
  };
}

export function toCreateTaskRequest(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'workspaceId'>
): CreateTaskRequest {
  return {
    title: task.title,
    description: task.description,
    project_id: task.projectId,
    perspective: task.perspective
  };
}

export function toUpdateTaskRequest(
  updates: Partial<Task>
): UpdateTaskRequest {
  return {
    title: updates.title,
    description: updates.description, // For now, keep simple - can be enhanced later with clearField()
    project_id: updates.projectId,
    perspective: updates.perspective,
    completed: updates.completed,
    order: updates.order
  };
}

// ===== Batch Operations =====

export function toDomainWorkspaces(dtos: WorkspaceDto[], perspectivesMap: Map<string, PerspectiveConfig[]>): Workspace[] {
  return dtos.map(dto => toDomainWorkspace(dto, perspectivesMap.get(dto.id) || []));
}

export function toDomainProjects(dtos: ProjectDto[], workspaceId: string): Project[] {
  return dtos.map(dto => toDomainProject(dto, workspaceId));
}

export function toDomainTasks(dtos: TaskDto[], workspaceId: string): Task[] {
  return dtos.map(dto => toDomainTask(dto, workspaceId));
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