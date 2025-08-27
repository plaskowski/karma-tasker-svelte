import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Search - with results', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Navigate to the app
	await page.goto('/');
	await waitForAppReady(page);
	
	// Search for "client"
	await page.fill('input[placeholder*="Search"], input[type="search"]', 'client');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('search-with-results.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});