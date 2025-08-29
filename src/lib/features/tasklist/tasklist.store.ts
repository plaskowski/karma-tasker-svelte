import { writable, derived, get } from 'svelte/store';
import type { Task, WorkspaceData, NavigationState } from '$lib/types';
import { findPerspective, findProject, getPerspectives, getProjects } from '$lib/helpers/workspaceHelpers';
import { 
  sortTasksByPerspectiveThenOrder, 
  sortTasksByProjectThenOrder, 
  groupTasksByProject, 
  groupTasksByPerspective 
} from '$lib/components/taskOperations';
// Define TaskGroup interface locally since it's specific to this feature
interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

export interface TaskListStore {
  tasks: Task[];
  workspace: WorkspaceData;
  navigation: NavigationState;
  showCompleted: boolean;
  inlineEditingTaskId: string | null;
}

export function createTaskListStore(initial: {
  tasks: Task[];
  workspace: WorkspaceData;
  navigation: NavigationState;
  showCompleted: boolean;
}) {
  const state = writable<TaskListStore>({
    ...initial,
    inlineEditingTaskId: null
  });

  // Derived values
  const activeTasks = derived(state, $state => 
    $state.tasks.filter(t => !t.completed)
  );

  const completedTasks = derived(state, $state => 
    $state.tasks.filter(t => t.completed)
  );

  const viewTitle = derived(state, $state => {
    const currentProject = $state.navigation.currentProjectId 
      ? findProject($state.workspace, $state.navigation.currentProjectId) 
      : undefined;
      
    const currentPerspective = $state.navigation.currentPerspectiveId
      ? findPerspective($state.workspace, $state.navigation.currentPerspectiveId)
      : undefined;

    switch ($state.navigation.currentView) {
      case 'all': return 'All';
      case 'project-all': return 'All Projects';
      case 'project': return currentProject?.name || 'Project';
      case 'perspective': return currentPerspective?.name || 'Tasks';
      default: return 'Tasks';
    }
  });

  const groupingType = derived(state, $state => {
    switch ($state.navigation.currentView) {
      case 'perspective':
      case 'all':
        return 'project';
      case 'project':
      case 'project-all':
        return 'perspective';
      default:
        return 'none';
    }
  });

  const taskGroups = derived([state, activeTasks, groupingType], ([$state, $activeTasks, $groupingType]) => {
    const groups: TaskGroup[] = [];

    if ($groupingType === 'project') {
      // Group by project (used in perspective and all views)
      const tasksByProject = groupTasksByProject($activeTasks);
      const ungroupedTasks = $activeTasks.filter(t => !t.projectId);

      // Add Actions section for ungrouped tasks
      if (ungroupedTasks.length > 0) {
        groups.push({
          id: 'actions',
          title: 'Actions',
          tasks: sortTasksByPerspectiveThenOrder(ungroupedTasks, getPerspectives($state.workspace))
        });
      }

      // Add project groups sorted by project order
      const sortedProjects = [...tasksByProject.entries()].sort(([idA], [idB]) => {
        const projectA = findProject($state.workspace, idA);
        const projectB = findProject($state.workspace, idB);
        return (projectA?.order ?? 0) - (projectB?.order ?? 0);
      });

      sortedProjects.forEach(([projectId, tasks]) => {
        const project = findProject($state.workspace, projectId);
        groups.push({
          id: `project-${projectId}`,
          title: project?.name || projectId,
          tasks: sortTasksByPerspectiveThenOrder(tasks, getPerspectives($state.workspace))
        });
      });
    } else if ($groupingType === 'perspective') {
      // Group by perspective (used in project and project-all views)
      const tasksByPerspective = groupTasksByPerspective($activeTasks, getPerspectives($state.workspace));
      
      // Add perspective groups in order
      getPerspectives($state.workspace).forEach(perspective => {
        const tasks = tasksByPerspective.get(perspective.id) || [];
        if (tasks.length > 0) {
          // Sort differently based on specific view
          const sortedTasks = $state.navigation.currentView === 'project-all' 
            ? sortTasksByProjectThenOrder(tasks, getProjects($state.workspace))
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
      if ($activeTasks.length > 0) {
        groups.push({
          id: 'all',
          title: 'Tasks',
          tasks: $activeTasks.sort((a, b) => a.order - b.order)
        });
      }
    }

    return groups;
  });

  const showProjectBadge = derived([state, groupingType], ([$state, $groupingType]) => {
    // Show project badges when:
    // 1. We're NOT grouping by project
    // 2. We're NOT in a specific project view (which would be redundant)
    return $groupingType !== 'project' && $state.navigation.currentView !== 'project';
  });

  const showPerspectiveBadge = derived([state, groupingType], ([$state, $groupingType]) => {
    // Show perspective badges when:
    // 1. We're NOT grouping by perspective
    // 2. We're NOT in a specific perspective view (which would be redundant)
    return $groupingType !== 'perspective' && $state.navigation.currentView !== 'perspective';
  });

  // Methods
  function getTaskProjectName(task: Task): string {
    const $state = get(state);
    if (!task.projectId) return '';
    const project = findProject($state.workspace, task.projectId);
    return project?.name || task.projectId;
  }

  function getTaskPerspectiveName(task: Task): string {
    const $state = get(state);
    if (!task.perspectiveId) return '';
    const perspective = findPerspective($state.workspace, task.perspectiveId);
    return perspective?.name || '';
  }

  function toggleInlineEditor(taskId: string) {
    state.update(s => ({
      ...s,
      inlineEditingTaskId: s.inlineEditingTaskId === taskId ? null : taskId
    }));
  }

  function closeInlineEditor() {
    state.update(s => ({
      ...s,
      inlineEditingTaskId: null
    }));
  }

  function isEditingTask(taskId: string): boolean {
    const $state = get(state);
    return $state.inlineEditingTaskId === taskId;
  }

  function updateData(data: Partial<TaskListStore>) {
    state.update(s => ({ ...s, ...data }));
  }

  return {
    // Stores
    state,
    activeTasks,
    completedTasks,
    viewTitle,
    taskGroups,
    showProjectBadge,
    showPerspectiveBadge,

    // Methods
    getTaskProjectName,
    getTaskPerspectiveName,
    toggleInlineEditor,
    closeInlineEditor,
    isEditingTask,
    updateData
  };
}