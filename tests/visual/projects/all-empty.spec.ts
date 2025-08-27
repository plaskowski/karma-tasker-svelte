import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('All Projects - empty state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'All Projects - empty state',
		screenshotName: 'all-empty.png',
		options: { projectView: 'all', emptyState: true }
	});
});