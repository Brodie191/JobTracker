import { test, expect } from '@playwright/test';

const EMAIL = process.env.TEST_USER_EMAIL!;
const PASSWORD = process.env.TEST_USER_PASSWORD!;

test.beforeEach(async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/(protected|dashboard|table|board)/);
});

test.describe('Applications table', () => {
  test('add a new application', async ({ page }) => {
    await page.getByRole('button', { name: /add|new application/i }).click();

    await page.getByLabel(/company/i).fill('Playwright Corp');
    await page.getByLabel(/role/i).fill('QA Engineer');
    // date field — fill with today
    const today = new Date().toISOString().slice(0, 10);
    await page.getByLabel(/date/i).fill(today);

    await page.getByRole('button', { name: /save|add|submit/i }).click();

    await expect(page.getByText('Playwright Corp')).toBeVisible();
  });

  test('edit an existing application', async ({ page }) => {
    // Assumes at least one application is in the list (created by the add test above or seeded)
    await page.getByText('Playwright Corp').first().waitFor();
    await page.getByRole('button', { name: /edit/i }).first().click();

    await page.getByLabel(/role/i).clear();
    await page.getByLabel(/role/i).fill('Senior QA Engineer');
    await page.getByRole('button', { name: /save|update/i }).click();

    await expect(page.getByText('Senior QA Engineer')).toBeVisible();
  });

  test('delete an application with confirmation', async ({ page }) => {
    await page.getByText('Playwright Corp').first().waitFor();
    await page.getByRole('button', { name: /delete/i }).first().click();
    // Confirm the dialog
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    await expect(page.getByText('Playwright Corp')).not.toBeVisible();
  });
});

test.describe('Kanban board', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to board view
    await page.getByRole('link', { name: /board/i }).click();
    await page.waitForURL(/board/);
  });

  test('columns Applied, Interviewing, Offer, Rejected are visible', async ({ page }) => {
    await expect(page.getByText(/applied/i).first()).toBeVisible();
    await expect(page.getByText(/interviewing/i).first()).toBeVisible();
    await expect(page.getByText(/offer/i).first()).toBeVisible();
    await expect(page.getByText(/rejected/i).first()).toBeVisible();
  });
});
