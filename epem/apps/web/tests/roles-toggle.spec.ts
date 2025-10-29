import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epem.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

if (process.env.E2E !== 'true') {
  test.skip(true, 'Requires E2E stack running');
}

test('toggle permiso users.read en STAFF y persiste', async ({ page }) => {
  // Login en contexto del navegador para setear cookie httpOnly y token
  await page.goto('/login');
  await page.evaluate(async (creds: { email: string; password: string }) => {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    try {
      const j = await res.json();
      if (j?.accessToken) localStorage.setItem('epem_token', j.accessToken as string);
    } catch {}
  }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  // Navegar a Admin -> Roles
    await page.context().addCookies([{ name: 'epem_rt', value: 'test', url: 'http://localhost:3000' }]);
  await page.goto('/admin/roles');
  await expect(page.getByRole('heading', { name: 'Roles y Permisos' })).toBeVisible();
  await page.getByTestId('roles-table').waitFor();

  // Checkbox objetivo: STAFF / users / read
  const target = page.getByTestId('cb-STAFF-users-read');
  await target.waitFor({ state: 'visible', timeout: 15000 });
  const before = await target.isChecked();

  // Toggle y verificar cambio en la UI
  await target.click();
  await expect(target).toHaveJSProperty('checked', !before);

  // Recargar y verificar persistencia
  await page.reload();
  await page.getByTestId('roles-table').waitFor();
  const afterReload = page.getByTestId('cb-STAFF-users-read');
  await expect(afterReload).toHaveJSProperty('checked', !before);

  // Revertir para dejar estado inicial
  await afterReload.click();
  await expect(afterReload).toHaveJSProperty('checked', before);
});

