import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test('Review perspective - Work workspace (minimal data)', async ({ page }) => {
	// Set up deterministic environment
	await prepareForScreenshot(page);
	
	// Navigate to the app
	await page.goto('/');
	await waitForAppReady(page);
	
	// Switch to Work workspace
	await page.click('button[title*="Switch workspace"]');
	await page.waitForTimeout(200);
	await page.click('button:has-text("Work")');
	await page.waitForTimeout(500);
	
	// Click on Review perspective (only 2 tasks)
	await page.click('button:has-text("Review")');
	await page.waitForTimeout(500);
	
	// Take screenshot
	await expect(page).toHaveScreenshot('review-minimal.png', {
		fullPage: true,
		animations: 'disabled',
		maxDiffPixels: 100
	});
});