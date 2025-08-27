import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../helpers/test-utils';

test.describe('Search and Filter - Visual Tests', () => {
	test('Search bar empty state', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Focus on search bar
		await page.click('input[placeholder*="Search"], input[type="search"]');
		await page.waitForTimeout(200);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('search-empty.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Search with results', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Search for "client"
		await page.fill('input[placeholder*="Search"], input[type="search"]', 'client');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('search-results.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Search with no results', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Search for something that won't match
		await page.fill('input[placeholder*="Search"], input[type="search"]', 'xyzabc123');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('search-no-results.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Filter panel expanded', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Look for filter button and click it
		const filterButton = page.locator('button:has-text("Filter"), [aria-label*="Filter"]');
		if (await filterButton.count() > 0) {
			await filterButton.click();
			await page.waitForTimeout(500);
		}
		
		// Take screenshot
		await expect(page).toHaveScreenshot('filter-panel-expanded.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Multiple filters applied', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Apply search filter
		await page.fill('input[placeholder*="Search"], input[type="search"]', 'review');
		await page.waitForTimeout(300);
		
		// If there are filter checkboxes, check some
		const projectFilters = page.locator('input[type="checkbox"][name*="project"]');
		if (await projectFilters.count() > 0) {
			await projectFilters.first().check();
		}
		
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('multiple-filters.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Clear filters button', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Apply a filter first
		await page.fill('input[placeholder*="Search"], input[type="search"]', 'task');
		await page.waitForTimeout(300);
		
		// Look for clear filters button
		const clearButton = page.locator('button:has-text("Clear"), button[aria-label*="Clear"]');
		if (await clearButton.count() > 0) {
			// Hover over clear button to show its state
			await clearButton.hover();
			await page.waitForTimeout(200);
		}
		
		// Take screenshot
		await expect(page).toHaveScreenshot('clear-filters.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});
});