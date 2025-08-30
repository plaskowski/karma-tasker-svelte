import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Task Management Flow', () => {
	let taskManager: TaskManagerPage;
	const screenshotBasePath = 'tests/e2e/__steps__/task-management';

	test.beforeEach(async ({ page }) => {
		taskManager = new TaskManagerPage(page, screenshotBasePath);
		await taskManager.goto();
	});

	test('Create a new task', async () => {
		// Create a new task with screenshot after opening editor
		await taskManager.createTask(
			'Test task from E2E', 
			'This is a test description',
			'01a-new-task-editor.png'
		);
		
		// Verify task exists
		const taskExists = await taskManager.taskExists('Test task from E2E');
		expect(taskExists).toBeTruthy();
		
		// Take screenshot for documentation
		await taskManager.screenshot('01b-task-created.png');
	});

	test('Edit an existing task', async () => {
		// First create a task to edit
		await taskManager.createTask('Task to edit');
		
		// Edit the task with screenshot after opening editor
		await taskManager.editTask(
			'Task to edit', 
			'Updated task title', 
			'Updated description from E2E test',
			'02a-edit-task-editor.png'
		);
		
		// Verify the task was updated
		const updatedTaskExists = await taskManager.taskExists('Updated task title');
		expect(updatedTaskExists).toBeTruthy();
		
		// Take screenshot
		await taskManager.screenshot('02b-task-edited.png');
	});

	test('Complete a task', async () => {
		// Create a task to complete
		await taskManager.createTask('Task to complete');
		
		// Complete the task
		await taskManager.completeTask('Task to complete');
		
		// Take screenshot
		await taskManager.screenshot('03-task-completed.png');
	});

	test('Clear completed tasks', async ({ page }) => {
		// Load mock data first
		await page.evaluate(() => {
			return (window as any).__testingFacade?.loadMockData();
		});
		
		// Reload to reflect data changes
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000); // Give more time for data to load
		
		// Complete half of the tasks using the testing facade
		await page.evaluate(async () => {
			const facade = (window as any).__testingFacade;
			if (facade && facade.completeHalfOfTasks) {
				await facade.completeHalfOfTasks('personal');
			}
		});
		
		// Reload again to show completed tasks
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000); // Give time for completed state to render
		
		// Take screenshot showing tasks with completed ones
		await taskManager.screenshot('04a-tasks-with-completed.png');
		
		// Debug: Check if we can find line-through spans
		const lineThoughElements = await page.locator('span.line-through').count();
		console.log(`Found ${lineThoughElements} line-through elements`);
		
		// Alternative: Look for any completed tasks by checking checkbox state
		const completedCheckboxes = await page.locator('button.rounded-full.bg-blue-500').count();
		console.log(`Found ${completedCheckboxes} completed checkboxes`);
		
		// Verify we have completed tasks before clearing
		const initialCompletedCount = await taskManager.getCompletedTaskCount();
		const hasCompleted = await taskManager.hasCompletedTasks();
		console.log(`Initial completed count: ${initialCompletedCount}, hasCompleted: ${hasCompleted}`);
		
		// If no completed tasks by line-through, check by completed checkboxes instead
		if (initialCompletedCount === 0 && completedCheckboxes > 0) {
			console.log('Using completed checkboxes as indicator instead of line-through');
			expect(completedCheckboxes).toBeGreaterThan(0);
		} else {
			expect(initialCompletedCount).toBeGreaterThan(0);
		}
		
		// Get total task count before clearing
		const initialTaskCount = await taskManager.getTaskCount();
		console.log(`Initial task count: ${initialTaskCount}`);
		
		// Click Clear Completed button
		await taskManager.clearCompleted();
		
		// Wait for the operation to complete
		await page.waitForTimeout(1000);
		
		// Take screenshot after clearing
		await taskManager.screenshot('04b-tasks-after-clear-completed.png');
		
		// Verify completed tasks are gone
		const finalCompletedCount = await taskManager.getCompletedTaskCount();
		const finalCompletedCheckboxes = await page.locator('button.rounded-full.bg-blue-500').count();
		console.log(`Final completed count: ${finalCompletedCount}, final completed checkboxes: ${finalCompletedCheckboxes}`);
		
		expect(finalCompletedCount).toBe(0);
		expect(finalCompletedCheckboxes).toBe(0);
		
		// Verify that incomplete tasks still exist (should be fewer total tasks now)
		const finalTaskCount = await taskManager.getTaskCount();
		console.log(`Final task count: ${finalTaskCount}`);
		expect(finalTaskCount).toBeLessThan(initialTaskCount);
		expect(finalTaskCount).toBeGreaterThan(0);
	});
});