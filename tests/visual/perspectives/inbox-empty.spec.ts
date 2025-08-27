import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('Inbox perspective - empty state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ emptyState: true });
	await visualTest.expectScreenshot('inbox-empty.png');
});