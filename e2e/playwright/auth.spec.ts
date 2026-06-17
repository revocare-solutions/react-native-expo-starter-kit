import { test, expect, type Page } from '@playwright/test';

const TEST_PASSWORD = 'Test1234!';

async function registerAndVerify(page: Page, email: string) {
  await page.goto('/register');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('At least 8 characters').fill(TEST_PASSWORD);
  await page.getByPlaceholder('Re-enter your password').fill(TEST_PASSWORD);
  await page.locator('[class*="bg-blue-600"]').click();

  // Should navigate to confirm-email
  await page.waitForURL('**/confirm-email**', { timeout: 10000 });

  // Fetch OTP from Inbucket
  const mailbox = email.split('@')[0];
  const response = await page.request.get(`http://localhost:9000/api/v1/mailbox/${mailbox}`);
  const messages = await response.json();
  const messageId = messages[messages.length - 1]?.id;

  const msgResponse = await page.request.get(`http://localhost:9000/api/v1/mailbox/${mailbox}/${messageId}`);
  const message = await msgResponse.json();
  const otpMatch = message.body.text.match(/enter the code:\s*(\d{6})/);
  const otp = otpMatch?.[1];

  // Enter OTP
  await page.getByPlaceholder('Enter the 6-digit code').fill(otp!);
  await page.getByText('Verify Email').nth(1).click();

  // Should verify and navigate to home
  await page.waitForURL('/', { timeout: 15000 });
  await expect(page.getByRole('tab', { name: /Home/ })).toBeVisible({ timeout: 5000 });
}

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

  test('register with email verification', async ({ page }) => {
    const email = `e2e-reg-${Date.now()}@test.com`;
    await registerAndVerify(page, email);
  });

  test('login with registered credentials', async ({ page }) => {
    const email = `e2e-login-${Date.now()}@test.com`;
    await registerAndVerify(page, email);

    // Clear session and login
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(email);
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
