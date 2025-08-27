import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('Next perspective - with completed tasks', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({
		withCompleted: true,
		perspective: 'Next'
	});
	await visualTest.expectScreenshot('next-with-completed.png');
});