import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Keyboard Shortcuts', () => {
	let taskManager: TaskManagerPage;

	test.beforeEach(async ({ page }) => {
		taskManager = new TaskManagerPage(page);
		await taskManager.goto();
	});

	test('Open new task editor with N key', async ({ page }) => {
		// Press 'n' to open new task editor
		await page.keyboard.press('n');
		await page.waitForTimeout(500);
		
		// Verify task editor is visible
		const titleInput = page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible();
		await expect(titleInput).toBeFocused();
		
		// Type a task title
		await titleInput.fill('Task created with N shortcut');
		
		// Press Enter to save
		await titleInput.press('Enter');
		await page.waitForTimeout(500);
		
		// Verify task was created
		await expect(page.locator('text="Task created with N shortcut"')).toBeVisible();
	});

	test('Open new task editor with Ctrl+N', async ({ page }) => {
		// Press Ctrl+N to open new task editor
		await page.keyboard.down('Control');
		await page.keyboard.press('n');
		await page.keyboard.up('Control');
		await page.waitForTimeout(500);
		
		// Verify task editor is visible
		const titleInput = page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible();
		await expect(titleInput).toBeFocused();
		
		// Type a task title
		await titleInput.fill('Task created with Ctrl+N');
		
		// Press Enter to save
		await titleInput.press('Enter');
		await page.waitForTimeout(500);
		
		// Verify task was created
		await expect(page.locator('text="Task created with Ctrl+N"')).toBeVisible();
	});

	test('Navigate perspectives with number keys', async ({ page }) => {
		// Press '1' for Inbox
		await page.keyboard.press('1');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=inbox');
		
		// Press '2' for Next
		await page.keyboard.press('2');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=next');
		
		// Press '3' for Waiting
		await page.keyboard.press('3');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=waiting');
		
		// Press '4' for Scheduled
		await page.keyboard.press('4');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=scheduled');
		
		// Press '5' for Someday
		await page.keyboard.press('5');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=someday');
	});

	test('Switch workspaces with Ctrl+number keys', async ({ page }) => {
		// Press Ctrl+1 for Personal
		await page.keyboard.down('Control');
		await page.keyboard.press('1');
		await page.keyboard.up('Control');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('workspace=personal');
		
		// Press Ctrl+2 for Work
		await page.keyboard.down('Control');
		await page.keyboard.press('2');
		await page.keyboard.up('Control');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('workspace=work');
		
		// Press Ctrl+3 for Hobby
		await page.keyboard.down('Control');
		await page.keyboard.press('3');
		await page.keyboard.up('Control');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('workspace=hobby');
	});

	test('Escape key behavior in task editor', async ({ page }) => {
		// Open new task editor
		await page.keyboard.press('n');
		await page.waitForTimeout(500);
		
		const titleInput = page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible();
		
		// Type something
		await titleInput.fill('This task will be cancelled');
		
		// Press Escape to cancel
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);
		
		// Verify editor is closed and task not created
		await expect(titleInput).not.toBeVisible();
		await expect(page.locator('text="This task will be cancelled"')).not.toBeVisible();
	});

	test('Escape key behavior in inline editor', async ({ page }) => {
		// First create a task
		await taskManager.createTask('Task to edit inline');
		
		// Click on task to open inline editor
		await page.locator('text="Task to edit inline"').click();
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

	test('Number key shortcuts disabled when editing', async ({ page }) => {
		// Open new task editor
		await page.keyboard.press('n');
		await page.waitForTimeout(500);
		
		const titleInput = page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible();
		
		// Type numbers - they should appear in the input, not navigate
		await titleInput.fill('Task with numbers 12345');
		
		// Verify we're still in the editor and haven't navigated
		await expect(titleInput).toBeVisible();
		await expect(titleInput).toHaveValue('Task with numbers 12345');
		
		// URL should not have changed to different perspectives
		expect(page.url()).toContain('perspective=inbox');
		
		// Close editor
		await page.keyboard.press('Escape');
	});
});