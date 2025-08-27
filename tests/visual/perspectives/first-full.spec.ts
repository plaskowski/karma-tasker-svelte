import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('First perspective - full state', async ({ page }) => {
	// Setup: Navigate to First perspective with default data
	await setupVisualTest(page, { perspective: 'First' });
	
	// Take screenshot
	await expectScreenshot(page, 'first-full.png');
});