import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('Single Project - full state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ projectView: 'single', projectName: 'Personal Default' });
	await visualTest.expectScreenshot('single-full.png');
});