import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_USER_EMAIL!;
const PASSWORD = process.env.TEST_USER_PASSWORD!;

// A stable public Lever posting to use as a fixture.
// Replace with any live jobs.lever.co URL if this one expires.
const LEVER_URL = 'https://jobs.lever.co/zopa/37193ff4-2050-407e-ae17-79aa956d444c';

test.beforeEach(async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(protected|dashboard|table|board)/);
});

test.describe('AI job parser', () => {
  test('populates fields from a Lever URL', async ({ page }) => {
    await page.getByRole('button', { name: /add|new application/i }).click();

    // Paste URL into the quick-fill input
    const urlInput = page.getByPlaceholder(/paste.*url|job url/i);
    await urlInput.fill(LEVER_URL);
    await page.getByRole('button', { name: /fill|parse|fetch/i }).click();

    // Wait for at least the role field to be populated
    await expect(page.getByLabel(/role/i)).not.toHaveValue('', { timeout: 15_000 });

    // Company and location should also be filled
    await expect(page.getByLabel(/company/i)).not.toHaveValue('');
    await expect(page.getByLabel(/location/i)).not.toHaveValue('');
  });

  test('shows an error for an unsupported site (LinkedIn)', async ({ page }) => {
    await page.getByRole('button', { name: /add|new application/i }).click();

    const urlInput = page.getByPlaceholder(/paste.*url|job url/i);
    await urlInput.fill('https://www.linkedin.com/jobs/view/123456789');
    await page.getByRole('button', { name: /fill|parse|fetch/i }).click();

    await expect(page.getByText(/unsupported|not supported|linkedin/i)).toBeVisible({ timeout: 10_000 });
  });
});
