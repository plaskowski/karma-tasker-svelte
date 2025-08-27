import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Task Management Flow', () => {
	let taskManager: TaskManagerPage;

	test.beforeEach(async ({ page }) => {
		taskManager = new TaskManagerPage(page);
		await taskManager.goto();
	});

	test('Create a new task', async () => {
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

	test('Edit an existing task', async () => {
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

	test('Complete a task', async () => {
		// Create a task to complete
		await taskManager.createTask('Task to complete');
		
		// Complete the task
		await taskManager.completeTask('Task to complete');
		
		// Take screenshot
		await taskManager.screenshot('tests/e2e/__steps__/task-management/03-task-completed.png');
	});
});