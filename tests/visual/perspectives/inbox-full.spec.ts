import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('Inbox perspective - full state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'Inbox perspective - full state',
		screenshotName: 'inbox-full.png'
	});
});