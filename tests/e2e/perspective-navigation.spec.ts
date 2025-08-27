import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Perspective Navigation', () => {
	let taskManager: TaskManagerPage;

	test.beforeEach(async ({ page }) => {
		taskManager = new TaskManagerPage(page);
		await taskManager.goto();
	});

	test('Switch between GTD perspectives using sidebar', async ({ page }) => {
		// Click on Next perspective
		await page.locator('button:has-text("Next")').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('view=perspective');
		expect(page.url()).toContain('perspective=next');
		
		// Click on Waiting perspective
		await page.locator('button:has-text("Waiting")').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('perspective=waiting');
		
		// Click on Scheduled perspective
		await page.locator('button:has-text("Scheduled")').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('perspective=scheduled');
		
		// Click on Someday perspective
		await page.locator('button:has-text("Someday")').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('perspective=someday');
		
		// Go back to Inbox
		await page.locator('button:has-text("Inbox")').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated
		expect(page.url()).toContain('perspective=inbox');
	});

	test('Switch to All view', async ({ page }) => {
		// Click on All view
		await page.locator('button:has-text("All")').click();
		await page.waitForTimeout(500);
		
		// Verify URL updated to show all view
		expect(page.url()).toContain('view=all');
		
		// Verify perspective badges are visible in All view
		const perspectiveBadges = page.locator('[class*="badge"]').filter({ hasText: /Inbox|Next|Waiting|Scheduled|Someday/ });
		await expect(perspectiveBadges.first()).toBeVisible();
	});

	test('Navigate using keyboard shortcuts', async ({ page }) => {
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

	test('Browser back/forward navigation', async ({ page }) => {
		// Navigate to Next perspective
		await page.locator('button:has-text("Next")').click();
		await page.waitForTimeout(500);
		
		// Navigate to Waiting perspective
		await page.locator('button:has-text("Waiting")').click();
		await page.waitForTimeout(500);
		
		// Go back using browser back button
		await page.goBack();
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=next');
		
		// Go forward using browser forward button
		await page.goForward();
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=waiting');
		
		// Go back twice
		await page.goBack();
		await page.goBack();
		await page.waitForTimeout(500);
		expect(page.url()).toContain('perspective=inbox');
	});

	test('Task filtering by perspective', async ({ page }) => {
		// Create a task in Inbox
		await taskManager.createTask('Inbox Task');
		
		// Navigate to Next perspective
		await page.locator('button:has-text("Next")').click();
		await page.waitForTimeout(500);
		
		// Create a task in Next
		await taskManager.createTask('Next Task');
		
		// Go back to Inbox
		await page.locator('button:has-text("Inbox")').click();
		await page.waitForTimeout(500);
		
		// Verify only Inbox task is visible
		await expect(page.locator('text="Inbox Task"')).toBeVisible();
		await expect(page.locator('text="Next Task"')).not.toBeVisible();
		
		// Go to Next
		await page.locator('button:has-text("Next")').click();
		await page.waitForTimeout(500);
		
		// Verify only Next task is visible
		await expect(page.locator('text="Next Task"')).toBeVisible();
		await expect(page.locator('text="Inbox Task"')).not.toBeVisible();
		
		// Go to All view
		await page.locator('button:has-text("All")').click();
		await page.waitForTimeout(500);
		
		// Verify both tasks are visible
		await expect(page.locator('text="Inbox Task"')).toBeVisible();
		await expect(page.locator('text="Next Task"')).toBeVisible();
	});
});