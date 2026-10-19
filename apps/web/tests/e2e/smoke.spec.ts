import { expect, test } from '@playwright/test';

test('primary workspace routes render', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Make the next idea visible.' })).toBeVisible();
  await page.getByRole('button', { name: /Algorithm Lab/ }).click();
  await expect(page.getByRole('heading', { name: 'See the algorithm think.' })).toBeVisible();
});
