import { test } from '@playwright/test';
import { VisualTestPage } from '../../helpers/visual-test-page';

test('First perspective - full state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ perspective: 'First' });
	await visualTest.expectScreenshot('first-full.png');
});