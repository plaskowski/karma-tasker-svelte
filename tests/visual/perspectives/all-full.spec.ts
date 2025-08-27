import { test } from '@playwright/test';
import { VisualTestPage } from '../../helpers/visual-test-page';

test('All perspective - full state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ perspective: 'All' });
	await visualTest.expectScreenshot('all-full.png');
});