import type { Task, NavigationState, WorkspaceData } from '$lib/types';

// View state - raw data from props and stores
export interface TaskListViewState {
  tasks: Task[];
  workspace: WorkspaceData;
  navigation: NavigationState;
  showCompleted: boolean;
}

// Actions the view can trigger
export interface TaskListActions {
  onTaskToggle: (id: string) => void | Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onNewTask?: () => void;
  onCleanup?: () => void;
  onRefresh?: () => void;
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}