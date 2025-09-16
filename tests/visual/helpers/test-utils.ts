import {type Page, expect, test } from '@playwright/test';

/**
 * Freeze time to a fixed date for deterministic testing
 */
export async function freezeTime(page: Page, date: Date = new Date('2024-01-15T10:00:00Z')) {
	await page.addInitScript((frozenDate) => {
		// Store original Date constructor
		const OriginalDate = Date;
		
		// Override Date constructor
		(window as any).Date = class extends OriginalDate {
			constructor(...args: any[]) {
				if (args.length === 0) {
					super(frozenDate);
				} else {
					// @ts-ignore
					super(...args);
				}
			}
			
			static now() {
				return new OriginalDate(frozenDate).getTime();
			}
		};
		
		// Override performance.now() for animations
		const frozenPerformanceNow = performance.now();
		performance.now = () => frozenPerformanceNow;
		
		// Override setTimeout and setInterval to run immediately in tests
		const originalSetTimeout = window.setTimeout;

		(window as any).setTimeout = (fn: Function, delay?: number) => {
			if (delay === 0 || delay === 1) {
				return originalSetTimeout(fn, delay);
			}
			// Run immediately for testing
			Promise.resolve().then(() => fn());
			return Math.random();
		};
		
		(window as any).setInterval = (fn: Function) => {
			// Run once immediately, then stop
			Promise.resolve().then(() => fn());
			return Math.random();
		};
	}, date.toISOString());
}

/**
 * Seed Math.random() for deterministic random values
 */
export async function seedRandom(page: Page, seed: number = 12345) {
	await page.addInitScript((seed) => {
		// Simple seedable PRNG (Mulberry32)
		let state = seed;
		
		Math.random = () => {
			state = (state + 0x6D2B79F5) | 0;
			let t = state;
			t = Math.imul(t ^ t >>> 15, 1 | t);
			t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}, seed);
}

/**
 * Wait for the app to be fully loaded and stable
 */
export async function waitForAppReady(page: Page) {
	// Wait for SvelteKit to be ready
	await page.waitForLoadState('networkidle');
	
	// Wait for any loading indicators to disappear
	const loadingIndicators = page.locator('[data-loading], .loading, .spinner');
	const count = await loadingIndicators.count();
	if (count > 0) {
		await expect(loadingIndicators.first()).toBeHidden({ timeout: 10000 });
	}
	
	// Wait for animations to complete (if any slipped through reduced-motion)
	await page.waitForTimeout(100);
	
	// Ensure focus is consistent
	await page.evaluate(() => document.body.focus());
	
	// Scroll to top for consistent screenshots
	await page.evaluate(() => window.scrollTo(0, 0));
}


/**
 * Prepare page for screenshot testing
 */
export async function prepareForScreenshot(page: Page) {
	await freezeTime(page);
	await seedRandom(page);
}



/**
 * Build URL with query parameters for direct navigation
 */
export function buildAppUrl(options?: {
	workspace?: string;
	view?: 'perspective' | 'project' | 'project-all' | 'all';
	perspective?: string;
	project?: string;
}): string {
	const params = new URLSearchParams();
	
	if (options?.workspace) {
		params.set('workspace', options.workspace);
	}
	
	if (options?.view) {
		params.set('view', options.view);
		
		if (options.view === 'perspective' && options.perspective) {
			params.set('perspective', options.perspective);
		}
		
		if (options.view === 'project' && options.project) {
			params.set('project', options.project);
		}
	}
	
	return params.toString() ? `/?${params.toString()}` : '/';
}


/**
 * Navigate and wait for app to be ready - used by E2E tests
 */
export async function navigateToApp(page: Page, path: string = '/') {
	await prepareForScreenshot(page);
	await page.goto(path);
	await waitForAppReady(page);
}

/**
 * Configuration for a visual test
 */
export interface VisualTestConfig {
	name: string;
	state: () => TestState;
	url: {
		workspace?: string;
		view?: 'perspective' | 'project' | 'project-all' | 'all';
		perspective?: string;
		project?: string;
	};
	screenshot: string;
}

/**
 * Create a declarative visual test from configuration
 */
export function visualTest(config: VisualTestConfig) {
	test(config.name, async ({ page }) => {
		// Prepare page and inject state
		await prepareForScreenshot(page);
		await injectTestState(page, config.state());
		
		// Navigate to the specified URL
		const url = buildAppUrl(config.url);
		await page.goto(url);
		await waitForAppReady(page);
		
		// Take screenshot
		await expect(page).toHaveScreenshot(config.screenshot);
	});
}

/**
 * State injection types and utilities for visual tests
 */
export interface TestState {
	workspaces?: any[];
	tasks?: any[];
	projects?: any[];
}

/**
 * Inject test state into the page before app initialization
 */
export async function injectTestState(page: Page, state: TestState) {
	await page.addInitScript((injectedState) => {
		(window as any).__testState = injectedState;
	}, state);
}

/**
 * State builder utilities for common test scenarios
 */
export const stateBuilder = {
	/**
	 * Create state focused on a specific project with its tasks
	 */
	forProject: (projectId: string, options?: { taskCount?: number; withCompleted?: boolean }) => {
		// Import mock data - we'll inline this for now
		const mockWorkspaces = [
			{
				id: 'personal',
				name: 'Personal',
				perspectives: [
					{ id: 'inbox', name: 'Inbox', icon: 'inbox', order: 1 },
					{ id: 'first', name: 'First', icon: 'zap', order: 2 },
					{ id: 'next', name: 'Next', icon: 'clock', order: 3 },
					{ id: 'someday', name: 'Someday', icon: 'archive', order: 4 },
				],
				createdAt: new Date('2024-01-15')
			}
		];

		const mockProjects = [
			{ id: 'personal-default', name: 'Personal Actions', icon: 'user', workspaceId: 'personal', order: 1, createdAt: new Date('2024-01-15') },
			{ id: 'household', name: 'Household', icon: 'home', workspaceId: 'personal', order: 2, createdAt: new Date('2024-01-15') },
			{ id: 'finances', name: 'Finances', icon: 'building', workspaceId: 'personal', order: 3, createdAt: new Date('2024-01-15') },
			{ id: 'health', name: 'Health', icon: 'activity', workspaceId: 'personal', order: 4, createdAt: new Date('2024-01-15') },
		];

		// Tasks for personal-default project
		const mockTasks = [
			{
				id: '3',
				title: 'Call insurance company',
				description: '',
				completed: false,
				perspectiveId: 'first',
				projectId: 'personal-default',
				order: 1,
				createdAt: new Date('2024-01-17'),
				updatedAt: new Date('2024-01-17'),
			},
			{
				id: '32',
				title: 'Watch financial planning webinar',
				description: 'Thursday 7pm',
				completed: false,
				perspectiveId: 'first',
				projectId: 'personal-default',
				order: 2,
				createdAt: new Date('2024-02-15'),
				updatedAt: new Date('2024-02-15'),
			},
			{
				id: '33',
				title: 'Update emergency contact list',
				description: '',
				completed: false,
				perspectiveId: 'inbox',
				projectId: 'personal-default',
				order: 3,
				createdAt: new Date('2024-02-16'),
				updatedAt: new Date('2024-02-16'),
			}
		];

		// Filter tasks for the specific project
		let projectTasks = mockTasks.filter(t => t.projectId === projectId);

		// Apply completion if requested
		if (options?.withCompleted) {
			projectTasks = projectTasks.map((task, index) => ({
				...task,
				completed: index % 2 === 0 // Complete every other task
			}));
		}

		return {
			workspaces: mockWorkspaces,
			projects: mockProjects,
			tasks: projectTasks
		};
	},

	/**
	 * Full mock data state
	 */
	full: () => {
		// We'll implement this later - for now return minimal state
		return stateBuilder.forProject('personal-default');
	},

	/**
	 * Empty state - just workspace structure
	 */
	empty: () => {
		const state = stateBuilder.forProject('personal-default');
		return {
			...state,
			tasks: []
		};
	}
};

