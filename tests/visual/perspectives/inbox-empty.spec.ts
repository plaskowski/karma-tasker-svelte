import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Inbox perspective - empty state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Clear localStorage to ensure empty state
	await page.addInitScript(() => {
		localStorage.clear();
		// Set empty tasks in localStorage
		localStorage.setItem('karma-tasks-tasks', JSON.stringify([]));
		// Keep default projects and workspaces
	});
	
	// Navigate to the app (defaults to Inbox perspective)
	await page.goto('/');
	await waitForAppReady(page);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('inbox-empty.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});