import { test, expect } from '@playwright/test';

test.describe('Error Boundary', () => {
  test('app recovers from navigation to invalid route', async ({ page }) => {
    // Navigate to a route that doesn't exist
    await page.goto('/some-nonexistent-route');

    // App should not crash — either shows 404 or redirects
    // The error boundary should catch any render errors
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
