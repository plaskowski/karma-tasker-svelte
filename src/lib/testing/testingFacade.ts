/**
 * Testing facade to provide controlled access to application state during tests
 * This avoids direct localStorage manipulation from tests
 */

import type { Task, Project, Workspace } from '$lib/types';

export interface TestingFacade {
	// State management
	clearAllData: () => void;
	setTasks: (tasks: Task[]) => void;
	setProjects: (projects: Project[]) => void;
	setWorkspaces: (workspaces: Workspace[]) => void;
	
	// Mock mode control
	enableMockMode: () => void;
	disableMockMode: () => void;
	
	// Data retrieval (for test assertions)
	getTasks: () => Task[];
	getProjects: () => Project[];
	getWorkspaces: () => Workspace[];
	getCurrentView: () => string;
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
		
		setProjects(projects: Project[]) {
			localStorage.setItem('karma-tasks-projects', JSON.stringify(projects));
		},
		
		setWorkspaces(workspaces: Workspace[]) {
			localStorage.setItem('karma-tasks-workspaces', JSON.stringify(workspaces));
		},
		
		enableMockMode() {
			localStorage.setItem('mockMode', 'true');
			(window as any).__MOCK_MODE__ = true;
		},
		
		disableMockMode() {
			localStorage.removeItem('mockMode');
			delete (window as any).__MOCK_MODE__;
		},
		
		getTasks(): Task[] {
			const tasksJson = localStorage.getItem('karma-tasks-tasks');
			return tasksJson ? JSON.parse(tasksJson) : [];
		},
		
		getProjects(): Project[] {
			const projectsJson = localStorage.getItem('karma-tasks-projects');
			return projectsJson ? JSON.parse(projectsJson) : [];
		},
		
		getWorkspaces(): Workspace[] {
			const workspacesJson = localStorage.getItem('karma-tasks-workspaces');
			return workspacesJson ? JSON.parse(workspacesJson) : [];
		},
		
		getCurrentView(): string {
			// Get current view from URL params
			const params = new URLSearchParams(window.location.search);
			return params.get('view') || 'perspective';
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