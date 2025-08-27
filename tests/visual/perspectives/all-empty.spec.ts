import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('All perspective - empty state', async ({ page }) => {
	// Setup: Navigate to All perspective with empty data
	await setupVisualTest(page, { perspective: 'All', emptyState: true });
	
	// Take screenshot
	await expectScreenshot(page, 'all-empty.png');
});