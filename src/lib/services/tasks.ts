import type { Task, NavigationState } from '$lib/types';
import type { WorkspaceContext } from '$lib/models/WorkspaceContext';

export class TaskService {
	/**
	 * Creates a new task with defaults based on current context
	 */
	static createNewTaskWithDefaults(
		workspaceContext: WorkspaceContext,
		navigation: NavigationState
	): Task {
		return {
			id: 'new',
			title: '',
			description: '',
			completed: false,
			projectId: workspaceContext.getEffectiveProjectId(navigation),
			perspective: workspaceContext.getEffectivePerspectiveId(navigation),
			workspaceId: workspaceContext.getId(),
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
}