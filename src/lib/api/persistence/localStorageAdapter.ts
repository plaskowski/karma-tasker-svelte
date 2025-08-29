import type { 
  WorkspaceAPI, 
  WorkspaceScopedAPI,
  WorkspaceDto, 
  ProjectDto, 
  TaskDto,
  PerspectiveDto,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreatePerspectiveRequest,
  UpdatePerspectiveRequest,
  TaskFilter
} from './index';
import { getFieldValue, shouldUpdateField } from './fieldUpdates';
import { toWorkspaceDto, toProjectDto, toTaskDto } from './mappers';
import { mockTasks, mockProjects, mockWorkspaces } from '$lib/data/mockData';

/**
 * Configuration for the LocalStorage adapter
 */
export interface LocalStorageConfig {
  /** Storage key prefix to avoid conflicts (default: 'karma-tasks') */
  storagePrefix?: string;
}

/**
 * LocalStorage implementation of the WorkspaceAPI.
 * This adapter stores all data in browser localStorage with automatic serialization.
 */
export class LocalStorageAdapter implements WorkspaceAPI {
  private readonly prefix: string;

  constructor(config: LocalStorageConfig = {}) {
    this.prefix = config.storagePrefix || 'karma-tasks';
    
    // Initialize with mock data if empty
    this.initializeIfEmpty();
  }

  private getStorageKey(collection: string, workspaceId?: string): string {
    if (workspaceId) {
      return `${this.prefix}-${workspaceId}-${collection}`;
    }
    return `${this.prefix}-${collection}`;
  }

  private loadCollection<T>(collection: string, workspaceId?: string): T[] {
    const key = this.getStorageKey(collection, workspaceId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveCollection<T>(collection: string, data: T[], workspaceId?: string): void {
    const key = this.getStorageKey(collection, workspaceId);
    localStorage.setItem(key, JSON.stringify(data));
  }

  private async delay(): Promise<void> {
    // Simulate network delay (200-500ms)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  }

  private initializeIfEmpty(): void {
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');

    if (workspaces.length === 0) {
      // Initialize workspaces
      const workspaceDtos = mockWorkspaces.map(w => ({
        id: w.id,
        name: w.name,
        created_at: w.createdAt.toISOString()
      }));
      this.saveCollection('workspaces', workspaceDtos);
      
      // Initialize perspectives, projects and tasks for each workspace
      mockWorkspaces.forEach(workspace => {
        // Store perspectives for this workspace
        const workspacePerspectives = workspace.perspectives.map(p => ({
          id: p.id,
          name: p.name,
          icon: p.icon,
          order: p.order || 0
        }));
        this.saveCollection('perspectives', workspacePerspectives, workspace.id);
        
        const workspaceProjects = mockProjects
          .filter(p => p.workspaceId === workspace.id)
          .map(p => ({
            id: p.id,
            name: p.name,
            order: p.order,
            icon: p.icon,
            created_at: p.createdAt.toISOString()
          }));
        this.saveCollection('projects', workspaceProjects, workspace.id);
        
        const workspaceTasks = mockTasks
          .filter(t => t.workspaceId === workspace.id)
          .map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            project_id: t.projectId,
            perspective: t.perspective,
            completed: t.completed,
            order: t.order,
            created_at: t.createdAt.toISOString(),
            updated_at: t.updatedAt.toISOString()
          }));
        this.saveCollection('tasks', workspaceTasks, workspace.id);
      });
    }
  }

  // Workspace operations
  async getWorkspaces(): Promise<WorkspaceDto[]> {
    await this.delay();
    return this.loadCollection<WorkspaceDto>('workspaces');
  }

  async getWorkspace(id: string): Promise<WorkspaceDto | null> {
    await this.delay();
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const workspace = workspaces.find(w => w.id === id);
    return workspace || null;
  }

  async createWorkspace(request: CreateWorkspaceRequest): Promise<WorkspaceDto> {
    await this.delay();
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const newWorkspace: WorkspaceDto = {
      id: crypto.randomUUID(),
      name: request.name,
      created_at: new Date().toISOString()
    };
    workspaces.push(newWorkspace);
    this.saveCollection('workspaces', workspaces);
    
    // Initialize empty collections for the new workspace
    this.saveCollection('perspectives', [], newWorkspace.id);
    this.saveCollection('projects', [], newWorkspace.id);
    this.saveCollection('tasks', [], newWorkspace.id);
    
    return newWorkspace;
  }

  async updateWorkspace(id: string, request: UpdateWorkspaceRequest): Promise<WorkspaceDto> {
    await this.delay();
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const index = workspaces.findIndex(w => w.id === id);
    if (index === -1) {
      throw new Error(`Workspace ${id} not found`);
    }
    
    const updated: WorkspaceDto = {
      ...workspaces[index],
      ...(request.name !== undefined && { name: request.name })
    };
    
    workspaces[index] = updated;
    this.saveCollection('workspaces', workspaces);
    return updated;
  }

  async deleteWorkspace(id: string): Promise<void> {
    await this.delay();
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const filtered = workspaces.filter(w => w.id !== id);
    this.saveCollection('workspaces', filtered);
    
    // Delete workspace-specific storage keys
    localStorage.removeItem(this.getStorageKey('perspectives', id));
    localStorage.removeItem(this.getStorageKey('projects', id));
    localStorage.removeItem(this.getStorageKey('tasks', id));
  }

  // Project operations (these are global methods, workspace-scoped access is through forWorkspace)
  async getProjects(): Promise<ProjectDto[]> {
    await this.delay();
    // Aggregate projects from all workspaces
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const allProjects: ProjectDto[] = [];
    for (const workspace of workspaces) {
      const projects = this.loadCollection<ProjectDto>('projects', workspace.id);
      allProjects.push(...projects);
    }
    return allProjects;
  }

  async getProject(id: string): Promise<ProjectDto | null> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects');
    return projects.find(p => p.id === id) || null;
  }

  async createProject(workspaceId: string, request: CreateProjectRequest): Promise<ProjectDto> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects', workspaceId);
    
    // Calculate order if not provided
    let order = request.order;
    if (order === undefined) {
      order = projects.reduce((max, p) => Math.max(max, p.order), 0) + 1;
    }
    
    const newProject: ProjectDto = {
      id: crypto.randomUUID(),
      name: request.name,
      order,
      icon: request.icon,
      created_at: new Date().toISOString()
    };
    
    projects.push(newProject);
    this.saveCollection('projects', projects, workspaceId);
    return newProject;
  }

  async updateProject(workspaceId: string, id: string, request: UpdateProjectRequest): Promise<ProjectDto> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects', workspaceId);
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project ${id} not found`);
    }
    
    const updated: ProjectDto = {
      ...projects[index],
      ...(request.name !== undefined && { name: request.name }),
      ...(request.order !== undefined && { order: request.order }),
      ...(request.icon !== undefined && { icon: request.icon })
    };
    
    projects[index] = updated;
    this.saveCollection('projects', projects, workspaceId);
    return updated;
  }

  async deleteProject(workspaceId: string, id: string): Promise<void> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects', workspaceId);
    const filtered = projects.filter(p => p.id !== id);
    this.saveCollection('projects', filtered, workspaceId);
    
    // Also delete related tasks
    const tasks = this.loadCollection<TaskDto>('tasks', workspaceId);
    const filteredTasks = tasks.filter(t => t.project_id !== id);
    this.saveCollection('tasks', filteredTasks, workspaceId);
  }

  // Task operations (these are global methods, workspace-scoped access is through forWorkspace)
  async getTasks(): Promise<TaskDto[]> {
    await this.delay();
    // Aggregate tasks from all workspaces
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const allTasks: TaskDto[] = [];
    for (const workspace of workspaces) {
      const tasks = this.loadCollection<TaskDto>('tasks', workspace.id);
      allTasks.push(...tasks);
    }
    return allTasks;
  }

  async getTask(id: string): Promise<TaskDto | null> {
    await this.delay();
    const tasks = this.loadCollection<TaskDto>('tasks');
    return tasks.find(t => t.id === id) || null;
  }

  async createTask(workspaceId: string, request: CreateTaskRequest): Promise<TaskDto> {
    await this.delay();
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }
    
    const tasks = this.loadCollection<TaskDto>('tasks', workspaceId);
    
    // Calculate the next order value for this project
    const projectTasks = tasks.filter(t => t.project_id === request.project_id);
    const maxOrder = projectTasks.reduce((max, t) => Math.max(max, t.order), 0);
    
    const newTask: TaskDto = {
      id: crypto.randomUUID(),
      title: request.title,
      description: request.description,
      project_id: request.project_id,
      perspective: request.perspective,
      completed: false,
      order: maxOrder + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    tasks.push(newTask);
    this.saveCollection('tasks', tasks, workspaceId);
    return newTask;
  }

  async updateTask(workspaceId: string, id: string, request: UpdateTaskRequest): Promise<TaskDto> {
    await this.delay();
    const tasks = this.loadCollection<TaskDto>('tasks', workspaceId);
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }
    
    const updated: TaskDto = {
      ...tasks[index],
      ...(request.title !== undefined && { title: request.title }),
      ...(shouldUpdateField(request.description) && { 
        description: getFieldValue(request.description) 
      }),
      ...(request.project_id !== undefined && { project_id: request.project_id }),
      ...(request.perspective !== undefined && { perspective: request.perspective }),
      ...(request.completed !== undefined && { 
        completed: request.completed
      }),
      ...(request.order !== undefined && { order: request.order }),
      updated_at: new Date().toISOString()
    };
    
    tasks[index] = updated;
    this.saveCollection('tasks', tasks, workspaceId);
    return updated;
  }

  async deleteTask(workspaceId: string, id: string): Promise<void> {
    await this.delay();
    const tasks = this.loadCollection<TaskDto>('tasks', workspaceId);
    const filtered = tasks.filter(t => t.id !== id);
    this.saveCollection('tasks', filtered, workspaceId);
  }
  // Workspace-scoped API implementation
  forWorkspace(workspaceId: string): WorkspaceScopedAPI {
    const adapter = this;
    return {
      workspaceId,
      
      // Perspective operations
      async getPerspectives(): Promise<PerspectiveDto[]> {
        await adapter.delay();
        return adapter.loadCollection<PerspectiveDto>('perspectives', workspaceId);
      },
      
      async getPerspective(perspectiveId: string): Promise<PerspectiveDto | null> {
        const perspectives = await this.getPerspectives();
        return perspectives.find(p => p.id === perspectiveId) || null;
      },
      
      async createPerspective(request: CreatePerspectiveRequest): Promise<PerspectiveDto> {
        throw new Error('Not implemented');
      },
      
      async updatePerspective(perspectiveId: string, request: UpdatePerspectiveRequest): Promise<PerspectiveDto> {
        throw new Error('Not implemented');
      },
      
      async deletePerspective(perspectiveId: string): Promise<void> {
        throw new Error('Not implemented');
      },
      
      // Project operations
      async getProjects(): Promise<ProjectDto[]> {
        await adapter.delay();
        return adapter.loadCollection<ProjectDto>('projects', workspaceId);
      },
      
      async getProject(projectId: string): Promise<ProjectDto | null> {
        const projects = await this.getProjects();
        return projects.find(p => p.id === projectId) || null;
      },
      
      async createProject(request: CreateProjectRequest): Promise<ProjectDto> {
        return adapter.createProject(workspaceId, request);
      },
      
      async updateProject(projectId: string, request: UpdateProjectRequest): Promise<ProjectDto> {
        return adapter.updateProject(workspaceId, projectId, request);
      },
      
      async deleteProject(projectId: string): Promise<void> {
        return adapter.deleteProject(workspaceId, projectId);
      },
      
      // Task operations
      async getTasks(filter?: TaskFilter): Promise<TaskDto[]> {
        await adapter.delay();
        let tasks = adapter.loadCollection<TaskDto>('tasks', workspaceId);
        
        // Apply filters
        if (filter) {
          const { project_id, perspective, completed, search } = filter;
          if (project_id) {
            tasks = tasks.filter(t => t.project_id === project_id);
          }
          if (perspective) {
            tasks = tasks.filter(t => t.perspective === perspective);
          }
          if (completed !== undefined) {
            tasks = tasks.filter(t => t.completed === completed);
          }
          if (search) {
            const searchLower = search.toLowerCase();
            tasks = tasks.filter(t => 
              t.title.toLowerCase().includes(searchLower) ||
              t.description?.toLowerCase().includes(searchLower)
            );
          }
        }
        
        return tasks;
      },
      
      async getTask(taskId: string): Promise<TaskDto | null> {
        const tasks = await this.getTasks();
        return tasks.find(t => t.id === taskId) || null;
      },
      
      async createTask(request: CreateTaskRequest): Promise<TaskDto> {
        return adapter.createTask(workspaceId, request);
      },
      
      async updateTask(taskId: string, request: UpdateTaskRequest): Promise<TaskDto> {
        return adapter.updateTask(workspaceId, taskId, request);
      },
      
      async deleteTask(taskId: string): Promise<void> {
        return adapter.deleteTask(workspaceId, taskId);
      }
    };
  }
}

// Export singleton instance
export const db = new LocalStorageAdapter();