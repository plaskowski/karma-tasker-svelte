import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('Inbox perspective - empty state', async ({ page }) => {
	// Setup: Navigate to inbox perspective with empty data
	await setupVisualTest(page, { emptyState: true });
	// Inbox is default, no need to navigate
	
	// Take screenshot
	await expectScreenshot(page, 'inbox-empty.png');
});