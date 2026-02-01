import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible();
  });

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should not navigate away
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /register/i }).click();
    await expect(page).toHaveURL(/.*register/);

    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /blood bank/i })).toBeVisible();
  });

  test('should have login and register links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/blockchain/i)).toBeVisible();
    await expect(page.getByText(/traceability/i)).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/donor');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect unauthenticated users from blood-bank', async ({ page }) => {
    await page.goto('/blood-bank');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect unauthenticated users from hospital', async ({ page }) => {
    await page.goto('/hospital');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect unauthenticated users from regulator', async ({ page }) => {
    await page.goto('/regulator');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect unauthenticated users from admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*login/);
  });
});
