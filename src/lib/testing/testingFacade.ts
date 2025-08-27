/**
 * Testing facade to provide controlled access to application state during tests
 * This avoids direct localStorage manipulation from tests
 */

import { get } from 'svelte/store';
import { tasks, updateTask } from '$lib/stores/taskStore';
import type { Task } from '$lib/types';

export interface TestingFacade {
	// Clear all data for empty state testing
	clearAllData: () => void;
	// Complete half of tasks from specified workspace and perspective
	completeHalfOfTasks: (workspaceId?: string, perspective?: string) => Promise<void>;
}

/**
 * Create the testing facade implementation
 */
export function createTestingFacade(): TestingFacade {
	return {
		clearAllData() {
			localStorage.clear();
			// Set empty tasks to ensure clean state
			localStorage.setItem('karma-tasks-tasks', JSON.stringify([]));
		},
		async completeHalfOfTasks(workspaceId?: string, perspective?: string) {
			// Get current tasks from store
			const allTasks = get(tasks);
			
			// Filter tasks based on criteria
			let eligibleTasks = allTasks.filter((task: Task) => {
				if (task.completed) return false; // Skip already completed
				
				if (workspaceId && task.workspaceId !== workspaceId) return false;
				if (perspective && task.perspective !== perspective) return false;
				
				return true;
			});
			
			// If no specific filters, just take uncompleted tasks from personal workspace
			if (!workspaceId && !perspective && eligibleTasks.length === 0) {
				eligibleTasks = allTasks.filter((task: Task) => 
					!task.completed && task.workspaceId === 'personal'
				);
			}
			
			// Complete half of the eligible tasks (at least 1, round up)
			const tasksToComplete = Math.max(1, Math.ceil(eligibleTasks.length / 2));
			
			// Complete the tasks using the actual service
			for (let i = 0; i < tasksToComplete && i < eligibleTasks.length; i++) {
				await updateTask(eligibleTasks[i].id, { completed: true });
			}
		}
	};
}

/**
 * Initialize testing facade on window object (only in dev/test environments)
 */
export function initializeTestingFacade() {
	if (typeof window !== 'undefined') {
		// Only expose in development or test environments
		const isDev = import.meta.env.DEV;
		const isTest = import.meta.env.MODE === 'test' || window.location.hostname === 'localhost';
		
		if (isDev || isTest) {
			(window as any).__testingFacade = createTestingFacade();
		}
	}
}