import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Single Project - full state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Navigate to the app with default mock data
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on first available project (Personal Default)
	await page.click('button:has-text("Personal Default")');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('single-project-full.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});