import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './tests',
	testMatch: ['**/*.spec.ts'],
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		['html'],
		['json', { outputFile: 'test-results/results.json' }],
		['list']
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'http://localhost:5173',
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		/* Screenshot on failure */
		screenshot: 'only-on-failure',
		/* Video on failure */
		video: 'retain-on-failure',
		/* Deterministic viewport */
		viewport: { width: 1280, height: 800 },
		/* Timezone for deterministic date/time */
		timezoneId: 'Europe/Warsaw',
		/* Locale for deterministic formatting */
		locale: 'en-US',
		/* Disable animations via prefers-reduced-motion */
		launchOptions: {
			args: ['--force-prefers-reduced-motion']
		},
		/* Emulate reduced motion for CSS */
		reducedMotion: 'reduce',
		/* Color scheme */
		colorScheme: 'light'
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: { 
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 800 },
				timezoneId: 'Europe/Warsaw',
				locale: 'en-US',
				colorScheme: 'light'
			},
		},
		{
			name: 'chromium-dark',
			use: { 
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 800 },
				timezoneId: 'Europe/Warsaw',
				locale: 'en-US',
				colorScheme: 'dark'
			},
		},
		// Visual regression tests
		{
			name: 'visual',
			testDir: './tests/visual',
			testMatch: '**/*.spec.ts',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 800 },
				timezoneId: 'Europe/Warsaw',
				locale: 'en-US',
				colorScheme: 'light',
				// Ensure consistent screenshots
				screenshot: {
					mode: 'only-on-failure',
					fullPage: true
				}
			}
		},
		// E2E interaction tests
		{
			name: 'e2e',
			testDir: './tests/e2e',
			testMatch: '**/*.spec.ts',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 800 },
				timezoneId: 'Europe/Warsaw',
				locale: 'en-US',
				colorScheme: 'light'
			}
		}
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe'
	},
});