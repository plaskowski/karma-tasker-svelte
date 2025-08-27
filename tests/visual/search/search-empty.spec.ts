import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Search - no results', async ({ page }) => {
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