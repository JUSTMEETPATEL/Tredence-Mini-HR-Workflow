// ── E2E: Drag-and-drop node creation ─────────────────
import { test, expect } from '@playwright/test';

test.describe('HR Workflow Designer — Node Palette', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('node palette items are draggable', async ({ page }) => {
    // Verify all 5 node types have draggable attribute
    const startNode = page.getByText('Start Node').locator('..');
    await expect(startNode).toHaveAttribute('draggable', 'true');

    const taskNode = page.getByText('Task Node').locator('..');
    await expect(taskNode).toHaveAttribute('draggable', 'true');

    const approvalNode = page.getByText('Approval Node').locator('..');
    await expect(approvalNode).toHaveAttribute('draggable', 'true');

    const automatedStep = page.getByText('Automated Step').first().locator('..');
    await expect(automatedStep).toHaveAttribute('draggable', 'true');

    const endNode = page.getByText('End Node').locator('..');
    await expect(endNode).toHaveAttribute('draggable', 'true');
  });

  test('sidebar navigation links are visible', async ({ page }) => {
    await expect(page.getByText('Compliance')).toBeVisible();
    await expect(page.getByText('Scheduler')).toBeVisible();
    await expect(page.getByText('Analytics')).toBeVisible();
    await expect(page.getByText('Integrations')).toBeVisible();
    await expect(page.getByText('Workflows')).toBeVisible();
  });

  test('settings and help links are in sidebar footer', async ({ page }) => {
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Help & Support')).toBeVisible();
  });
});
