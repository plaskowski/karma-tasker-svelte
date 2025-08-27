/**
 * Testing facade to provide controlled access to application state during tests
 * This avoids direct localStorage manipulation from tests
 */

export interface TestingFacade {
	// Clear all data for empty state testing
	clearAllData: () => void;
	// Set up completed tasks for visual testing
	setupCompletedTasks: () => void;
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
		setupCompletedTasks() {
			// Load existing tasks or use default sample data
			const existingTasksJson = localStorage.getItem('karma-tasks-tasks');
			let tasks = [];
			
			if (existingTasksJson) {
				tasks = JSON.parse(existingTasksJson);
			} else {
				// Use default sample tasks
				tasks = [
					{
						id: '1',
						title: 'Review GTD weekly',
						description: 'Go through all inboxes and process items',
						completed: false,
						perspective: 'next',
						projectId: 'personal-default',
						workspaceId: 'personal',
						order: 1
					},
					{
						id: '2',
						title: 'Plan family vacation',
						description: '',
						completed: false,
						perspective: 'someday',
						projectId: 'family',
						workspaceId: 'personal',
						order: 2
					},
					{
						id: '3',
						title: 'Deploy API changes',
						description: '',
						completed: false,
						perspective: 'next',
						projectId: 'api-redesign',
						workspaceId: 'work',
						order: 1
					}
				];
			}
			
			// Add some completed tasks across different perspectives and projects
			const completedTasks = [
				{
					id: 'completed-1',
					title: 'Set up project structure',
					description: 'Initialize SvelteKit project with TypeScript',
					completed: true,
					perspective: 'next',
					projectId: 'personal-default',
					workspaceId: 'personal',
					order: 100
				},
				{
					id: 'completed-2',
					title: 'Research vacation destinations',
					description: 'Look into family-friendly places',
					completed: true,
					perspective: 'someday',
					projectId: 'family',
					workspaceId: 'personal',
					order: 101
				},
				{
					id: 'completed-3',
					title: 'Write API documentation',
					description: '',
					completed: true,
					perspective: 'next',
					projectId: 'api-redesign',
					workspaceId: 'work',
					order: 102
				},
				{
					id: 'completed-4',
					title: 'Fix authentication bug',
					description: 'Users were getting logged out randomly',
					completed: true,
					perspective: 'inbox',
					projectId: 'personal-default',
					workspaceId: 'personal',
					order: 103
				},
				{
					id: 'completed-5',
					title: 'Update dependencies',
					description: '',
					completed: true,
					perspective: 'next',
					projectId: 'personal-default',
					workspaceId: 'personal',
					order: 104
				}
			];
			
			// Merge completed tasks with existing tasks
			const allTasks = [...tasks.filter(t => !t.id.startsWith('completed-')), ...completedTasks];
			
			// Save to localStorage
			localStorage.setItem('karma-tasks-tasks', JSON.stringify(allTasks));
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