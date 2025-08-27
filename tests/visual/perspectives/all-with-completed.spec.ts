import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('All view - with completed tasks', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({
		withCompleted: true,
		perspective: 'All'
	});
	await visualTest.expectScreenshot('all-with-completed.png');
});