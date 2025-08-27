import { test } from '@playwright/test';
import { VisualTestPage } from '../../helpers/visual-test-page';

test('All perspective - empty state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ perspective: 'All', emptyState: true });
	await visualTest.expectScreenshot('all-empty.png');
});