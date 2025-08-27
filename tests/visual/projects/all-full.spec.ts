import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('All Projects - full state', async ({ page }) => {
	// Setup: Navigate to All Projects view with default data
	await setupVisualTest(page, { projectView: 'all' });
	
	// Take screenshot
	await expectScreenshot(page, 'all-full.png');
});