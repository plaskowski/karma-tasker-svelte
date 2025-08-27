import { test, expect } from '@playwright/test';
import { navigateToApp, prepareForScreenshot } from '../helpers/test-utils';

test.describe('Inbox Page - Visual Tests', () => {
	// test('empty state', async ({ page }) => {
	// 	// Set up deterministic environment
	// 	await prepareForScreenshot(page);
	// 	
	// 	// Override mock data to return empty tasks
	// 	await page.addInitScript(() => {
	// 		// Override the mock data to be empty
	// 		(window as any).__MOCK_TASKS__ = [];
	// 	});
	// 	
	// 	// Navigate to the app
	// 	await page.goto('/');
	// 	
	// 	// Wait for the app to be fully loaded
	// 	await page.waitForLoadState('networkidle');
	// 	
	// 	// Wait for any loading states to complete
	// 	await page.waitForTimeout(500);
	// 	
	// 	// Take screenshot
	// 	await expect(page).toHaveScreenshot('inbox-empty.png', {
	// 		fullPage: true,
	// 		animations: 'disabled',
	// 		maxDiffPixels: 100
	// 	});
	// });

	test('full state', async ({ page }) => {
		// Set up deterministic environment first
		await prepareForScreenshot(page);
		
		// Navigate to the app - this loads with default mock data
		await page.goto('/');
		
		// Wait for app to fully load
		await page.waitForLoadState('networkidle');
		
		// Wait a bit more for any animations or async updates
		await page.waitForTimeout(1000);
		
		// Debug: Log the page content to see what's rendered
		const bodyText = await page.textContent('body');
		console.log('Page body text:', bodyText?.substring(0, 200));
		
		// Take screenshot
		await expect(page).toHaveScreenshot('inbox-full.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});
});