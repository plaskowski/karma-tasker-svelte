import { test } from '@playwright/test';
import { VisualTestPage } from '../../helpers/visual-test-page';

test('First perspective - empty state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ perspective: 'First', emptyState: true });
	await visualTest.expectScreenshot('first-empty.png');
});