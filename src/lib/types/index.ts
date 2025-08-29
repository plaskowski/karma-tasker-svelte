// MIGRATION: These domain models should move to lib/domain/*/model.ts
// - Task -> lib/domain/task/model.ts
// - Project -> lib/domain/project/model.ts
// - Workspace -> lib/domain/workspace/model.ts
// - PerspectiveConfig -> lib/domain/perspective/model.ts
// UI-specific types like ViewType and AppState can stay in lib/types/

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  perspective?: string; // undefined = inbox
  projectId?: string; // undefined = no project
  workspaceId: string;
  order: number; // Tasks are ordered within their view

  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  icon?: string;
  workspaceId: string;
  order: number;
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

// UI-specific types can stay here
export type ViewType = 'perspective' | 'project' | 'project-all' | 'all';

// Navigation state - groups related navigation properties
export interface NavigationState {
  currentView: ViewType;
  currentPerspectiveId?: string;
  currentProjectId?: string;
}

// Draft payload shape used when creating a new task
export type TaskDraft = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

export interface AppState {
  currentWorkspace: string;
  currentView: ViewType;
  currentProjectId?: string;
  showCompleted: boolean;
}
