import { test } from '@playwright/test';
import { VisualTestPage } from '../../helpers/visual-test-page';

test('Inbox perspective - full state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup();
	await visualTest.expectScreenshot('inbox-full.png');
});