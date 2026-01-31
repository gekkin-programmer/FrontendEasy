import { test, expect } from '@playwright/test';

const email = `test-scheduling-${Date.now()}@example.com`;
const password = 'SecurePass123!';

test.describe('Post Scheduling and Calendar', () => {
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/signup');
    await page.getByPlaceholder('First').fill('Schedule');
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

  test('Test 1: Schedule Post (Future)', async ({ page }) => {
    const content = `Future post ${Date.now()}`;
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(content);
    
    // 1. Open Date Picker
    await page.click('button:has-text("NOW")');
    
    // 2. Select a future date (simple: just click a day like "28" or similar)
    // For reliability, we can just use the current selected date but change the time
    await page.locator('input[type="time"]').fill('23:59');
    
    // 3. Click Schedule
    await page.click('button:has-text("SCHEDULE")');
    
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();
    
    // 4. Verify in Queue column
    const queueColumn = page.locator('text=Queue').locator('xpath=./../..');
    await expect(queueColumn.getByText(content)).toBeVisible();
    await expect(queueColumn.getByText('SCHEDULED')).toBeVisible();
  });

  test('Test 2: Schedule Validation (Past Date)', async ({ page }) => {
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill('Past post');
    
    // 1. Open Date Picker
    await page.click('button:has-text("NOW")');
    
    // 2. We don't change date but we set a past time (e.g. 00:01)
    await page.locator('input[type="time"]').fill('00:01');
    
    // 3. Click Schedule
    await page.click('button:has-text("SCHEDULE")');
    
    // 4. Verify error
    await expect(page.getByText(/Cannot schedule in the past/i)).toBeVisible();
  });

  test('Test 3 & 4: Calendar View and Reschedule', async ({ page }) => {
    const content = `Calendar post ${Date.now()}`;
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(content);
    await page.locator('button:has-text("NOW")').click();
    await page.locator('input[type="time"]').fill('22:00');
    await page.click('button:has-text("SCHEDULE")');
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();

    // 1. Switch to Calendar Tab
    await page.click('button:has-text("Calendar")');
    
    // 2. Verify post is visible in calendar
    await expect(page.locator(`text=${content}`)).toBeVisible();
    
    // 3. Navigation Check
    await page.click('button >> .lucide-chevron-left'); // Previous month
    await expect(page.locator(`text=${content}`)).not.toBeVisible();
    await page.click('button >> .lucide-chevron-right'); // Back to current
    await expect(page.locator(`text=${content}`)).toBeVisible();

    // 4. Click Post to Reschedule
    await page.click(`text=${content}`);
    
    // 5. Verify Redirected to Queue tab with Composer populated
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Edit Content')).toBeVisible();
    await expect(page.getByPlaceholder('INPUT_CONTENT_STREAM...')).toHaveValue(content);
    
    // 6. Change Time
    await page.click('button:has-text("UPDATE")'); // Just re-saving for now
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();
  });

  test('Test 5: Cancel Scheduled Post', async ({ page }) => {
    // 1. Create a scheduled post
    const content = `CancelMe ${Date.now()}`;
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(content);
    await page.click('button:has-text("EXECUTE")');
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();

    // 2. Click Cancel Schedule button in Queue column
    const queueColumn = page.locator('text=Queue').locator('xpath=./../..');
    const postCard = queueColumn.locator(`text=${content}`).locator('xpath=./../..');
    await postCard.locator('button[title="Cancel Schedule"]').click();

    // 3. Verify status changed to Draft (moved to Drafts column)
    await expect(page.getByText('SCHEDULE_CANCELLED')).toBeVisible();
    const draftsColumn = page.locator('text=Drafts').locator('xpath=./../..');
    await expect(draftsColumn.getByText(content)).toBeVisible();
  });
});
