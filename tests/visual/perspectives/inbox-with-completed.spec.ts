import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('Inbox perspective - with completed tasks', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({
		withCompleted: true,
		perspective: 'Inbox'
	});
	await visualTest.expectScreenshot('inbox-with-completed.png');
});