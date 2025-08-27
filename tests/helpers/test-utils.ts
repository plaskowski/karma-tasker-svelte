import { Page, expect } from '@playwright/test';

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
		const originalSetInterval = window.setInterval;
		
		(window as any).setTimeout = (fn: Function, delay?: number) => {
			if (delay === 0 || delay === 1) {
				return originalSetTimeout(fn, delay);
			}
			// Run immediately for testing
			Promise.resolve().then(() => fn());
			return Math.random();
		};
		
		(window as any).setInterval = (fn: Function, delay?: number) => {
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
 * Set up mock mode for the application
 */
export async function enableMockMode(page: Page) {
	// Set environment flag for mock mode
	await page.addInitScript(() => {
		(window as any).__MOCK_MODE__ = true;
		localStorage.setItem('mockMode', 'true');
	});
}

/**
 * Prepare page for screenshot testing
 */
export async function prepareForScreenshot(page: Page) {
	await freezeTime(page);
	await seedRandom(page);
	await enableMockMode(page);
}

/**
 * Navigate and wait for app to be ready
 */
export async function navigateToApp(page: Page, path: string = '/') {
	await prepareForScreenshot(page);
	await page.goto(path);
	await waitForAppReady(page);
}

/**
 * Take a screenshot with consistent settings
 */
export async function takeScreenshot(page: Page, name: string) {
	// Ensure we're at the top of the page
	await page.evaluate(() => window.scrollTo(0, 0));
	
	// Hide cursors and selections
	await page.evaluate(() => {
		const style = document.createElement('style');
		style.textContent = `
			* {
				cursor: none !important;
				caret-color: transparent !important;
			}
			::selection {
				background: transparent !important;
			}
		`;
		document.head.appendChild(style);
	});
	
	// Take the screenshot
	const screenshot = await page.screenshot({
		fullPage: true,
		animations: 'disabled'
	});
	
	return screenshot;
}

/**
 * Set up for empty state tests by clearing localStorage
 */
export async function setupEmptyState(page: Page) {
	await page.addInitScript(() => {
		localStorage.clear();
		// Set empty tasks in localStorage
		localStorage.setItem('karma-tasks-tasks', JSON.stringify([]));
		// Keep default projects and workspaces if needed
	});
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
 * Standard screenshot options for visual tests
 */
export const SCREENSHOT_OPTIONS = {
	fullPage: true,
	animations: 'disabled' as const,
	maxDiffPixels: 100
} as const;

/**
 * Setup and navigate for a visual test
 */
export async function setupVisualTest(page: Page, options?: {
	workspace?: string;
	perspective?: string;
	projectView?: 'all' | 'single';
	projectName?: string;
	emptyState?: boolean;
}) {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Set up empty state if requested
	if (options?.emptyState) {
		await setupEmptyState(page);
	}
	
	// Build URL based on options
	let url: string;
	
	if (options?.perspective === 'All') {
		// "All" is a special view type, not a perspective
		url = buildAppUrl({
			workspace: options.workspace || 'personal',
			view: 'all'
		});
	} else if (options?.perspective) {
		// Regular perspective view
		url = buildAppUrl({
			workspace: options.workspace || 'personal',
			view: 'perspective',
			perspective: options.perspective.toLowerCase()
		});
	} else if (options?.projectView === 'all') {
		// All projects view
		url = buildAppUrl({
			workspace: options.workspace || 'personal',
			view: 'project-all'
		});
	} else if (options?.projectView === 'single' && options?.projectName) {
		// Single project view - map project names to their IDs
		let projectId = options.projectName.toLowerCase();
		if (options.projectName === 'Personal Default') {
			projectId = 'personal-default';
		}
		url = buildAppUrl({
			workspace: options.workspace || 'personal',
			view: 'project',
			project: projectId
		});
	} else {
		// Default navigation
		url = buildAppUrl({
			workspace: options?.workspace || 'personal'
		});
	}
	
	// Navigate to the app with the constructed URL
	await page.goto(url);
	await waitForAppReady(page);
}

/**
 * Take a visual test screenshot with standard options
 */
export async function expectScreenshot(page: Page, name: string) {
	await expect(page).toHaveScreenshot(name, SCREENSHOT_OPTIONS);
}