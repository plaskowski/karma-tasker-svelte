import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Single Project - empty state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Override mock data to return empty tasks
	await page.addInitScript(() => {
		(window as any).__MOCK_TASKS__ = [];
	});
	
	// Navigate to the app
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on first available project (Personal Default)
	await page.click('button:has-text("Personal Default")');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('single-project-empty.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});