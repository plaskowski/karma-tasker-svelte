import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('All Projects - empty state', async ({ page }) => {
	await setupVisualTest(page, { emptyState: true, projectView: 'all' });
	await expectScreenshot(page, 'all-empty.png');
});