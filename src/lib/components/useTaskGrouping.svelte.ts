import { derived } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { Task, WorkspaceData, NavigationState } from '$lib/types';
import { findPerspective, findProject, getPerspectives, getProjects } from '$lib/helpers/workspaceHelpers';
import { 
  sortTasksByPerspectiveThenOrder, 
  sortTasksByProjectThenOrder, 
  groupTasksByProject, 
  groupTasksByPerspective 
} from './taskOperations';

interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

interface TaskGroupingParams {
  taskListStore: Readable<{
    tasks: Task[];
    workspace: WorkspaceData;
    navigation: NavigationState;
    showCompleted: boolean;
  }>;
}

export function useTaskGrouping({ taskListStore }: TaskGroupingParams) {
  // Derived values
  const activeTasks = derived(taskListStore, $state => 
    $state.tasks.filter(t => !t.completed)
  );

  const completedTasks = derived(taskListStore, $state => 
    $state.tasks.filter(t => t.completed)
  );

  const viewTitle = derived(taskListStore, $state => {
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

  const groupingType = derived(taskListStore, $state => {
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

  const taskGroups = derived([taskListStore, activeTasks, groupingType], ([$state, $activeTasks, $groupingType]) => {
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

  const showProjectBadge = derived([taskListStore, groupingType], ([$state, $groupingType]) => {
    return $groupingType !== 'project' && $state.navigation.currentView !== 'project';
  });

  const showPerspectiveBadge = derived([taskListStore, groupingType], ([$state, $groupingType]) => {
    return $groupingType !== 'perspective' && $state.navigation.currentView !== 'perspective';
  });

  return {
    activeTasks,
    completedTasks,
    viewTitle,
    taskGroups,
    showProjectBadge,
    showPerspectiveBadge
  };
}