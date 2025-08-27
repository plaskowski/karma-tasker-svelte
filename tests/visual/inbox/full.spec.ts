import { test, expect } from '@playwright/test';
import { prepareForScreenshot } from '../../helpers/test-utils';

test('Inbox - full state', async ({ page }) => {
	// Set up deterministic environment first
	await prepareForScreenshot(page);
	
	// Navigate to the app - this loads with default mock data
	await page.goto('/');
	
	// Wait for app to fully load
	await page.waitForLoadState('networkidle');
	
	// Wait a bit more for any animations or async updates
	await page.waitForTimeout(1000);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('inbox-full.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});