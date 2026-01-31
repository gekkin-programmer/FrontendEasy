import { test, expect } from '@playwright/test';
import path from 'path';

const email = 'test-posts-full@example.com';
const password = 'SecurePass123!';

test.describe('Post Management Full Workflow', () => {
  
  test.beforeAll(async ({ browser }) => {
    // Create user via backdoor
    const page = await browser.newPage();
    
    // Log frontend console messages
    page.on('console', msg => console.log(`BROWSER_LOG: ${msg.text()}`));

    await page.goto('http://localhost:3001/signup');
    await page.getByPlaceholder('First').fill('Full');
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

  test('Test 1: Create Text Post', async ({ page }) => {
    const content = "My first post about #AI";
    // 2. Cliquer "Create Post" / Composer (Implicit as it's on dashboard)
    // 3. Entrer texte
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(content);
    // 4. Sauvegarder comme Draft (REVIEW button = Draft)
    await page.click('button:has-text("REVIEW")');
    
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();
    
    // 5. Vérifier post dans feed
    // 6. Status = "Draft"
    const draftsColumn = page.locator('text=Drafts').locator('xpath=./../..'); 
    await expect(draftsColumn.getByText(content)).toBeVisible();
    
    // Check for DRAFT badge
    const postCard = draftsColumn.locator(`text=${content}`).locator('xpath=./../..');
    await expect(postCard.getByText('DRAFT')).toBeVisible();
  });

  test('Test 2: Create Post with Image', async ({ page }) => {
    const content = `Image post ${Date.now()}`;
    // 2. Entrer texte
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(content);
    
    // 3. Cliquer "Add Media" / Upload
    // 4. Upload image (JPG, PNG)
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(__dirname, '../public/assets/WiggleLogo.png'));
    
    // 5. Vérifier preview image
    await expect(page.locator('img[src^="blob:"]')).toBeVisible();
    
    // 6. Sauvegarder
    await page.click('button:has-text("REVIEW")');
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();
    
    // 9. Feed affiche image (We check feed first as we are in frontend tests)
    const draftsColumn = page.locator('text=Drafts').locator('xpath=./../..');
    const postCard = draftsColumn.locator(`text=${content}`).locator('xpath=./../..');
    await expect(postCard.locator('img').first()).toBeVisible();
  });

  test('Test 3: Edit Post (Draft)', async ({ page }) => {
    const content = `Original ${Date.now()}`;
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(content);
    await page.click('button:has-text("REVIEW")');
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();

    // 1. Cliquer post draft dans feed (Click Edit button)
    const postCard = page.locator(`text=${content}`).locator('xpath=./../..'); 
    await postCard.locator('button[title="Edit Post"]').click();

    // 2. Ouvrir en mode édition (Verify state)
    await expect(page.getByText('Edit Content')).toBeVisible();
    
    // 3. Modifier texte
    const newContent = `${content} EDITED`;
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(newContent);
    
    // 4. Changer image (Optional for this test as per instructions "Modifier texte" is key, but let's add one)
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(__dirname, '../public/assets/WiggleLogo.png'));

    // 5. Sauvegarder
    await page.click('button:has-text("UPDATE")');

    // 6. Vérifier changements visibles
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();
    await expect(page.getByText(newContent)).toBeVisible();
    await expect(page.locator(`text=${newContent}`).locator('xpath=./../..').locator('img').first()).toBeVisible();
  });

  test('Test 4: Delete Post', async ({ page }) => {
    const content = `DeleteMe ${Date.now()}`;
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(content);
    await page.click('button:has-text("REVIEW")');
    
    // 1. Post draft (Find it)
    const postCard = page.locator(`text=${content}`).locator('xpath=./../..');
    
    // 2. Cliquer menu "..." (We have direct buttons)
    // 3. Cliquer "Delete"
    await postCard.locator('button').last().click(); 
    
    // 4. Confirmer (Assuming toast/direct delete as per current implementation)
    // 5. Vérifier post disparu du feed
    await expect(page.getByText('POST_DELETED')).toBeVisible();
    await expect(page.getByText(content)).not.toBeVisible();
  });

  test('Test 5: Filter Posts', async ({ page }) => {
    // 1. Créer posts avec différents status
    const draftContent = `Draft Filter ${Date.now()}`;
    const scheduledContent = `Scheduled Filter ${Date.now()}`;

    // Create Draft
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(draftContent);
    await page.click('button:has-text("REVIEW")');
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();

    // Create Scheduled
    await page.getByPlaceholder('INPUT_CONTENT_STREAM...').fill(scheduledContent);
    await page.click('button:has-text("EXECUTE")'); // Default schedule +1h if no date? Or manual date needed?
    // Based on previous checks, EXECUTE without date might default to SCHEDULED or require date.
    // Composer logic: if (date) 'queue' else 'execute' -> 'SCHEDULED'. 
    // Wait, let's verify if date is auto-set. 
    // Actually, createPost endpoint sets SCHEDULED if scheduledFor is present.
    // Frontend sends scheduledFor only if date is set.
    // If we click EXECUTE without date, it might send status=SCHEDULED but no date?
    // Let's set a date to be safe.
    
    // We can't easily pick date in playwright without knowing the UI structure of the popover.
    // But let's assume EXECUTE attempts to schedule.
    // Actually in Composer.tsx: onClick={() => handleSubmit(date ? 'queue' : 'execute')}
    // If no date, action is 'execute', status = 'SCHEDULED'.
    // And backend create sets status.
    await expect(page.getByText('TRANSACTION_COMMITTED')).toBeVisible();

    // 2-5. Filters (Verify Columns acts as filters)
    // 2. Draft -> voir seulement drafts
    const draftsColumn = page.locator('text=Drafts').locator('xpath=./../..');
    await expect(draftsColumn.getByText(draftContent)).toBeVisible();
    await expect(draftsColumn.getByText(scheduledContent)).not.toBeVisible();

    // 3. Scheduled -> voir scheduled
    const queueColumn = page.locator('text=Queue').locator('xpath=./../..');
    await expect(queueColumn.getByText(scheduledContent)).toBeVisible();
    await expect(queueColumn.getByText(draftContent)).not.toBeVisible();
  });
});
