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
 * Prepare page for screenshot testing
 */
export async function prepareForScreenshot(page: Page) {
	await freezeTime(page);
	await seedRandom(page);
}


/**
 * Set up for empty state tests by clearing localStorage
 */
export async function setupEmptyState(page: Page) {
	await page.addInitScript(() => {
		// Use testing facade if available
		const facade = (window as any).__testingFacade;
		if (facade) {
			facade.clearAllData();
		} else {
			// Fallback for immediate execution
			localStorage.clear();
			localStorage.setItem('karma-tasks-tasks', JSON.stringify([]));
		}
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
 * Navigate and wait for app to be ready - used by E2E tests
 */
export async function navigateToApp(page: Page, path: string = '/') {
	await prepareForScreenshot(page);
	await page.goto(path);
	await waitForAppReady(page);
}

