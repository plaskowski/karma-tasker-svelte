import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('Inbox perspective - empty state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'Inbox perspective - empty state',
		screenshotName: 'inbox-empty.png',
		options: { emptyState: true }
	});
});