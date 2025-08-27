import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('Inbox perspective - full state', async ({ page }) => {
	await setupVisualTest(page);
	await expectScreenshot(page, 'inbox-full.png');
});