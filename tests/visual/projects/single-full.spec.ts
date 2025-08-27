import { test } from '@playwright/test';
import { setupVisualTest, expectScreenshot } from '../../helpers/test-utils';

test('Single Project - full state', async ({ page }) => {
	await setupVisualTest(page, { projectView: 'single', projectName: 'Personal Default' });
	await expectScreenshot(page, 'single-full.png');
});