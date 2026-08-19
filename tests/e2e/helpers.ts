import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function uniqueEmail(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

export function e2eQuery(action: string, value: string): string {
    return execFileSync(
        'php',
        [path.join(root, 'tests/e2e/scripts/query.php'), action, value],
        {
            cwd: root,
            encoding: 'utf8',
        },
    ).trim();
}

export async function registerAndVerify(
    page: Page,
    user: { name: string; email: string; password?: string },
    invitation?: string,
): Promise<void> {
    const password = user.password ?? 'password';
    const registerUrl = invitation
        ? `/register?invitation=${invitation}`
        : '/register';

    await page.goto(registerUrl);
    await page.getByLabel('Nome').fill(user.name);

    if (!invitation) {
        await page.getByLabel('E-mail').fill(user.email);
    }

    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByLabel('Confirmar senha').fill(password);
    await page.getByTestId('register-user-button').click();
    await page.waitForURL(/verify-email|email\/verify|verification/);

    const verificationUrl = e2eQuery('verification-url', user.email);
    const parsed = new URL(verificationUrl);
    await page.goto(`${parsed.pathname}${parsed.search}`);
    await page.waitForURL(/workspaces\/create|\/app\//);
}

export async function logout(page: Page): Promise<void> {
    await page.getByTestId('sidebar-menu-button').click();
    await page.getByTestId('logout-button').click();
    await page.waitForURL((url) => !url.pathname.startsWith('/app'));
}
