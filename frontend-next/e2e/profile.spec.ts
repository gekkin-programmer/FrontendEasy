import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  // Use storage state or login before each if needed
  // test.use({ storageState: 'playwright/.auth/user.json' });

  test('Test 5: Profile Update', async ({ page }) => {
    // Mock Login for speed (or use real login helper)
    await page.goto('/login');
    // ... login logic ...
    
    // 1. Go to Settings
    await page.goto('/dashboard/settings');
    
    // 2. Modify Fields
    await page.getByLabel('First Name').fill('UpdatedName');
    await page.getByLabel('Last Name').fill('UpdatedLast');
    
    // 3. Save
    await page.click('button:has-text("SAVE_CHANGES")');
    
    // 4. Verify Toast
    await expect(page.getByText('PROFILE_UPDATED')).toBeVisible();
    
    // 5. Verify Persistence
    await page.reload();
    await expect(page.getByLabel('First Name')).toHaveValue('UpdatedName');
  });
});
