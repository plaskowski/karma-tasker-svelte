import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('All Projects - full state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'All Projects - full state',
		screenshotName: 'all-full.png',
		options: { projectView: 'all' }
	});
});