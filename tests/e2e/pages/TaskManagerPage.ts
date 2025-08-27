import { type Page, expect } from '@playwright/test';

/**
 * Page Object for Task Management
 * High-level methods for interacting with tasks
 */
export class TaskManagerPage {
	constructor(
		private page: Page,
		private screenshotBasePath?: string
	) {}

	/**
	 * Navigate to the app
	 */
	async goto() {
		await this.page.goto('/');
		await this.page.waitForLoadState('networkidle');
	}

	/**
	 * Create a new task with given title and optional description
	 */
	async createTask(title: string, description?: string, screenshotName?: string) {
		// Press 'n' to open new task editor
		await this.page.keyboard.press('n');
		await this.page.waitForTimeout(500);
		
		// Take screenshot after opening editor if name provided
		if (screenshotName) {
			await this.screenshot(screenshotName);
		}
		
		// Fill in title
		const titleInput = this.page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible({ timeout: 5000 });
		await titleInput.fill(title);
		
		// Fill in description if provided
		if (description) {
			const descriptionInput = this.page.locator('textarea').first();
			if (await descriptionInput.isVisible()) {
				await descriptionInput.fill(description);
			}
		}
		
		// Save the task - be more specific with the button selector
		const saveButton = this.page.locator('button:has-text("Save")');
		await expect(saveButton).toBeVisible();
		await saveButton.click();
		
		// Wait for editor to close - verify it's actually closed
		await expect(titleInput).not.toBeVisible({ timeout: 5000 });
		
		// Then verify task was created
		await expect(this.page.locator(`text="${title}"`)).toBeVisible({ timeout: 5000 });
	}

	/**
	 * Edit an existing task
	 */
	async editTask(oldTitle: string, newTitle: string, newDescription?: string, screenshotName?: string) {
		// Click on the task to open inline editor
		await this.page.locator(`text="${oldTitle}"`).first().click();
		
		// Wait for inline editor to appear
		await this.page.waitForTimeout(500);
		
		// Take screenshot after opening editor if name provided
		if (screenshotName) {
			await this.screenshot(screenshotName);
		}
		
		// Find the inline editor that appears after clicking the task
		// The editor will be in the same container as the task
		const titleInput = this.page.locator('input[type="text"]').first();
		await expect(titleInput).toBeVisible({ timeout: 5000 });
		
		// Update title
		await titleInput.clear();
		await titleInput.fill(newTitle);
		
		// Update description if provided
		if (newDescription) {
			const descriptionInput = this.page.locator('textarea').first();
			if (await descriptionInput.isVisible()) {
				await descriptionInput.clear();
				await descriptionInput.fill(newDescription);
			}
		}
		
		// Save changes
		const saveButton = this.page.locator('button').filter({ hasText: /save|update/i }).first();
		if (await saveButton.isVisible()) {
			await saveButton.click();
		} else {
			// Try pressing Enter as alternative
			await titleInput.press('Enter');
		}
		
		// Wait for editor to close
		await this.page.waitForTimeout(1000);
		
		// Verify update
		await expect(this.page.locator(`text="${newTitle}"`)).toBeVisible({ timeout: 5000 });
	}

	/**
	 * Complete a task by title
	 */
	async completeTask(title: string) {
		// Find the task
		const task = this.page.locator('[role="button"]').filter({ hasText: title }).first();
		
		// Find the checkbox button within this task
		const checkbox = task.locator('button').first();
		await checkbox.click();
		
		// Wait for completion
		await this.page.waitForTimeout(500);
		
		// Verify task is completed (usually has line-through style)
		await expect(task.locator('.line-through, [class*="completed"]')).toBeVisible({ timeout: 5000 });
	}

	/**
	 * Delete a task
	 */
	async deleteTask(title: string) {
		// Click on task to open inline editor
		await this.page.locator(`text="${title}"`).first().click();
		
		// Wait for inline editor to appear
		await this.page.waitForTimeout(500);
		
		// Look for delete button in the inline editor
		const deleteButton = this.page.locator('button').filter({ hasText: /delete|remove/i }).first();
		if (await deleteButton.isVisible()) {
			await deleteButton.click();
			
			// Handle confirmation if present
			const confirmButton = this.page.locator('button').filter({ hasText: /confirm|yes|delete/i }).first();
			if (await confirmButton.isVisible()) {
				await confirmButton.click();
			}
		} else {
			// Close editor if no delete option
			await this.page.keyboard.press('Escape');
		}
		
		await this.page.waitForTimeout(500);
		
		// Verify task is gone
		await expect(this.page.locator(`text="${title}"`)).not.toBeVisible({ timeout: 5000 });
	}

	/**
	 * Switch to a different perspective
	 */
	async switchPerspective(perspectiveName: string) {
		const perspectiveButton = this.page.locator('button').filter({ hasText: perspectiveName });
		await perspectiveButton.first().click();
		await this.page.waitForTimeout(500);
	}

	/**
	 * Switch to a different workspace
	 */
	async switchWorkspace(workspaceName: string) {
		// This would need to be implemented based on actual UI
		const workspaceSelector = this.page.locator('[title*="workspace"]').first();
		await workspaceSelector.click();
		await this.page.locator(`text="${workspaceName}"`).click();
		await this.page.waitForTimeout(500);
	}

	/**
	 * Get count of visible tasks
	 */
	async getTaskCount(): Promise<number> {
		const tasks = this.page.locator('[role="button"]').filter({ has: this.page.locator('button') });
		return await tasks.count();
	}

	/**
	 * Check if a task exists
	 */
	async taskExists(title: string): Promise<boolean> {
		const task = this.page.locator(`text="${title}"`);
		return await task.isVisible();
	}

	/**
	 * Take a screenshot
	 */
	async screenshot(filename: string) {
		const path = this.screenshotBasePath 
			? `${this.screenshotBasePath}/${filename}`
			: filename;
		await this.page.screenshot({ path, fullPage: true });
	}
}