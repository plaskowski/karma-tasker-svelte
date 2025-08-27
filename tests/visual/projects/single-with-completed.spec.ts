import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('Single project view - with completed tasks', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({
		withCompleted: true,
		workspace: 'hobby',
		projectView: 'single',
		projectName: 'photography'
	});
	await visualTest.expectScreenshot('single-project-with-completed.png');
});