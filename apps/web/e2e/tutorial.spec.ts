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

  test('next button starts the looping cursor demo without auto-placing nodes', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    await expect(page.getByText('Step 1: Start Node')).toBeVisible();
    await expect(page.locator('.react-flow__node-start')).toHaveCount(0);

    await nextButton.click();

    await expect(page.getByTestId('tutorial-demo-cursor')).toBeVisible();
    await expect(page.getByText('Step 1: Start Node')).toBeHidden();
    await expect(page.locator('.react-flow__node-start')).toHaveCount(0);
  });
});
