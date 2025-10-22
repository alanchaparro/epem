import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epem.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

test('login, navegar a pacientes, crear y editar', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill(ADMIN_EMAIL);
  await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible();

  // Ir a pacientes
  await page.getByRole('link', { name: 'Pacientes' }).click();
  await expect(page.getByRole('heading', { name: 'Pacientes' })).toBeVisible();

  // Crear paciente
  await page.getByRole('link', { name: 'Nuevo paciente' }).click();
  const dni = `${Date.now()}`.slice(-8);
  await page.getByPlaceholder('DNI').fill(dni);
  await page.getByPlaceholder('Nombre').fill('QA');
  await page.getByPlaceholder('Apellido').fill('Playwright');
  await page.locator('input[type="date"]').fill('1999-01-01');
  await page.getByRole('button', { name: 'Guardar' }).click();

  // Redirige a detalle, editar teléfono y guardar
  await expect(page).toHaveURL(/\/patients\//);
  await page.getByLabel('Teléfono').fill('11-1234-5678');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Cambios guardados')).toBeVisible();

  // Buscar por DNI
  await page.getByRole('link', { name: 'EPEM' }).click(); // home
  await page.getByRole('link', { name: 'Pacientes' }).click();
  await page.getByPlaceholder('Buscar por DNI o Apellido').fill(dni);
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByText(dni)).toBeVisible();
});

