import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('All perspective - empty state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'All perspective - empty state',
		screenshotName: 'all-empty.png',
		options: { perspective: 'All', emptyState: true }
	});
});