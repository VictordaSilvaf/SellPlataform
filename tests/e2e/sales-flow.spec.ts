import { expect, test } from '@playwright/test';
import {
    e2eQuery,
    logout,
    registerAndVerify,
    uniqueEmail,
} from './helpers';

test('registro, produto, venda, pagamento e dashboard', async ({ page }) => {
    const email = uniqueEmail('owner');

    await registerAndVerify(page, { name: 'Ana Owner', email });
    await page.waitForURL(/workspaces\/create|\/app\//);

    if (page.url().includes('workspaces/create')) {
        await page.getByLabel('Nome').fill('Minha Loja E2E');
        await page.getByRole('button', { name: 'Criar ambiente' }).click();
    }

    await page.waitForURL(/\/app\/.+\/dashboard/);
    await page.getByRole('link', { name: 'Produtos' }).click();
    await page.getByRole('link', { name: 'Novo produto' }).click();
    await page.getByLabel('Nome').fill('Camisa Preta');
    await page.getByLabel('Preço').fill('100,00');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Camisa Preta')).toBeVisible();

    await page.getByRole('link', { name: 'Vendas' }).click();
    await page.getByRole('link', { name: 'Registrar venda' }).first().click();
    await page.getByRole('radio', { name: 'Pendente' }).click();
    await page.getByRole('button', { name: 'Registrar venda' }).click();
    await expect(page.getByText(/Venda #/)).toBeVisible();

    await page.getByRole('button', { name: 'Marcar como pago' }).click();
    await expect(page.getByText('Pago')).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).first().click();
    await expect(page.getByText('Vendas hoje')).toBeVisible();
});

test('convite para e-mail novo entra no workspace após o cadastro', async ({
    page,
}) => {
    const ownerEmail = uniqueEmail('host');
    const guestEmail = uniqueEmail('guest');

    await registerAndVerify(page, { name: 'Host', email: ownerEmail });
    await page.waitForURL(/workspaces\/create|\/app\//);

    if (page.url().includes('workspaces/create')) {
        await page.getByLabel('Nome').fill('Loja Convite');
        await page.getByRole('button', { name: 'Criar ambiente' }).click();
    }

    await page.waitForURL(/\/app\/.+\/dashboard/);
    await page.getByRole('link', { name: 'Membros' }).click();
    await page.getByLabel('E-mail').fill(guestEmail);
    await page.getByRole('button', { name: 'Convidar usuário' }).click();
    await expect(page.getByText(guestEmail)).toBeVisible();

    const token = e2eQuery('invitation-token', guestEmail);
    expect(token).not.toBe('');

    await logout(page);
    await registerAndVerify(
        page,
        { name: 'Convidada', email: guestEmail },
        token,
    );

    await page.waitForURL(/\/app\/.+\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('um usuário não acessa o workspace de outro', async ({ page }) => {
    const ownerEmail = uniqueEmail('alpha');
    const strangerEmail = uniqueEmail('beta');

    await registerAndVerify(page, { name: 'Alpha', email: ownerEmail });
    await page.waitForURL(/workspaces\/create|\/app\//);

    if (page.url().includes('workspaces/create')) {
        await page.getByLabel('Nome').fill('Loja Alpha');
        await page.getByRole('button', { name: 'Criar ambiente' }).click();
    }

    await page.waitForURL(/\/app\/.+\/dashboard/);
    const ownerWorkspaceUrl = page.url();
    const productsUrl = ownerWorkspaceUrl.replace(/dashboard.*$/, 'products');

    await logout(page);
    await registerAndVerify(page, { name: 'Beta', email: strangerEmail });
    await page.waitForURL(/workspaces\/create|\/app\//);

    const response = await page.goto(productsUrl);
    expect(response?.status()).toBe(403);
});
