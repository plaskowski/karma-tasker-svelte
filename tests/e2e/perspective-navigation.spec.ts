import { test, expect } from '@playwright/test';
import { TaskManagerPage } from './pages/TaskManagerPage';

test.describe('Perspective Navigation', () => {
	let taskManager: TaskManagerPage;

	test.beforeEach(async ({ page }) => {
		taskManager = new TaskManagerPage(page);
		await taskManager.goto();
	});

	test('Switch between perspectives using sidebar', async ({ page }) => {
		// Wait for full page load
		await page.waitForLoadState('networkidle');
		
		// Click on First perspective
		await page.locator('button:has-text("First")').click();
		
		// Wait for navigation to complete - look for URL change
		await page.waitForFunction(() => {
			return window.location.search.includes('perspective=first');
		}, { timeout: 5000 });
		
		// Verify URL updated
		expect(page.url()).toContain('view=perspective');
		expect(page.url()).toContain('perspective=first');
		
		// Click on Next perspective
		await page.locator('button:has-text("Next")').click();
		
		// Wait for URL to update
		await page.waitForFunction(() => {
			return window.location.search.includes('perspective=next');
		}, { timeout: 5000 });
		
		// Verify URL updated
		expect(page.url()).toContain('perspective=next');
		
		// Click on Someday perspective
		await page.locator('button:has-text("Someday")').click();
		
		await page.waitForFunction(() => {
			return window.location.search.includes('perspective=someday');
		}, { timeout: 5000 });
		
		// Verify URL updated
		expect(page.url()).toContain('perspective=someday');
		
		// Go back to Inbox
		await page.locator('button:has-text("Inbox")').click();
		
		await page.waitForFunction(() => {
			return window.location.search.includes('perspective=inbox');
		}, { timeout: 5000 });
		
		// Verify URL updated
		expect(page.url()).toContain('perspective=inbox');
	});

	test('Switch to All view', async ({ page }) => {
		// Click on All view (in Views section, not Projects)
		const viewsSection = page.locator('h3:has-text("Views")').locator('..');
		await viewsSection.locator('button:has-text("All")').click();
		
		// Wait for navigation to complete
		await page.waitForFunction(() => {
			return window.location.search.includes('view=all');
		}, { timeout: 5000 });
		
		// Verify URL updated to show all view
		expect(page.url()).toContain('view=all');
		
		// Verify perspective badges are visible in All view
		// In the All view, tasks show their perspective assignment
		await expect(page.getByTestId('badge').first()).toBeVisible();
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
		const viewsSection = page.locator('h3:has-text("Views")').locator('..');
		await viewsSection.locator('button:has-text("All")').click();
		await page.waitForTimeout(500);
		
		// Verify both tasks are visible
		await expect(page.locator('text="Inbox Task"')).toBeVisible();
		await expect(page.locator('text="Next Task"')).toBeVisible();
	});
});