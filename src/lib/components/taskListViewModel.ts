import type { Task, ViewType, NavigationState } from '$lib/types';
import type { WorkspaceContext } from '$lib/models/WorkspaceContext';
import { get, type Writable } from 'svelte/store';

// View state - raw data from props and stores
export interface TaskListViewState {
  tasks: Task[];
  workspace: WorkspaceContext;
  navigation: NavigationState;
  showCompleted: boolean;
}

// Actions the view can trigger
export interface TaskListActions {
  onTaskToggle: (id: string) => void | Promise<void>;
  onTaskClick: (task: Task) => void;
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

export function createTaskListViewModel(
  state: TaskListViewState,
  actions: TaskListActions,
  inlineEditingStore: Writable<string | null>
) {
  // Resolve current entities from IDs using workspace methods
  const currentProject = state.navigation.currentProjectId 
    ? state.workspace.getProject(state.navigation.currentProjectId) 
    : undefined;
    
  const currentPerspective = state.navigation.currentPerspectiveId
    ? state.workspace.getPerspective(state.navigation.currentPerspectiveId)
    : undefined;

  // Use workspace methods for sorting

  // Computed properties
  const activeTasks = state.tasks.filter(t => !t.completed);
  const completedTasks = state.tasks.filter(t => t.completed);

  // Determine what attribute we're grouping by
  function getGroupingType(): 'project' | 'perspective' | 'none' {
    switch (state.navigation.currentView) {
      case 'perspective':
      case 'all':
        return 'project';
      case 'project':
      case 'project-all':
        return 'perspective';
      default:
        return 'none';
    }
  }

  // Grouping strategies based on view type
  function getTaskGroups(): TaskGroup[] {
    const groups: TaskGroup[] = [];
    const groupingType = getGroupingType();

    if (groupingType === 'project') {
      // Group by project (used in perspective and all views)
      const tasksByProject = state.workspace.groupTasksByProject(activeTasks);
      const ungroupedTasks = activeTasks.filter(t => !t.projectId);

      // Add Actions section for ungrouped tasks
      if (ungroupedTasks.length > 0) {
        groups.push({
          id: 'actions',
          title: 'Actions',
          tasks: state.workspace.sortTasksByPerspectiveThenOrder(ungroupedTasks)
        });
      }

      // Add project groups sorted by project order
      const sortedProjects = [...tasksByProject.entries()].sort(([idA], [idB]) => {
        const projectA = state.workspace.getProject(idA);
        const projectB = state.workspace.getProject(idB);
        return (projectA?.order ?? 0) - (projectB?.order ?? 0);
      });

      sortedProjects.forEach(([projectId, tasks]) => {
        const project = state.workspace.getProject(projectId);
        groups.push({
          id: `project-${projectId}`,
          title: project?.name || projectId,
          tasks: state.workspace.sortTasksByPerspectiveThenOrder(tasks)
        });
      });
    } else if (groupingType === 'perspective') {
      // Group by perspective (used in project and project-all views)
      const tasksByPerspective = state.workspace.groupTasksByPerspective(activeTasks);
      
      // Add perspective groups in order
      state.workspace.getPerspectives().forEach(perspective => {
        const tasks = tasksByPerspective.get(perspective.id) || [];
        if (tasks.length > 0) {
          // Sort differently based on specific view
          const sortedTasks = state.navigation.currentView === 'project-all' 
            ? state.workspace.sortTasksByProjectThenOrder(tasks)
            : tasks.sort((a, b) => a.order - b.order);
          
          groups.push({
            id: `perspective-${perspective.id}`,
            title: perspective.name,
            tasks: sortedTasks
          });
        }
      });
    } else {
      // No grouping - just show all tasks
      if (activeTasks.length > 0) {
        groups.push({
          id: 'all',
          title: 'Tasks',
          tasks: activeTasks.sort((a, b) => a.order - b.order)
        });
      }
    }

    return groups;
  }

  return {
    // Direct state access (pure VM approach - view only touches VM)
    get tasks() {
      return state.tasks;
    },

    get projects() {
      return state.workspace.getProjects();
    },

    get perspectives() {
      return state.workspace.getPerspectives();
    },

    get showCompleted() {
      return state.showCompleted;
    },

    // Computed properties
    get viewTitle(): string {
      switch (state.navigation.currentView) {
        case 'all': return 'All';
        case 'project-all': return 'All Projects';
        case 'project': return currentProject?.name || 'Project';
        case 'perspective': return currentPerspective?.name || 'Tasks';
        default: return 'Tasks';
      }
    },

    get activeTasks() {
      return activeTasks;
    },

    get completedTasks() {
      return completedTasks;
    },

    get activeCount(): number {
      return activeTasks.length;
    },

    get completedCount(): number {
      return completedTasks.length;
    },

    get isEmpty(): boolean {
      return state.tasks.length === 0;
    },

    get hasCompleted(): boolean {
      return completedTasks.length > 0;
    },

    get shouldShowCompletedSection(): boolean {
      return (state.showCompleted || this.hasCompleted) && this.hasCompleted;
    },

    get taskGroups(): TaskGroup[] {
      return getTaskGroups();
    },

    get showProjectBadge(): boolean {
      const groupingType = getGroupingType();
      // Show project badges when:
      // 1. We're NOT grouping by project
      // 2. We're NOT in a specific project view (which would be redundant)
      return groupingType !== 'project' && state.navigation.currentView !== 'project';
    },

    get showPerspectiveBadge(): boolean {
      const groupingType = getGroupingType();
      // Show perspective badges when:
      // 1. We're NOT grouping by perspective
      // 2. We're NOT in a specific perspective view (which would be redundant)
      return groupingType !== 'perspective' && state.navigation.currentView !== 'perspective';
    },

    // UI state helpers
    get showNewTaskButton(): boolean {
      return !!actions.onNewTask;
    },

    get showCleanupButton(): boolean {
      return !!actions.onCleanup;
    },

    get showRefreshButton(): boolean {
      return !!actions.onRefresh;
    },

    // Helper methods that take whole task
    getTaskProjectName(task: Task): string {
      if (!task.projectId) return '';
      const project = state.workspace.getProject(task.projectId);
      return project?.name || task.projectId;
    },

    getTaskPerspectiveName(task: Task): string {
      if (!task.perspective) return '';
      const perspective = state.workspace.getPerspective(task.perspective);
      return perspective?.name || '';
    },

    // Inline editing methods
    get isEditingTask() {
      return (taskId: string) => get(inlineEditingStore) === taskId;
    },

    toggleInlineEditor(taskId: string) {
      inlineEditingStore.update(current => 
        current === taskId ? null : taskId
      );
    },

    closeInlineEditor() {
      inlineEditingStore.set(null);
    },

    // CSS class helpers
    getGroupClass(groupId: string): string {
      return groupId.startsWith('project-') ? 'capitalize' : '';
    },

    // Actions (all actions go through VM)
    handleTaskToggle: actions.onTaskToggle,
    handleTaskClick(task: Task) {
      // Call the original handler
      actions.onTaskClick(task);
    },
    handleUpdateTask: actions.onUpdateTask,
    handleNewTask: actions.onNewTask,
    handleCleanup: actions.onCleanup,
    handleRefresh: actions.onRefresh,
  };
}