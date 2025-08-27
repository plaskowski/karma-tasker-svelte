import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('All Projects - full state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ projectView: 'all' });
	await visualTest.expectScreenshot('all-full.png');
});