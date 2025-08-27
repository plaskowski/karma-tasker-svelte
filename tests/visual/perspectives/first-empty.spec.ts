import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('First perspective - empty state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'First perspective - empty state',
		screenshotName: 'first-empty.png',
		options: { perspective: 'First', emptyState: true }
	});
});