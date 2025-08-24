export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  starred: boolean;
  perspective?: string; // undefined = inbox
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

export interface PerspectiveConfig {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface Workspace {
  id: string;
  name: string;
  defaultProjectId: string;
  perspectives: PerspectiveConfig[];
  isActive: boolean;
  createdAt: Date;
}

export type ViewType = 'focus' | 'project' | string; // string allows for configurable perspective views

export interface AppState {
  currentWorkspace: string;
  currentView: ViewType;
  currentProjectId?: string;
  searchQuery: string;

  showCompleted: boolean;
}
