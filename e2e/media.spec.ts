import { test, expect } from '@playwright/test';
import path from 'path';

const email = `test-media-${Date.now()}@example.com`;
const password = 'SecurePass123!';

test.describe('Media Management and Library', () => {
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/signup');
    await page.getByPlaceholder('First').fill('Media');
    await page.getByPlaceholder('Last').fill('Tester');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.click('button:has-text("Continue")');
    await page.getByPlaceholder('123456').fill('123456');
    await page.click('button:has-text("Verify & Create Account")');
    await page.waitForURL(/\/onboarding|\/dashboard/);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/\/dashboard/);
  });

  test('Test 4: Media Library View and Metadata', async ({ page }) => {
    // 1. Upload an image to ensure something is in the library
    await page.locator('input[type="file"]').first().setInputFiles(path.join(__dirname, '../public/assets/WiggleLogo.png'));
    await expect(page.getByText('UPLOAD_SUCCESSFUL')).toBeVisible();

    // 2. Open Library
    await page.click('button:has-text("OPEN_LIB")');
    
    // 3. Verify Grid view and thumbnails
    const libraryContainer = page.locator('div:has-text("OS_ASSET_EXPLORER")').locator('xpath=./..');
    await expect(libraryContainer.locator('img').first()).toBeVisible();

    // 4. Check Metadata (Size and Date)
    await expect(libraryContainer.getByText(/KB|MB/i).first()).toBeVisible(); // Size
    await expect(libraryContainer.getByText(/2026/i).first()).toBeVisible(); // Date (current year)
  });

  test('Test 5: Select Media from Library', async ({ page }) => {
    // 1. Open Library within Composer context
    await page.click('button:has-text("OPEN_LIB")');
    
    // 2. Select an image from library
    const firstAsset = page.locator('div.group.relative.aspect-square').first();
    await firstAsset.click(); // In current implementation, click triggers selection
    
    // 3. Verify preview in Composer
    await expect(page.getByText('MEDIA_LINKED')).toBeVisible();
    await expect(page.locator('img[src^="http"]')).toBeVisible(); // Preview from URL
  });

  test('Test 6: Delete Media', async ({ page }) => {
    await page.click('button:has-text("OPEN_LIB")');
    
    // 1. Hover to show actions
    const asset = page.locator('div.group.relative.aspect-square').first();
    await asset.hover();
    
    // 2. Click Delete
    page.on('dialog', dialog => dialog.accept());
    await asset.locator('button >> .lucide-trash-2, .fi-trash-2').first().click();
    
    // 3. Verify removal
    await expect(page.getByText('ASSET_DELETED')).toBeVisible();
  });
});