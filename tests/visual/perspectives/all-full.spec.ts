import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('All perspective - full state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'All perspective - full state',
		screenshotName: 'all-full.png',
		options: { perspective: 'All' }
	});
});