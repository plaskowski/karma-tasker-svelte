import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('First perspective - full state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'First perspective - full state',
		screenshotName: 'first-full.png',
		options: { perspective: 'First' }
	});
});