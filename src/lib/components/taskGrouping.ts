import type { Task, WorkspaceData, NavigationState, ViewType } from '$lib/types';
import { findProject, findPerspective, getPerspectives, getProjects } from '$lib/helpers/workspaceHelpers';
import { 
  sortTasksByPerspectiveThenOrder, 
  sortTasksByProjectThenOrder, 
  groupTasksByProject, 
  groupTasksByPerspective 
} from './taskOperations';

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}

export type GroupingType = 'project' | 'perspective' | 'none';

/**
 * Determines the grouping type based on the current view
 */
export function getGroupingType(view: ViewType): GroupingType {
  switch (view) {
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

/**
 * Groups active tasks based on the current navigation view and workspace
 */
export function getTaskGroups(
  activeTasks: Task[],
  navigation: NavigationState,
  workspace: WorkspaceData
): TaskGroup[] {
  const groups: TaskGroup[] = [];
  const groupingType = getGroupingType(navigation.currentView);

  if (groupingType === 'project') {
    // Group by project (used in perspective and all views)
    const tasksByProject = groupTasksByProject(activeTasks);
    
    // Sort projects by their order
    const sortedProjects = [...tasksByProject.entries()].sort(([idA], [idB]) => {
      const projectA = findProject(workspace, idA);
      const projectB = findProject(workspace, idB);
      return (projectA?.order ?? 0) - (projectB?.order ?? 0);
    });

    sortedProjects.forEach(([projectId, tasks]) => {
      const project = findProject(workspace, projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found in workspace`);
      }
      groups.push({
        id: `project-${projectId}`,
        title: project.name,
        tasks: sortTasksByPerspectiveThenOrder(tasks, getPerspectives(workspace))
      });
    });
  } else if (groupingType === 'perspective') {
    // Group by perspective (used in project and project-all views)
    const tasksByPerspective = groupTasksByPerspective(activeTasks, getPerspectives(workspace));
    
    // Add perspective groups in order
    getPerspectives(workspace).forEach(perspective => {
      const tasks = tasksByPerspective.get(perspective.id) || [];
      if (tasks.length > 0) {
        // Sort differently based on specific view
        const sortedTasks = navigation.currentView === 'project-all' 
          ? sortTasksByProjectThenOrder(tasks, getProjects(workspace))
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

/**
 * Determines whether to show project badges based on current view
 */
export function shouldShowProjectBadge(navigation: NavigationState): boolean {
  const groupingType = getGroupingType(navigation.currentView);
  return groupingType !== 'project';
}

/**
 * Determines whether to show perspective badges based on current view
 */
export function shouldShowPerspectiveBadge(navigation: NavigationState): boolean {
  const groupingType = getGroupingType(navigation.currentView);
  return groupingType !== 'perspective';
}

/**
 * Gets badge text for a task based on current navigation state
 */
export function getBadgeText(
  task: Task, 
  navigation: NavigationState, 
  workspace: WorkspaceData
): string | undefined {
  const showPerspectiveBadge = shouldShowPerspectiveBadge(navigation);
  const showProjectBadge = shouldShowProjectBadge(navigation);

  if (showPerspectiveBadge) {
    const perspective = findPerspective(workspace, task.perspectiveId);
    return perspective?.name || task.perspectiveId;
  }
  if (showProjectBadge && task.projectId) {
    const project = findProject(workspace, task.projectId);
    return project?.name || task.projectId;
  }
  return undefined;
}