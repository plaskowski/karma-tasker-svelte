import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Inbox perspective - empty state', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Override mock data to return empty tasks
	await page.addInitScript(() => {
		(window as any).__MOCK_TASKS__ = [];
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