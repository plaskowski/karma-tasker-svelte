import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../helpers/test-utils';

test.describe('Task Interactions - Visual Tests', () => {
	test('Task detail modal', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Click on the first task to open detail modal
		await page.click('.task-item >> nth=0');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('task-detail-modal.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Task edit mode', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Double-click on the first task to enter edit mode
		await page.dblclick('.task-item >> nth=0');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('task-edit-inline.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('New task dialog', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Click on the new task button (assuming it's a + button or "New Task")
		await page.keyboard.press('n'); // Common keyboard shortcut
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('new-task-dialog.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Task with hover state', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Hover over the first task
		await page.hover('.task-item >> nth=0');
		await page.waitForTimeout(200);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('task-hover-state.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Completed tasks view', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Show completed tasks (if there's a toggle)
		const completedToggle = page.locator('text=/show.*completed/i');
		if (await completedToggle.count() > 0) {
			await completedToggle.click();
			await page.waitForTimeout(500);
		}
		
		// Take screenshot
		await expect(page).toHaveScreenshot('completed-tasks.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Task context menu', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Right-click on the first task to show context menu
		await page.click('.task-item >> nth=0', { button: 'right' });
		await page.waitForTimeout(300);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('task-context-menu.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});
});