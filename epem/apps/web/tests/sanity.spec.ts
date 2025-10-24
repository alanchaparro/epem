import { test, expect } from '@playwright/test';

test.describe('UI sanity', () => {
  test('renders basic layout in headless context', async ({ page }) => {
    await page.setContent('<main><h1>Dashboard</h1><p>Smoke test</p></main>');
    await expect(page.locator('h1')).toHaveText('Dashboard');
  });
});

