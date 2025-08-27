import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('Single project view - with completed tasks', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({
		withCompleted: true,
		projectView: 'single',
		projectName: 'Personal Default'
	});
	await visualTest.expectScreenshot('single-project-with-completed.png');
});