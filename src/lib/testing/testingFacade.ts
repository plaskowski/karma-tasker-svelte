/**
 * Testing facade to provide controlled access to application state during tests
 * This avoids direct localStorage manipulation from tests
 */

import type { Task } from '$lib/types';

export interface TestingFacade {
	// State management
	clearAllData: () => void;
	setTasks: (tasks: Task[]) => void;
	
	// Mock mode control
	enableMockMode: () => void;
	
	// Data retrieval (for test assertions)
	getTasks: () => Task[];
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
		
		setTasks(tasks: Task[]) {
			localStorage.setItem('karma-tasks-tasks', JSON.stringify(tasks));
		},
		
		enableMockMode() {
			localStorage.setItem('mockMode', 'true');
			(window as any).__MOCK_MODE__ = true;
		},
		
		getTasks(): Task[] {
			const tasksJson = localStorage.getItem('karma-tasks-tasks');
			return tasksJson ? JSON.parse(tasksJson) : [];
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