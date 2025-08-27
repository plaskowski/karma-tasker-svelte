import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Inbox perspective - with many tasks', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Navigate to the app with default mock data (defaults to Inbox perspective)
	await page.goto('/');
	await waitForAppReady(page);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('inbox-with-many-tasks.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});