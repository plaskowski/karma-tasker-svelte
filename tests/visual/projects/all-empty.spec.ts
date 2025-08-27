import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('All Projects - empty state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Clear localStorage to ensure empty state
	await page.addInitScript(() => {
		localStorage.clear();
		// Set empty tasks in localStorage
		localStorage.setItem('karma-tasks-tasks', JSON.stringify([]));
	});
	
	// Navigate to the app
	await page.goto('/');
	await waitForAppReady(page);
	
	// Click on All Projects button in sidebar (under Projects section)
	await page.click('button:has-text("All"):last-of-type');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('all-empty.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});