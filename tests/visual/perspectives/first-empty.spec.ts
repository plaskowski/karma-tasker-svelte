import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('First perspective - empty state', async ({ page }) => {
	// Setup: Navigate to First perspective with empty data
	await setupVisualTest(page, { emptyState: true, perspective: 'First' });
	
	// Take screenshot
	await expectScreenshot(page, 'first-empty.png');
});