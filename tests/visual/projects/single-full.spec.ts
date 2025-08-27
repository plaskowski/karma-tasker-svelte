import { test } from '@playwright/test';
import { runVisualTest } from '../../helpers/test-utils';

test('Single Project - full state', async ({ page }) => {
	await runVisualTest(page, {
		name: 'Single Project - full state',
		screenshotName: 'single-full.png',
		options: { projectView: 'single', projectName: 'Personal Default' }
	});
});