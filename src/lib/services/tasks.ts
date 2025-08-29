import type { Task, NavigationState, WorkspaceData } from '$lib/types';
import { getDefaultPerspective, getDefaultProject, getWorkspaceId } from '$lib/helpers/workspaceHelpers';

export class TaskService {
	/**
	 * Creates a new task with defaults based on current context
	 */
    static createNewTaskWithDefaults(
        workspaceContext: WorkspaceData,
		navigation: NavigationState
	): Task {
		return {
			id: 'new',
			title: '',
			description: '',
			completed: false,
            projectId: TaskService.getEffectiveProjectId(navigation, workspaceContext),
            perspective: TaskService.getEffectivePerspectiveId(navigation, workspaceContext),
            workspaceId: getWorkspaceId(workspaceContext),
			order: 0, // Will be calculated when task is actually saved
			createdAt: new Date(),
			updatedAt: new Date()
		};
	}

	/**
	 * Validates task data before saving
	 */
	static validateTask(task: Partial<Task>): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		if (!task.title || task.title.trim().length === 0) {
			errors.push('Task title is required');
		}

		if (!task.workspaceId) {
			errors.push('Workspace ID is required');
		}

		if (!task.perspective) {
			errors.push('Perspective is required');
		}

		return {
			valid: errors.length === 0,
			errors
		};
	}

	/**
	 * Prepares task data for creation
	 */
	static prepareTaskForCreation(
		taskData: {
			title: string;
			description?: string;
			projectId: string;
			perspective: string;
		},
		workspaceId: string
	): Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'> {
		return {
			title: taskData.title,
			description: taskData.description,
			projectId: taskData.projectId,
			workspaceId: workspaceId,
			completed: false,
			perspective: taskData.perspective
		};
	}

	/**
	 * Calculates the next order value for a new task
	 */
	static calculateNextOrder(tasks: Task[]): number {
		if (tasks.length === 0) return 0;
		const maxOrder = Math.max(...tasks.map(t => t.order || 0));
		return maxOrder + 1;
	}

	/**
	 * Sorts tasks by their order property
	 */
	static sortTasksByOrder(tasks: Task[]): Task[] {
		return [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
	}

	/**
	 * Determines the effective project ID based on navigation state
	 */
    static getEffectiveProjectId(
        navigation: { currentView: string; currentProjectId?: string },
        workspaceContext: WorkspaceData
	): string {
		if (navigation.currentView === 'project' && navigation.currentProjectId) {
			return navigation.currentProjectId;
		}
        const defaultProject = getDefaultProject(workspaceContext);
		if (!defaultProject) {
            throw new Error(`No default project found for workspace ${getWorkspaceId(workspaceContext)}`);
		}
		return defaultProject.id;
	}

	/**
	 * Determines the effective perspective ID based on navigation state
	 */
    static getEffectivePerspectiveId(
        navigation: { currentView: string; currentPerspectiveId?: string },
        workspaceContext: WorkspaceData
	): string {
		if (navigation.currentView === 'perspective' && navigation.currentPerspectiveId) {
			return navigation.currentPerspectiveId;
		}
        return getDefaultPerspective(workspaceContext)?.id || 'inbox';
	}
}