import { test } from '@playwright/test';
import { VisualTestPage } from '../helpers/visual-test-page';

test('All Projects - empty state', async ({ page }) => {
	const visualTest = new VisualTestPage(page);
	await visualTest.setup({ projectView: 'all', emptyState: true });
	await visualTest.expectScreenshot('all-empty.png');
});