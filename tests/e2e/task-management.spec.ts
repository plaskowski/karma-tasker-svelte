import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Task Management Flow', () => {
	test('Create a new task', async ({ page }) => {
		const taskManager = new TaskManagerPage(page);
		await taskManager.goto();
		
		// Create a new task with screenshot after opening editor
		await taskManager.createTask(
			'Test task from E2E', 
			'This is a test description',
			'tests/e2e/__steps__/task-management/01a-new-task-editor.png'
		);
		
		// Verify task exists
		const taskExists = await taskManager.taskExists('Test task from E2E');
		expect(taskExists).toBeTruthy();
		
		// Take screenshot for documentation
		await taskManager.screenshot('tests/e2e/__steps__/task-management/01b-task-created.png');
	});

	test('Edit an existing task', async ({ page }) => {
		const taskManager = new TaskManagerPage(page);
		await taskManager.goto();
		
		// First create a task to edit
		await taskManager.createTask('Task to edit');
		
		// Edit the task with screenshot after opening editor
		await taskManager.editTask(
			'Task to edit', 
			'Updated task title', 
			'Updated description from E2E test',
			'tests/e2e/__steps__/task-management/02a-edit-task-editor.png'
		);
		
		// Verify the task was updated
		const updatedTaskExists = await taskManager.taskExists('Updated task title');
		expect(updatedTaskExists).toBeTruthy();
		
		// Take screenshot
		await taskManager.screenshot('tests/e2e/__steps__/task-management/02b-task-edited.png');
	});

	test('Complete a task', async ({ page }) => {
		const taskManager = new TaskManagerPage(page);
		await taskManager.goto();
		
		// Create a task to complete
		await taskManager.createTask('Task to complete');
		
		// Complete the task
		await taskManager.completeTask('Task to complete');
		
		// Take screenshot
		await taskManager.screenshot('tests/e2e/__steps__/task-management/03-task-completed.png');
	});


	test.skip('Bulk task operations', async ({ page }) => {
		const taskManager = new TaskManagerPage(page);
		await taskManager.goto();
		
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

	test.skip('Reorder tasks with drag and drop', async ({ page }) => {
		const taskManager = new TaskManagerPage(page);
		await taskManager.goto();
		
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