import { test, expect } from '@playwright/test';
import { prepareForScreenshot, waitForAppReady } from '../helpers/test-utils';

test.describe('Settings and Preferences - Visual Tests', () => {
	test('Settings dialog', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Open settings (usually via keyboard shortcut or menu)
		await page.keyboard.press(','); // Common settings shortcut
		await page.waitForTimeout(500);
		
		// If that doesn't work, try looking for a settings button
		const settingsButton = page.locator('[aria-label*="Settings"], button:has-text("Settings")');
		if (await settingsButton.count() > 0) {
			await settingsButton.click();
			await page.waitForTimeout(500);
		}
		
		// Take screenshot
		await expect(page).toHaveScreenshot('settings-dialog.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Keyboard shortcuts help', async ({ page }) => {
		// Set up deterministic environment
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Open keyboard shortcuts (usually ?)
		await page.keyboard.press('?');
		await page.waitForTimeout(500);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('keyboard-shortcuts.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Theme switcher - light mode', async ({ page }) => {
		// Set up deterministic environment with light theme
		await prepareForScreenshot(page);
		await page.emulateMedia({ colorScheme: 'light' });
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('theme-light.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});

	test('Theme switcher - dark mode', async ({ page }) => {
		// Set up deterministic environment with dark theme (default)
		await prepareForScreenshot(page);
		
		// Navigate to the app
		await page.goto('/');
		await waitForAppReady(page);
		
		// Take screenshot
		await expect(page).toHaveScreenshot('theme-dark.png', {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixels: 100
		});
	});
});