import { test, expect } from '@playwright/test';

const email = `test-analytics-${Date.now()}@example.com`;
const password = 'SecurePass123!';

test.describe('Analytics and Insights Hub', () => {
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/signup');
    await page.getByPlaceholder('First').fill('Analytic');
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

  test('Test 1: Workspace Overview Cards', async ({ page }) => {
    // 1. Go to Analytics Tab
    await page.click('button:has-text("Analytics")');
    
    // 2. Verify Cards Presence
    await expect(page.getByText('Total_Posts')).toBeVisible();
    await expect(page.getByText('Published')).toBeVisible();
    await expect(page.getByText('Scheduled')).toBeVisible();
    await expect(page.getByText('Drafts')).toBeVisible();
    
    // 3. Verify they have numbers (even if 0)
    await expect(page.locator('span.tabular-nums').first()).toContainText(/[0-9]/);
  });

  test('Test 2 & 3: Performance Stream and Engagement', async ({ page }) => {
    await page.click('button:has-text("Analytics")');
    
    // 1. Check Live Stream Section
    await expect(page.getByText('Live_Stream')).toBeVisible();
    
    // 2. If posts exist, click one to see details (likes, comments, rate)
    const postCard = page.locator('div[onClick]').first(); // Target post list item
    if (await postCard.count() > 0) {
        await postCard.click();
        
        // Verify Detail Panel
        await expect(page.getByText('Engagement_Split')).toBeVisible();
        await expect(page.getByText('Eng._Rate')).toBeVisible();
        await expect(page.getByText('Likes')).toBeVisible();
    }
  });

  test('Test 3: Strategy Insights Tab', async ({ page }) => {
    await page.click('button:has-text("Analytics")');
    
    // 1. Switch to Niche_Intel (Strategy)
    await page.click('button:has-text("Niche_Intel")');
    
    // 2. Verify AI Insight Cards
    await expect(page.getByText('Account_Health')).toBeVisible();
    await expect(page.getByText('AI_Forecast')).toBeVisible();
    await expect(page.getByText('Golden_Windows')).toBeVisible();
    await expect(page.getByText('Power_Words')).toBeVisible();
  });
});
