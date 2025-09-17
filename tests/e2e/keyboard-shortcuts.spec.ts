import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Keyboard Shortcuts', () => {
	let taskManager: TaskManagerPage;

	test.beforeEach(async ({ page }) => {
		taskManager = new TaskManagerPage(page);
		await taskManager.goto();
	});

	test('Open new task editor with N key', async ({ page }) => {
		// Focus the main content area that has the keyboard action
		const mainArea = page.locator('div.flex-1.flex.flex-col.overflow-hidden');
		await mainArea.focus();

		// Press 'n' to open new task editor
		await page.keyboard.press('n');

		// Wait for the task editor panel to appear
		await page.waitForSelector('[role="dialog"][data-testid="task-editor-panel"]', { state: 'visible', timeout: 5000 });

		// Verify task editor is visible
		const titleInput = page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible();

		// Type a task title
		await titleInput.fill('Task created with N shortcut');

		// Save the task
		const saveButton = page.locator('button:has-text("Save")');
		await expect(saveButton).toBeVisible();
		await saveButton.click();

		// Wait for task to be saved and editor to close
		await page.waitForSelector('[role="dialog"][data-testid="task-editor-panel"]', { state: 'hidden', timeout: 5000 });

		// Verify task was created
		await expect(page.locator('text="Task created with N shortcut"')).toBeVisible();
	});


	test('Escape key behavior in task editor', async ({ page }) => {
		// Focus the main content area and open new task editor
		const mainArea = page.locator('div.flex-1.flex.flex-col.overflow-hidden');
		await mainArea.focus();
		await page.keyboard.press('n');

		// Wait for the task editor panel to appear
		await page.waitForSelector('[role="dialog"][data-testid="task-editor-panel"]', { state: 'visible', timeout: 5000 });

		const titleInput = page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible();

		// Type something
		await titleInput.fill('This task will be cancelled');

		// Press Escape to cancel - need to focus the main area again for the escape handler
		await mainArea.focus();
		await page.keyboard.press('Escape');

		// Wait for editor to close
		await page.waitForSelector('[role="dialog"][data-testid="task-editor-panel"]', { state: 'hidden', timeout: 5000 });

		// Verify editor is closed and task not created
		await expect(page.locator('[role="dialog"][data-testid="task-editor-panel"]')).not.toBeVisible();
		await expect(page.locator('text="This task will be cancelled"')).not.toBeVisible();
	});

	test('Escape key behavior in inline editor', async ({ page }) => {
		// First create a task
		await taskManager.createTask('Task to edit inline');
		
		// Wait a bit more to ensure the task is fully created and editor closed
		await page.waitForTimeout(1000);
		
		// Click on task to open inline editor
		await page.locator('text="Task to edit inline"').first().click();
		await page.waitForTimeout(500);
		
		// Verify inline editor is open
		const titleInput = page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible();
		
		// Type changes
		await titleInput.clear();
		await titleInput.fill('Edited but will cancel');
		
		// Press Escape to cancel
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);
		
		// Verify editor is closed and changes not saved
		await expect(titleInput).not.toBeVisible();
		await expect(page.locator('text="Task to edit inline"')).toBeVisible();
		await expect(page.locator('text="Edited but will cancel"')).not.toBeVisible();
	});

	test('Save inline edit with Ctrl+Enter', async ({ page }) => {
		// First create a task
		await taskManager.createTask('Task to save with shortcut');
		
		// Click on task to open inline editor
		await page.locator('text="Task to save with shortcut"').click();
		await page.waitForTimeout(500);
		
		// Edit the title
		const titleInput = page.locator('input[type="text"]').first();
		await titleInput.clear();
		await titleInput.fill('Saved with Ctrl+Enter');
		
		// Save with Ctrl+Enter
		await page.keyboard.down('Control');
		await page.keyboard.press('Enter');
		await page.keyboard.up('Control');
		await page.waitForTimeout(500);
		
		// Verify changes were saved
		await expect(page.locator('text="Saved with Ctrl+Enter"')).toBeVisible();
		await expect(page.locator('text="Task to save with shortcut"')).not.toBeVisible();
	});

});