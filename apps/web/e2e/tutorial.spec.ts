import { test, expect } from '@playwright/test';

test.describe('HR Workflow Designer — Tutorial', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('tredence_tutorial_completed');
      localStorage.removeItem('savedWorkflows');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('starts with canvas movement and advances after two-finger pan', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    await expect(page.getByText('Step 1: Move Around')).toBeVisible();
    await expect(page.locator('.react-flow__node-start')).toHaveCount(0);

    await nextButton.click();

    await expect(page.getByTestId('tutorial-demo-cursor')).toBeVisible();
    await expect(page.getByText('Step 1: Move Around')).toBeHidden();
    await expect(page.locator('.react-flow__node-start')).toHaveCount(0);

    await page.locator('.react-flow').hover();
    await page.mouse.wheel(80, 40);

    await expect(page.getByText('Step 2: Start Node')).toBeVisible();
    await expect(page.getByTestId('tutorial-demo-cursor')).toBeHidden();
  });
});
