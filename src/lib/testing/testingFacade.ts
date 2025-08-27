/**
 * Testing facade to provide controlled access to application state during tests
 * This avoids direct localStorage manipulation from tests
 */

export interface TestingFacade {
	// Clear all data for empty state testing
	clearAllData: () => void;
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