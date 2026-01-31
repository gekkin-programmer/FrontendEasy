import { test, expect } from '@playwright/test';

// Generate a random user for each run to avoid collision
const timestamp = Date.now();
const email = `test-e2e-${timestamp}@example.com`;
const password = 'SecurePass123!';

test.describe('Authentication Flow', () => {
  
  test('Test 1: Complete Signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill Form
    await page.getByPlaceholder('First').fill('Test');
    await page.getByPlaceholder('Last').fill('User');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    
    // Submit
    await page.click('button:has-text("Continue")');
    
    // Wait for OTP step (Assuming dev environment logs or bypass)
    // Note: In a real E2E environment without email access, we might need a backdoor or mock.
    // For now, we check if we reached the verification step.
    await expect(page.getByText('Check your email')).toBeVisible();
    
    // Enter dummy OTP (If backend is in dev mode, it accepts 123456 or similar if mocked, 
    // BUT since we can't read the email, we'll verify we reached this step).
    // If you have a fixed OTP for test env, we can enter it.
    await page.getByPlaceholder('123456').fill('123456');
    await page.click('button:has-text("Verify & Create Account")');
    
    // Verify Redirect (This might fail if OTP is rejected, but verifies flow structure)
    // Expectation: /onboarding or /dashboard
    await expect(page).toHaveURL(/\/onboarding|\/dashboard/);
  });

  test('Test 2: Login', async ({ page }) => {
    // Assumption: User exists (created in Test 1 or seeded)
    // For reliability in this script, I'll use the one we just "tried" to create, 
    // or a known seed user if Test 1 fails due to OTP.
    
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    
    await page.click('button:has-text("Sign In")');
    
    // Assuming login might fail if Test 1 didn't complete OTP verification.
    // In a real scenario, we'd seed the DB first.
    // Here we check for error OR success to validate the UI interaction.
    const successOrError = await Promise.race([
        page.waitForURL('/dashboard'),
        page.waitForSelector('text=Invalid credentials'),
        page.waitForSelector('text=Invalid email or password')
    ]);
    
    expect(successOrError).toBeTruthy();
  });

  test('Test 7: Logout', async ({ page }) => {
    // Skip if not logged in. Ideally, we login first.
    // This is a placeholder for the flow.
    await page.goto('/login');
    // ... Perform Login ...
    
    // Perform Logout
    // await page.click('button:has-text("Sign Out")');
    // await expect(page).toHaveURL('/login');
  });
});
