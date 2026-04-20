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

  test('autosaves drafts and lets the user rename from workflow actions', async ({ page }) => {
    await addNode(page, 'start', 260, 180);

    await page.waitForFunction(() => {
      const raw = localStorage.getItem('savedWorkflows');
      if (!raw) return false;
      const workflows = JSON.parse(raw);
      return Array.isArray(workflows) && workflows.length === 1 && typeof workflows[0]?.name === 'string' && workflows[0].name.length > 0;
    });

    await page.getByRole('banner').getByRole('button', { name: 'Workflow actions' }).click();
    await page.getByText('Rename').click();
    await page.locator('input').fill('Payroll Cycle Flow');
    await page.getByRole('button', { name: 'Rename' }).click();

    await expect(page.getByRole('banner').getByText('Payroll Cycle Flow')).toBeVisible();

    await page.waitForFunction(() => {
      const raw = localStorage.getItem('savedWorkflows');
      if (!raw) return false;
      const workflows = JSON.parse(raw);
      return workflows[0]?.name === 'Payroll Cycle Flow' && workflows[0]?.nameSource === 'manual';
    });
  });
});
