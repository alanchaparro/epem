import { test, expect } from '@playwright/test';

test('sin sesión redirige /patients -> /login', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('epem_token');
  });
  const res = await page.goto('/patients');
  // Next puede responder 200 con HTML de /login; comprobamos la URL y el heading
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Acceso administrativo' })).toBeVisible();
});

