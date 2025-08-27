import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('All perspective - full state', async ({ page }) => {
	// Setup: Navigate to All perspective with default data
	await setupVisualTest(page, { perspective: 'All' });
	
	// Take screenshot
	await expectScreenshot(page, 'all-full.png');
});