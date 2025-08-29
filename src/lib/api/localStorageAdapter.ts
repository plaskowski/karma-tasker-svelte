import type { WorkspaceAPI, WorkspaceScopedAPI, PersistenceConfig } from './persistence';
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
import { toWorkspaceDto, toProjectDto, toTaskDto } from './mappers';
import { mockTasks, mockProjects, mockWorkspaces } from '$lib/data/mockData';

/**
 * LocalStorage implementation of the WorkspaceAPI.
 * This adapter stores all data in browser localStorage with automatic serialization.
 */
export class LocalStorageAdapter implements WorkspaceAPI {
  private readonly prefix: string;

  constructor(config: PersistenceConfig = {}) {
    this.prefix = config.storagePrefix || 'karma-tasks';
    
    // Initialize with mock data if empty
    this.initializeIfEmpty();
  }

  private getStorageKey(collection: string): string {
    return `${this.prefix}-${collection}`;
  }

  private loadCollection<T>(collection: string): T[] {
    const key = this.getStorageKey(collection);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private saveCollection<T>(collection: string, data: T[]): void {
    const key = this.getStorageKey(collection);
    localStorage.setItem(key, JSON.stringify(data));
  }

  private initializeIfEmpty(): void {
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const projects = this.loadCollection<ProjectDto>('projects');
    const tasks = this.loadCollection<TaskDto>('tasks');

    if (workspaces.length === 0) {
      // Convert mock data to DTOs
      const workspaceDtos = mockWorkspaces.map(toWorkspaceDto);
      this.saveCollection('workspaces', workspaceDtos);
    }
    if (projects.length === 0) {
      const projectDtos = mockProjects.map(toProjectDto);
      this.saveCollection('projects', projectDtos);
    }
    if (tasks.length === 0) {
      const taskDtos = mockTasks.map(toTaskDto);
      this.saveCollection('tasks', taskDtos);
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
    return workspaces.find(w => w.id === id) || null;
  }

  async createWorkspace(request: CreateWorkspaceRequest): Promise<WorkspaceDto> {
    await this.delay();
    const workspaces = this.loadCollection<WorkspaceDto>('workspaces');
    const newWorkspace: WorkspaceDto = {
      id: crypto.randomUUID(),
      name: request.name,
      perspectives: (request.perspectives || []).map((p, index) => ({
        id: crypto.randomUUID(),
        name: p.name,
        icon: p.icon,
        order: p.order ?? index
      })),
      created_at: new Date().toISOString()
    };
    workspaces.push(newWorkspace);
    this.saveCollection('workspaces', workspaces);
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
      ...(request.name !== undefined && { name: request.name }),
      ...(request.perspectives !== undefined && { perspectives: request.perspectives })
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
    
    // Also delete related projects and tasks
    const projects = this.loadCollection<ProjectDto>('projects');
    const tasks = this.loadCollection<TaskDto>('tasks');
    
    const filteredProjects = projects.filter(p => p.workspace_id !== id);
    const filteredTasks = tasks.filter(t => t.workspace_id !== id);
    
    this.saveCollection('projects', filteredProjects);
    this.saveCollection('tasks', filteredTasks);
  }

  // Project operations
  async getProjects(options?: QueryOptions<ProjectFilter>): Promise<ProjectDto[]> {
    await this.delay();
    let projects = this.loadCollection<ProjectDto>('projects');
    
    // Apply filters
    if (options?.filter) {
      const { workspace_id } = options.filter;
      if (workspace_id) {
        projects = projects.filter(p => p.workspace_id === workspace_id);
      }
    }
    
    // Apply sorting
    if (options?.sort) {
      for (const sort of options.sort) {
        projects.sort((a, b) => {
          const aVal = (a as any)[sort.field];
          const bVal = (b as any)[sort.field];
          const diff = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sort.direction === 'asc' ? diff : -diff;
        });
      }
    }
    
    return projects;
  }

  async getProjectsByWorkspace(workspaceId: string): Promise<ProjectDto[]> {
    return this.getProjects({ filter: { workspace_id: workspaceId } });
  }

  async getProject(id: string): Promise<ProjectDto | null> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects');
    return projects.find(p => p.id === id) || null;
  }

  async createProject(request: CreateProjectRequest): Promise<ProjectDto> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects');
    
    // Calculate order if not provided
    let order = request.order;
    if (order === undefined) {
      const workspaceProjects = projects.filter(p => p.workspace_id === request.workspace_id);
      order = workspaceProjects.reduce((max, p) => Math.max(max, p.order), 0) + 1;
    }
    
    const newProject: ProjectDto = {
      id: crypto.randomUUID(),
      workspace_id: request.workspace_id,
      name: request.name,
      order,
      icon: request.icon,
      created_at: new Date().toISOString()
    };
    
    projects.push(newProject);
    this.saveCollection('projects', projects);
    return newProject;
  }

  async updateProject(id: string, request: UpdateProjectRequest): Promise<ProjectDto> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects');
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
    this.saveCollection('projects', projects);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await this.delay();
    const projects = this.loadCollection<ProjectDto>('projects');
    const filtered = projects.filter(p => p.id !== id);
    this.saveCollection('projects', filtered);
    
    // Also delete related tasks
    const tasks = this.loadCollection<TaskDto>('tasks');
    const filteredTasks = tasks.filter(t => t.project_id !== id);
    this.saveCollection('tasks', filteredTasks);
  }

  // Task operations
  async getTasks(options?: QueryOptions<TaskFilter>): Promise<TaskDto[]> {
    await this.delay();
    let tasks = this.loadCollection<TaskDto>('tasks');
    
    // Apply filters
    if (options?.filter) {
      const { workspace_id, project_id, perspective, completed, search } = options.filter;
      if (workspace_id) {
        tasks = tasks.filter(t => t.workspace_id === workspace_id);
      }
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
    
    // Apply sorting
    if (options?.sort) {
      for (const sort of options.sort) {
        tasks.sort((a, b) => {
          const aVal = (a as any)[sort.field];
          const bVal = (b as any)[sort.field];
          const diff = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sort.direction === 'asc' ? diff : -diff;
        });
      }
    }
    
    return tasks;
  }

  async getTasksByWorkspace(workspaceId: string): Promise<TaskDto[]> {
    return this.getTasks({ filter: { workspace_id: workspaceId } });
  }

  async getTask(id: string): Promise<TaskDto | null> {
    await this.delay();
    const tasks = this.loadCollection<TaskDto>('tasks');
    return tasks.find(t => t.id === id) || null;
  }

  async createTask(request: CreateTaskRequest): Promise<TaskDto> {
    await this.delay();
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }
    
    const tasks = this.loadCollection<TaskDto>('tasks');
    
    // Calculate the next order value for this project
    const projectTasks = tasks.filter(t => t.project_id === request.project_id);
    const maxOrder = projectTasks.reduce((max, t) => Math.max(max, t.order), 0);
    
    const newTask: TaskDto = {
      id: crypto.randomUUID(),
      title: request.title,
      description: request.description,
      workspace_id: request.workspace_id,
      project_id: request.project_id,
      perspective: request.perspective,
      completed: false,
      order: maxOrder + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    tasks.push(newTask);
    this.saveCollection('tasks', tasks);
    return newTask;
  }

  async updateTask(id: string, request: UpdateTaskRequest): Promise<TaskDto> {
    await this.delay();
    const tasks = this.loadCollection<TaskDto>('tasks');
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }
    
    const updated: TaskDto = {
      ...tasks[index],
      ...(request.title !== undefined && { title: request.title }),
      ...(request.description !== undefined && { description: request.description }),
      ...(request.project_id !== undefined && { project_id: request.project_id }),
      ...(request.perspective !== undefined && { perspective: request.perspective }),
      ...(request.completed !== undefined && { 
        completed: request.completed
      }),
      ...(request.order !== undefined && { order: request.order }),
      updated_at: new Date().toISOString()
    };
    
    tasks[index] = updated;
    this.saveCollection('tasks', tasks);
    return updated;
  }

  async deleteTask(id: string): Promise<void> {
    await this.delay();
    const tasks = this.loadCollection<TaskDto>('tasks');
    const filtered = tasks.filter(t => t.id !== id);
    this.saveCollection('tasks', filtered);
  }
}

// Export singleton instance
export const db = new LocalStorageAdapter();