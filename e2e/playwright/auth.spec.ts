import { test, expect } from '@playwright/test';

const TEST_EMAIL = `e2e-${Date.now()}@test.com`;
const TEST_PASSWORD = 'Test1234!';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  test('login page has required fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByText('Sign In', { exact: true })).toBeVisible();
    await expect(page.getByText('Forgot password?')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('invalid@test.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpass');
    await page.getByText('Sign In', { exact: true }).click();

    await expect(page.getByText(/Invalid login credentials|Sign-in failed/)).toBeVisible({
      timeout: 10000,
    });
  });

  test('navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await page.waitForURL('**/register');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });

  test('register page has required fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('At least 8 characters')).toBeVisible();
    await expect(page.getByPlaceholder('Re-enter your password')).toBeVisible();
  });

  test('register and auto-login', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('At least 8 characters').fill(TEST_PASSWORD);
    await page.getByPlaceholder('Re-enter your password').fill(TEST_PASSWORD);

    await page.locator('[class*="bg-blue-600"]').click();

    // Should auto-login and navigate away from auth screens
    await page.waitForURL('/', { timeout: 15000 });
    // Verify tab bar is visible (home screen loaded)
    await expect(page.getByRole('tab', { name: /Home/ })).toBeVisible({ timeout: 5000 });
  });

  test('login with registered credentials', async ({ page }) => {
    // First register a user for this test
    const loginEmail = `login-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByPlaceholder('you@example.com').fill(loginEmail);
    await page.getByPlaceholder('At least 8 characters').fill(TEST_PASSWORD);
    await page.getByPlaceholder('Re-enter your password').fill(TEST_PASSWORD);
    await page.locator('[class*="bg-blue-600"]').click();
    await page.waitForURL('/', { timeout: 15000 });

    // Now clear session and login
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(loginEmail);
    await page.getByPlaceholder('Enter your password').fill(TEST_PASSWORD);
    await page.getByText('Sign In', { exact: true }).click();

    await page.waitForURL('/', { timeout: 10000 });
    await expect(page.getByRole('tab', { name: /Home/ })).toBeVisible({ timeout: 5000 });
  });

  test('navigate to forgot password', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await page.waitForURL('**/forgot-password');
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  });
});
