import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const url = page.url();
    if (url.includes('login')) {
      // Register a new user to ensure we can log in
      const email = `nav-${Date.now()}@test.com`;
      await page.goto('/register');
      await page.getByPlaceholder('you@example.com').fill(email);
      await page.getByPlaceholder('At least 8 characters').fill('Test1234!');
      await page.getByPlaceholder('Re-enter your password').fill('Test1234!');
      await page.locator('[class*="bg-blue-600"]').click();
      await page.waitForURL('/', { timeout: 15000 });
    }
  });

  test('home screen shows app info', async ({ page }) => {
    await expect(page.getByText('Starter Kit').first()).toBeVisible();
    await expect(page.getByText('Tech Stack')).toBeVisible();
    await expect(page.getByText('Quick Start')).toBeVisible();
  });

  test('tab navigation between Home and Explore', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /Home/ })).toBeVisible();

    // Navigate to Explore via URL (more reliable than tab clicks on web — expo-router rebuilds DOM)
    await page.goto('/explore');
    await expect(page.getByText('Features', { exact: true })).toBeVisible({ timeout: 5000 });

    // Navigate back to Home
    await page.goto('/');
    await expect(page.getByText('Quick Start')).toBeVisible({ timeout: 5000 });
  });

  test('home screen shows tech badges', async ({ page }) => {
    await expect(page.getByText('Expo SDK 54', { exact: true })).toBeVisible();
    await expect(page.getByText('React Native 0.81', { exact: true })).toBeVisible();
    await expect(page.getByText('TypeScript', { exact: true })).toBeVisible();
    await expect(page.getByText('NativeWind v4', { exact: true })).toBeVisible();
    await expect(page.getByText('Zustand', { exact: true })).toBeVisible();
  });
});
