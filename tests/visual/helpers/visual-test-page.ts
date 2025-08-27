import { type Page, expect } from '@playwright/test';
import { 
	prepareForScreenshot,
	setupEmptyState,
	buildAppUrl,
	waitForAppReady,
	SCREENSHOT_OPTIONS
} from './test-utils';

/**
 * Page Object for Visual Tests
 * Encapsulates all visual testing functionality
 */
export class VisualTestPage {
	constructor(private page: Page) {}

	/**
	 * Navigate to a specific view using URL parameters
	 */
	async navigateTo(options?: {
		workspace?: string;
		perspective?: string;
		projectView?: 'all' | 'single';
		projectName?: string;
	}) {
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
		
		await this.page.goto(url);
		await waitForAppReady(this.page);
	}

	/**
	 * Set up the page for visual testing
	 */
	async setup(options?: {
		emptyState?: boolean;
		withCompleted?: boolean;
		workspace?: string;
		perspective?: string;
		projectView?: 'all' | 'single';
		projectName?: string;
	}) {
		// Set up deterministic environment
		await prepareForScreenshot(this.page);
		
		// Set up empty state if requested
		if (options?.emptyState) {
			await setupEmptyState(this.page);
			// Navigate to the requested view
			await this.navigateTo({
				workspace: options?.workspace,
				perspective: options?.perspective,
				projectView: options?.projectView,
				projectName: options?.projectName
			});
		} else if (options?.withCompleted) {
			// For completed tasks, navigate first, then complete tasks
			await this.navigateTo({
				workspace: options?.workspace,
				perspective: options?.perspective,
				projectView: options?.projectView,
				projectName: options?.projectName
			});
			// Complete half of the tasks
			await this.completeTasksForView(options?.workspace, options?.perspective);
		} else {
			// Normal navigation
			await this.navigateTo({
				workspace: options?.workspace,
				perspective: options?.perspective,
				projectView: options?.projectView,
				projectName: options?.projectName
			});
		}
	}

	/**
	 * Take a screenshot and compare with baseline
	 */
	async expectScreenshot(name: string) {
		await expect(this.page).toHaveScreenshot(name, SCREENSHOT_OPTIONS);
	}

	/**
	 * Clear all data for empty state testing
	 */
	async clearData() {
		await this.page.evaluate(() => {
			const facade = (window as any).__testingFacade;
			if (facade) {
				facade.clearAllData();
			} else {
				// Fallback
				localStorage.clear();
				localStorage.setItem('karma-tasks-tasks', JSON.stringify([]));
			}
		});
	}

	/**
	 * Complete half of tasks for the current view
	 */
	async completeTasksForView(workspace?: string, perspective?: string) {
		// Complete half of tasks using the facade
		await this.page.evaluate(async ({ ws, persp }) => {
			const facade = (window as any).__testingFacade;
			if (facade && facade.completeHalfOfTasks) {
				await facade.completeHalfOfTasks(ws || 'personal', persp);
			}
		}, { ws: workspace, persp: perspective });
	}

	/**
	 * Wait for the application to be ready
	 */
	async waitForReady() {
		await waitForAppReady(this.page);
	}

	/**
	 * Get the current URL parameters
	 */
	async getCurrentUrlParams(): Promise<URLSearchParams> {
		const url = new URL(this.page.url());
		return url.searchParams;
	}

	/**
	 * Verify we're on the expected view
	 */
	async verifyView(expectedView: {
		workspace?: string;
		view?: string;
		perspective?: string;
		project?: string;
	}) {
		const params = await this.getCurrentUrlParams();
		
		if (expectedView.workspace) {
			expect(params.get('workspace')).toBe(expectedView.workspace);
		}
		if (expectedView.view) {
			expect(params.get('view')).toBe(expectedView.view);
		}
		if (expectedView.perspective) {
			expect(params.get('perspective')).toBe(expectedView.perspective);
		}
		if (expectedView.project) {
			expect(params.get('project')).toBe(expectedView.project);
		}
	}


}