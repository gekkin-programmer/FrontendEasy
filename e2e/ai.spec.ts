import { test, expect } from '@playwright/test';

const email = `test-ai-${Date.now()}@example.com`;
const password = 'SecurePass123!';

test.describe('AI Engine and Assistant', () => {
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/signup');
    await page.getByPlaceholder('First').fill('AI');
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

  test('Test 8: Unlimited AI Usage (Pro Plan)', async ({ page }) => {
    // 1. Upgrade to Pro
    await page.evaluate(async () => {
        const token = localStorage.getItem('accessToken');
        await fetch('/api/users/upgrade-pro', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
    });

    // 2. Trigger AI Magic in Composer
    await page.click('button:has-text("AI_MAGIC")');
    await page.getByPlaceholder(/50% OFF SNEAKERS/i).fill('Test Pro Prompt');
    await page.click('button:has-text("GENERATE_COPY")');
    
    // 3. Verify success
    await expect(page.getByText('AI: COPY_GENERATED')).toBeVisible({ timeout: 15000 });
  });

  test('Test 9: AI Chat and Feedback', async ({ page }) => {
    // 1. Open AI Chat
    await page.click('button[aria-label="Open AI Chat"]');
    
    // 2. Send Message
    const input = page.locator('input[placeholder="Type a message..."]');
    await input.fill('Hello Steve');
    await page.click('button >> .lucide-arrow-up');

    // 3. Wait for AI response
    const aiMessage = page.locator('div.bg-white.text-black').last();
    await expect(aiMessage).toBeVisible({ timeout: 15000 });

    // 4. Submit Feedback
    const thumbsUp = aiMessage.locator('button').first();
    await thumbsUp.click();

    // 5. Verify Success
    await expect(page.getByText('GLAD_YOU_LIKED_IT')).toBeVisible();
  });

  test('Test 10: AI Error Handling', async ({ page }) => {
    // We simulate a backend failure by intercepting the AI route
    await page.route('**/api/ai/chat', route => route.abort());

    await page.click('button[aria-label="Open AI Chat"]');
    const input = page.locator('input[placeholder="Type a message..."]');
    await input.fill('Broken prompt');
    await page.click('button >> .lucide-arrow-up');

    // Verify error message
    await expect(page.getByText('AI_TEMPORARILY_UNAVAILABLE')).toBeVisible();
  });
});
