import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epem.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

if (process.env.E2E !== 'true') {
  test.skip(true, 'Requires E2E stack running');
}

test('pantalla de roles muestra encabezado y navega desde Admin', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/profile$/);

  const adminLink = page.getByRole('link', { name: 'Admin' });
  await adminLink.click();
  await page.getByRole('link', { name: 'Roles' }).click();
  await expect(page.getByRole('heading', { name: 'Roles y Permisos' })).toBeVisible();
});