import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../helpers/test-utils';

test.describe('Settings and Preferences - Visual Tests', () => {
	test('Theme - dark mode', async ({ page }) => {
		// Set up deterministic environment with dark theme (default)
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('theme-dark.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});
});