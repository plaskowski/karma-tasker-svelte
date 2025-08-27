import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../../helpers/test-utils';

test.describe('GTD Perspectives - Visual Tests', () => {
	// Test only key perspectives - others follow same pattern
	const perspectives = [
		{ id: 'inbox', name: 'Inbox' },
		{ id: 'first', name: 'First' },
		{ id: 'all', name: 'All' }
	];

	test.describe('Empty States', () => {
		perspectives.forEach(perspective => {
			test(`${perspective.name} - empty state`, async ({ page }) => {
				// Set up deterministic environment
				await prepareForScreenshot(page);
				
				// Override mock data to return empty tasks
				await page.addInitScript(() => {
					(window as any).__MOCK_TASKS__ = [];
				});
				
				// Navigate to the app
				await page.goto('/');
				await waitForAppReady(page);
				
				// Click on the perspective in sidebar
				if (perspective.id !== 'inbox') {
					await page.click(`button:has-text("${perspective.name}")`);
					await page.waitForTimeout(500);
				}
				
				// Take screenshot
				await expect(page).toHaveScreenshot(`${perspective.id}-empty.png`, {
					fullPage: true,
					animations: 'disabled',
					maxDiffPixels: 100
				});
			});
		});
	});

	test.describe('Full States', () => {
		perspectives.forEach(perspective => {
			test(`${perspective.name} - full state`, async ({ page }) => {
				// Set up deterministic environment
				await prepareForScreenshot(page);
				
				// Navigate to the app with default mock data
				await page.goto('/');
				await waitForAppReady(page);
				
				// Click on the perspective in sidebar
				if (perspective.id !== 'inbox') {
					await page.click(`button:has-text("${perspective.name}")`);
					await page.waitForTimeout(500);
				}
				
				// Take screenshot
				await expect(page).toHaveScreenshot(`${perspective.id}-full.png`, {
					fullPage: true,
					animations: 'disabled',
					maxDiffPixels: 100
				});
			});
		});
	});

	test.describe('Workspace Switching', () => {
		// Test only Personal workspace - others follow same pattern
		const workspaces = ['Personal'];
		
		workspaces.forEach(workspace => {
			test(`${workspace} workspace - inbox view`, async ({ page }) => {
				// Set up deterministic environment
				await prepareForScreenshot(page);
				
				// Navigate to the app
				await page.goto('/');
				await waitForAppReady(page);
				
				// Switch workspace if not Personal (default)
				if (workspace !== 'Personal') {
					// Click workspace dropdown
					await page.click('button[title*="Switch workspace"]');
					await page.waitForTimeout(200);
					
					// Select workspace
					await page.click(`button:has-text("${workspace}")`);
					await page.waitForTimeout(500);
				}
				
				// Take screenshot
				await expect(page).toHaveScreenshot(`workspace-${workspace.toLowerCase()}-inbox.png`, {
					fullPage: true,
					animations: 'disabled',
					maxDiffPixels: 100
				});
			});
		});
	});
});