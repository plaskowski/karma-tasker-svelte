import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../helpers/test-utils';

test.describe('Projects - Visual Tests', () => {
	test('All Projects view - empty state', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Override mock data to return empty tasks
		await page.addInitScript(() => {
			(window as any).__MOCK_TASKS__ = [];
		});
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Click on All Projects in sidebar
		await page.click('text=Projects').first();
		await page.click('button:has-text("All"):last-of-type');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('all-projects-empty.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('All Projects view - full state', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app with default mock data
		await page.goto('/');
		await waitForAppReady(page);
		
		// Click on All Projects in sidebar
		await page.click('text=Projects').first();
		await page.click('button:has-text("All"):last-of-type');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('all-projects-full.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Single Project view', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Click on first available project
		const firstProject = page.locator('.sidebar button:has-text("Personal Default"), .sidebar button[class*="project"]').first();
		if (await firstProject.count() > 0) {
			await firstProject.click();
			await page.waitForTimeout(500);
		}
		
		// Take screenshot
		await expect(page).toHaveScreenshot('project-single-view.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Projects with filters applied', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Go to All Projects view
		await page.click('button:has-text("All"):last-of-type');
		await page.waitForTimeout(500);
		
		// Apply a filter (search for "API")
		await page.fill('input[placeholder*="Search"]', 'API');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('projects-filtered.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});
});