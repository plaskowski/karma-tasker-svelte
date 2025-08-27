import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('All projects view - with completed tasks', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({
		withCompleted: true,
		projectView: 'all'
	});
	await visualTest.expectScreenshot('all-projects-with-completed.png');
});