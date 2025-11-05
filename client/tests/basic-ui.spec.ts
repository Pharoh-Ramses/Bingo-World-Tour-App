import { test, expect } from '@playwright/test';

test.describe('Basic UI Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('http://localhost:5000');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if the main heading is visible
    await expect(page.locator('h1').filter({ hasText: 'BINGO World Tour' })).toBeVisible();
  });

  test('should navigate to join page', async ({ page }) => {
    await page.goto('http://localhost:5000');

    // Click the "Enter Session Code" button
    await page.click('button:has-text("Enter Session Code")');

    // Should navigate to join page
    await expect(page).toHaveURL(/.*join/);
    await expect(page.locator('h3').filter({ hasText: 'Join BINGO World Tour' })).toBeVisible();
  });
});