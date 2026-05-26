import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_USER_EMAIL!;
const PASSWORD = process.env.TEST_USER_PASSWORD!;

test.describe('Authentication', () => {
  test('sign in with valid credentials and land on dashboard', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(protected|dashboard|table|board)/);
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill('wrong-password-xyz');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible();
  });

  test('sign out returns to landing page', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/(protected|dashboard|table|board)/);

    await page.getByRole('button', { name: /sign out|logout/i }).click();
    await expect(page).toHaveURL('/');
  });
});
