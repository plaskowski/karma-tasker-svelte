import { test, expect } from '@playwright/test';
import { injectTestState, stateBuilder, buildAppUrl, prepareForScreenshot, waitForAppReady, SCREENSHOT_OPTIONS } from '../helpers/test-utils';

test('Single Project - full state', async ({ page }) => {
	// Inject state for Personal Default project
	await prepareForScreenshot(page);
	await injectTestState(page, stateBuilder.forProject('personal-default'));
	
	// Navigate directly to the project view
	const url = buildAppUrl({
		workspace: 'personal',
		view: 'project',
		project: 'personal-default'
	});
	
	await page.goto(url);
	await waitForAppReady(page);
	await expect(page).toHaveScreenshot('single-full.png', SCREENSHOT_OPTIONS);
});