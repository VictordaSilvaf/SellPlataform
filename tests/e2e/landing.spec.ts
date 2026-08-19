import { expect, test } from '@playwright/test';

test('a landing explica o serviço e leva ao cadastro', async ({ page }) => {
    await page.goto('/');

    await expect(
        page.getByRole('heading', {
            name: 'A venda do balcão, registrada de verdade.',
        }),
    ).toBeVisible();
    await expect(page.getByText('Padaria da Rua')).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Abra um ambiente' }),
    ).toBeVisible();

    await page
        .getByRole('link', { name: 'Criar conta grátis' })
        .first()
        .click();
    await expect(page).toHaveURL(/register/);
});
