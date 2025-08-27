import { test, expect } from '@playwright/test';
import { navigateToApp } from '../helpers/test-utils';

test.describe('Task Management Flow', () => {
	test('Create a new task', async ({ page }) => {
		await navigateToApp(page);
		
		// Open new task dialog
		await page.keyboard.press('n');
		await page.waitForSelector('dialog, [role="dialog"]', { state: 'visible' });
		
		// Fill in task details
		await page.fill('input[name="title"], input[placeholder*="title"]', 'Test task from E2E');
		await page.fill('textarea[name="description"], textarea[placeholder*="description"]', 'This is a test description');
		
		// Select perspective if available
		const perspectiveSelect = page.locator('select[name="perspective"], [data-testid="perspective-select"]');
		if (await perspectiveSelect.count() > 0) {
			await perspectiveSelect.selectOption('next');
		}
		
		// Save the task
		await page.click('button:has-text("Save"), button:has-text("Create")');
		
		// Verify task appears in the list
		await expect(page.locator('text=Test task from E2E')).toBeVisible();
		
		// Take screenshot for documentation
		await page.screenshot({ 
			path: 'tests/e2e/__steps__/task-management/01-task-created.png',
			fullPage: true 
		});
	});

	test('Edit an existing task', async ({ page }) => {
		await navigateToApp(page);
		
		// Find the first task and double-click to edit
		const firstTask = page.locator('.task-item').first();
		await firstTask.dblclick();
		
		// Wait for edit mode
		await page.waitForTimeout(300);
		
		// Update the title
		const titleInput = page.locator('input[name="title"]:visible, input[value*=""]:visible').first();
		await titleInput.clear();
		await titleInput.fill('Updated task title');
		
		// Save changes (usually Enter or blur)
		await page.keyboard.press('Enter');
		await page.waitForTimeout(500);
		
		// Verify the update
		await expect(page.locator('text=Updated task title')).toBeVisible();
		
		// Take screenshot
		await page.screenshot({ 
			path: 'tests/e2e/__steps__/task-management/02-task-edited.png',
			fullPage: true 
		});
	});

	test('Complete a task', async ({ page }) => {
		await navigateToApp(page);
		
		// Find an incomplete task
		const taskCheckbox = page.locator('.task-item input[type="checkbox"]:not(:checked)').first();
		
		// Complete the task
		await taskCheckbox.check();
		await page.waitForTimeout(500);
		
		// Verify task is marked as completed
		await expect(taskCheckbox).toBeChecked();
		
		// The task might be hidden or struck through
		const completedTask = page.locator('.task-item:has(input[type="checkbox"]:checked)').first();
		await expect(completedTask).toHaveClass(/completed|done|checked/);
		
		// Take screenshot
		await page.screenshot({ 
			path: 'tests/e2e/__steps__/task-management/03-task-completed.png',
			fullPage: true 
		});
	});

	test('Delete a task', async ({ page }) => {
		await navigateToApp(page);
		
		// Get the initial task count
		const initialCount = await page.locator('.task-item').count();
		
		// Right-click on the first task for context menu
		const firstTask = page.locator('.task-item').first();
		await firstTask.click({ button: 'right' });
		
		// Click delete option
		await page.click('text=/delete|remove/i');
		
		// Confirm deletion if there's a dialog
		const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
		if (await confirmButton.count() > 0) {
			await confirmButton.click();
		}
		
		await page.waitForTimeout(500);
		
		// Verify task count decreased
		const finalCount = await page.locator('.task-item').count();
		expect(finalCount).toBeLessThan(initialCount);
		
		// Take screenshot
		await page.screenshot({ 
			path: 'tests/e2e/__steps__/task-management/04-task-deleted.png',
			fullPage: true 
		});
	});

	test('Bulk task operations', async ({ page }) => {
		await navigateToApp(page);
		
		// Select multiple tasks using checkboxes or multi-select
		const tasks = page.locator('.task-item');
		const taskCount = await tasks.count();
		
		if (taskCount >= 3) {
			// Select first 3 tasks
			for (let i = 0; i < 3; i++) {
				// Ctrl/Cmd click to multi-select
				await tasks.nth(i).click({ modifiers: ['Control'] });
			}
			
			await page.waitForTimeout(300);
			
			// Look for bulk action menu
			const bulkActions = page.locator('[data-testid="bulk-actions"], button:has-text("Actions")');
			if (await bulkActions.count() > 0) {
				await bulkActions.click();
				
				// Select a bulk action (e.g., move to perspective)
				await page.click('text=/move|change perspective/i');
				await page.click('text=Someday');
				
				await page.waitForTimeout(500);
			}
		}
		
		// Take screenshot
		await page.screenshot({ 
			path: 'tests/e2e/__steps__/task-management/05-bulk-operations.png',
			fullPage: true 
		});
	});

	test('Reorder tasks with drag and drop', async ({ page }) => {
		await navigateToApp(page);
		
		// Get the first two tasks
		const firstTask = page.locator('.task-item').first();
		const secondTask = page.locator('.task-item').nth(1);
		
		// Get initial text to verify reorder
		const firstText = await firstTask.textContent();
		const secondText = await secondTask.textContent();
		
		// Drag first task below second task
		await firstTask.dragTo(secondTask);
		await page.waitForTimeout(500);
		
		// Verify order changed
		const newFirstTask = page.locator('.task-item').first();
		const newFirstText = await newFirstTask.textContent();
		
		// The original second task should now be first
		expect(newFirstText).toBe(secondText);
		
		// Take screenshot
		await page.screenshot({ 
			path: 'tests/e2e/__steps__/task-management/06-tasks-reordered.png',
			fullPage: true 
		});
	});
});