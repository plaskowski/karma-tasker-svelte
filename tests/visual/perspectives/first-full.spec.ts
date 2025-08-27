import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('First perspective - full state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Navigate to the app with default mock data
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on First perspective in sidebar
	await page.click('button:has-text("First")');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('first-full.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});