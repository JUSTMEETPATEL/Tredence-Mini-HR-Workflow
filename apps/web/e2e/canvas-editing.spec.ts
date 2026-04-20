import { test, expect, type Page } from '@playwright/test';

async function addNode(page: Page, type: 'start' | 'task' | 'end', x: number, y: number) {
  await page.locator(`[data-tutorial="tutorial-${type}-node"]`).dragTo(page.locator('.react-flow'), {
    targetPosition: { x, y },
  });
}

test.describe('HR Workflow Designer — Canvas editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('tredence_tutorial_completed', 'true');
      localStorage.removeItem('savedWorkflows');
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('copy and paste shortcuts duplicate selected nodes', async ({ page, browserName }) => {
    await addNode(page, 'start', 280, 180);
    await expect(page.locator('.react-flow__node-start')).toHaveCount(1);

    await page.locator('.react-flow__node-start').click();
    await page.keyboard.press(browserName === 'webkit' ? 'Meta+C' : 'Control+C');
    await page.keyboard.press(browserName === 'webkit' ? 'Meta+V' : 'Control+V');

    await expect(page.locator('.react-flow__node-start')).toHaveCount(2);
  });

  test('auto-connect links nodes in canvas order', async ({ page }) => {
    await addNode(page, 'start', 260, 180);
    await addNode(page, 'task', 520, 180);
    await addNode(page, 'end', 680, 180);

    await page.locator('button[title="Auto-connect nodes"]').click();

    await expect(page.locator('.react-flow__edge')).toHaveCount(2);
  });
});
