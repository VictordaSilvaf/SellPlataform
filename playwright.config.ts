import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    retries: process.env.CI ? 2 : 0,
    use: {
        baseURL: process.env.APP_URL ?? 'http://127.0.0.1:8000',
        testIdAttribute: 'data-test',
        ...devices['Desktop Chrome'],
    },
    timeout: 60000,
    webServer: {
        command: 'php artisan serve --host=127.0.0.1 --port=8000',
        url: 'http://127.0.0.1:8000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
