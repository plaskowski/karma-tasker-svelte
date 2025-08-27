import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Workspace Switching', () => {
	let taskManager: TaskManagerPage;

	test.beforeEach(async ({ page }) => {
		taskManager = new TaskManagerPage(page);
		await taskManager.goto();
	});

	test('Switch workspaces using dropdown', async ({ page }) => {
		// Click on workspace selector
		const workspaceSelector = page.locator('[title*="workspace"]').first();
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		
		// Switch to Work workspace
		await page.locator('text="Work"').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('workspace=work');
		
		// Click on workspace selector again
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		
		// Switch to Hobby workspace
		await page.locator('text="Hobby"').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('workspace=hobby');
		
		// Switch back to Personal
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		await page.locator('text="Personal"').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('workspace=personal');
	});

	test('Switch workspaces using keyboard shortcuts', async ({ page }) => {
		// Press Ctrl+1 for Personal (should stay on Personal)
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
		
		// Go back to Personal
		await page.keyboard.down('Control');
		await page.keyboard.press('1');
		await page.keyboard.up('Control');
		await page.waitForTimeout(500);
		expect(page.url()).toContain('workspace=personal');
	});

	test('Workspace-specific task filtering', async ({ page }) => {
		// Create a task in Personal workspace
		await taskManager.createTask('Personal Task');
		
		// Switch to Work workspace
		const workspaceSelector = page.locator('[title*="workspace"]').first();
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		await page.locator('text="Work"').click();
		await page.waitForTimeout(500);
		
		// Verify Personal task is not visible
		await expect(page.locator('text="Personal Task"')).not.toBeVisible();
		
		// Create a task in Work workspace
		await taskManager.createTask('Work Task');
		
		// Verify Work task is visible
		await expect(page.locator('text="Work Task"')).toBeVisible();
		
		// Switch to Hobby workspace
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		await page.locator('text="Hobby"').click();
		await page.waitForTimeout(500);
		
		// Verify neither task is visible
		await expect(page.locator('text="Personal Task"')).not.toBeVisible();
		await expect(page.locator('text="Work Task"')).not.toBeVisible();
		
		// Create a task in Hobby workspace
		await taskManager.createTask('Hobby Task');
		
		// Switch back to Personal
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		await page.locator('text="Personal"').click();
		await page.waitForTimeout(500);
		
		// Verify only Personal task is visible
		await expect(page.locator('text="Personal Task"')).toBeVisible();
		await expect(page.locator('text="Work Task"')).not.toBeVisible();
		await expect(page.locator('text="Hobby Task"')).not.toBeVisible();
	});

	test('Perspective availability per workspace', async ({ page }) => {
		// In Personal workspace, verify available perspectives
		const personalPerspectives = ['Inbox', 'Next', 'Waiting', 'Scheduled', 'Someday'];
		for (const perspective of personalPerspectives) {
			await expect(page.locator(`button:has-text("${perspective}")`)).toBeVisible();
		}
		
		// Switch to Work workspace
		const workspaceSelector = page.locator('[title*="workspace"]').first();
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		await page.locator('text="Work"').click();
		await page.waitForTimeout(500);
		
		// Verify Work workspace perspectives (might be different)
		// For now, assuming same perspectives
		for (const perspective of personalPerspectives) {
			await expect(page.locator(`button:has-text("${perspective}")`)).toBeVisible();
		}
	});

	test('URL state persistence when switching workspaces', async ({ page }) => {
		// Navigate to Next perspective
		await page.locator('button:has-text("Next")').click();
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=next');
		
		// Switch to Work workspace
		const workspaceSelector = page.locator('[title*="workspace"]').first();
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		await page.locator('text="Work"').click();
		await page.waitForTimeout(500);
		
		// Verify workspace changed but perspective is maintained
		expect(page.url()).toContain('workspace=work');
		expect(page.url()).toContain('perspective=next');
		
		// Navigate to Waiting perspective
		await page.locator('button:has-text("Waiting")').click();
		await page.waitForTimeout(500);
		
		// Switch back to Personal
		await workspaceSelector.click();
		await page.waitForTimeout(300);
		await page.locator('text="Personal"').click();
		await page.waitForTimeout(500);
		
		// Verify workspace changed and perspective is maintained
		expect(page.url()).toContain('workspace=personal');
		expect(page.url()).toContain('perspective=waiting');
	});
});