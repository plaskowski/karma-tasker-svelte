export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  perspective?: string; // undefined = inbox
  projectId: string;
  workspaceId: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  icon?: string;
  workspaceId: string;
  createdAt: Date;
}

export interface PerspectiveConfig {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface Workspace {
  id: string;
  name: string;
  perspectives: PerspectiveConfig[];
  createdAt: Date;
}

export type ViewType = 'perspective' | 'project' | 'project-all' | 'all';

// Draft payload shape used when creating a new task
export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export interface AppState {
  currentWorkspace: string;
  currentView: ViewType;
  currentProjectId?: string;
  showCompleted: boolean;
}
