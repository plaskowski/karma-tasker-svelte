import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('All perspective - empty state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Override mock data to return empty tasks
	await page.addInitScript(() => {
		(window as any).__MOCK_TASKS__ = [];
	});
	
	// Navigate to the app
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on All perspective in sidebar
	await page.click('button:has-text("All"):first-of-type');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('all-empty.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});