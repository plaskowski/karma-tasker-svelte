export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  starred: boolean;
  dueDate?: Date;
  startDate?: Date;
  projectId: string;
  workspaceId: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  color?: string;
  areaId?: string;
  workspaceId: string;
  isCollapsed?: boolean;
  createdAt: Date;
}

export interface Area {
  id: string;
  name: string;
  isCollapsed?: boolean;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  defaultProjectId: string;
  isActive: boolean;
  createdAt: Date;
}

export type ViewType = 'inbox' | 'next' | 'waiting' | 'scheduled' | 'someday' | 'focus' | 'project';

export interface AppState {
  currentWorkspace: string;
  currentView: ViewType;
  currentProjectId?: string;
  searchQuery: string;

  showCompleted: boolean;
}
