import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epem.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

if (process.env.E2E !== 'true') {
  test.skip(true, 'Requires E2E stack running');
}

test('admin menu visible y CRUD basico', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();

  // Admin link visible en el Nav
  const adminLink = page.getByRole('link', { name: 'Admin' });
  await expect(adminLink).toBeVisible();
  await adminLink.click();

  // Página de Admin Users
  await expect(page).toHaveURL(/\/admin\/users$/);
  // Verifica elementos clave (form crear y tabla)
  await expect(page.getByRole('button', { name: 'Crear usuario' })).toBeVisible();
  // Asegura que el admin seed aparece en la tabla
  await expect(page.locator('table')).toContainText('admin@epem.local', { timeout: 15000 });
});
