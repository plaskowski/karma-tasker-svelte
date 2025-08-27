import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('All perspective - full state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Navigate to the app with default mock data
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on All perspective in sidebar
	await page.click('button:has-text("All"):first-of-type');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('all-full.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});