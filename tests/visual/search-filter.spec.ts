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

});