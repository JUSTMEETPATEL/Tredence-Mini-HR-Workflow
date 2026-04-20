// ── E2E: Toolbar actions ─────────────────────────────
import { test, expect } from '@playwright/test';

test.describe('HR Workflow Designer — Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('undo and redo buttons are present', async ({ page }) => {
    const undoBtn = page.locator('button[title="Undo (Ctrl+Z)"]');
    const redoBtn = page.locator('button[title="Redo (Ctrl+Shift+Z)"]');
    await expect(undoBtn).toBeVisible();
    await expect(redoBtn).toBeVisible();
  });

  test('theme mode buttons are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'System theme' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Light theme' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dark theme' })).toBeVisible();
  });

  test('import and export buttons are present', async ({ page }) => {
    const importBtn = page.locator('button[title="Import JSON File"]');
    const exportBtn = page.locator('button[title="Export JSON File"]');
    await expect(importBtn).toBeVisible();
    await expect(exportBtn).toBeVisible();
  });

  test('auto-layout button is present', async ({ page }) => {
    const layoutBtn = page.locator('button[title="Auto-layout (Horizontal)"]');
    await expect(layoutBtn).toBeVisible();
  });

  test('auto-connect button is present', async ({ page }) => {
    const connectBtn = page.locator('button[title="Auto-connect nodes"]');
    await expect(connectBtn).toBeVisible();
  });

  test('validate button is present', async ({ page }) => {
    const validateBtn = page.locator('button[title="Validate workflow"]');
    await expect(validateBtn).toBeVisible();
  });

  test('simulate button opens sandbox', async ({ page }) => {
    const simBtn = page.getByRole('button', { name: 'Simulate' });
    await simBtn.click();

    // Sandbox should open showing the run button
    await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  });
});
