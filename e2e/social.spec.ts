import { test, expect } from '@playwright/test';

const email = `test-social-${Date.now()}@example.com`;
const password = 'SecurePass123!';

test.describe('Social Account Connections', () => {
  
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3001/signup');
    await page.getByPlaceholder('First').fill('Social');
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

  test('Test 4: List Connected Accounts (Simulation)', async ({ page }) => {
    // 1. Simulate multiple connections via success URL params
    const workspaceId = page.url().split('/').pop();
    
    // Simulate Facebook
    await page.goto(`http://localhost:3001/dashboard/${workspaceId}?success=true&platform=facebook`);
    await expect(page.getByText('CONNECTION_ESTABLISHED')).toBeVisible();
    
    // Switch to Connections tab
    await page.click('button:has-text("Config")');
    await page.click('button:has-text("Connections")');

    // 2. Verify Data Display
    const facebookCard = page.locator('div:has-text("Facebook")').nth(2);
    await expect(facebookCard.getByText('LINKED')).toBeVisible();
    await expect(facebookCard.getByText(/LINKED:/i)).toBeVisible(); // Connection Date
  });

  test('Test 5: Disconnect Account', async ({ page }) => {
    await page.click('button:has-text("Config")');
    await page.click('button:has-text("Connections")');

    // 1. Find a connected account (assuming simulated from previous test or newly simulated)
    const workspaceId = page.url().split('/').pop();
    await page.goto(`http://localhost:3001/dashboard/${workspaceId}?success=true&platform=facebook`);
    
    await page.click('button:has-text("Config")');
    await page.click('button:has-text("Connections")');

    const facebookCard = page.locator('div:has-text("Facebook")').nth(2);
    
    // 2. Click Disconnect
    page.on('dialog', dialog => dialog.accept()); // Auto-confirm
    await facebookCard.locator('button:has-text("Disconnect")').click();

    // 3. Verify disappearance
    await expect(page.getByText('CONNECTION_TERMINATED')).toBeVisible();
    await expect(facebookCard.getByText('OFFLINE')).toBeVisible();
  });

  test('Test 7: Expired Token Handling', async ({ page }) => {
    // 1. Simulate active connection
    const workspaceId = page.url().split('/').pop();
    await page.goto(`http://localhost:3001/dashboard/${workspaceId}?success=true&platform=facebook`);
    
    // 2. Go to Connections and Force Expire
    await page.click('button:has-text("Config")');
    await page.click('button:has-text("Connections")');
    const facebookCard = page.locator('div:has-text("Facebook")').nth(2);
    await facebookCard.locator('button:has-text("Force Expire")').click();

    // 3. Verify BROKEN LINK state
    await expect(facebookCard.getByText('BROKEN LINK')).toBeVisible();
    await expect(facebookCard.getByText('RECONNECT NOW')).toBeVisible();

    // 4. Verify in Composer targets
    await page.click('button:has-text("Queue")');
    const targetNode = page.locator('div[title="Connection expired"]');
    await expect(targetNode).toBeVisible();
  });

  test('Test 8: Multiple Accounts (Concept UI Check)', async ({ page }) => {
    // This verifies the target selector can show multiple items if available
    await page.click('button:has-text("Queue")');
    
    // Open the nodes selector (Plus button)
    await page.locator('button:has-child(.lucide-plus)').first().click();
    
    // Verify the list shows available platforms
    await expect(page.getByText('AVAILABLE NODES')).toBeVisible();
  });
});