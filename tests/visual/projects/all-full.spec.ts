import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('All Projects - full state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Navigate to the app with default mock data
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on All Projects button in sidebar (under Projects section)
	await page.click('button:has-text("All"):last-of-type');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('all-projects-full.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});