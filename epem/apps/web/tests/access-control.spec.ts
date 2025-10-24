import { test, expect } from '@playwright/test';

if (process.env.E2E !== 'true') {
  test.skip(true, 'Requires E2E stack running');
}

test('sin sesión redirige /patients -> /login', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('epem_token');
  });
  await page.goto('/patients');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Acceso administrativo' })).toBeVisible();
});
