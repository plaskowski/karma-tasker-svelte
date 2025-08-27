import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('First perspective - empty state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Override mock data to return empty tasks
	await page.addInitScript(() => {
		(window as any).__MOCK_TASKS__ = [];
	});
	
	// Navigate to the app
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on First perspective in sidebar
	await page.click('button:has-text("First")');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('first-empty.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});