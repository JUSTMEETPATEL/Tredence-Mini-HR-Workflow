// ── E2E: Page loads and basic structure ──────────────
import { test, expect } from '@playwright/test';

test.describe('HR Workflow Designer — App Shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for MSW to initialize
    await page.waitForLoadState('networkidle');
  });

  test('renders the top bar with logo and title', async ({ page }) => {
    await expect(page.getByText('CodeAuto')).toBeVisible();
    await expect(page.getByText('HR Workflow Designer')).toBeVisible();
  });

  test('renders the sidebar with navigation and node palette', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Node Palette')).toBeVisible();
    await expect(page.getByText('Start Node')).toBeVisible();
    await expect(page.getByText('Task Node')).toBeVisible();
    await expect(page.getByText('Approval Node')).toBeVisible();
    await expect(page.getByText('Automated Step')).toBeVisible();
    await expect(page.getByText('End Node')).toBeVisible();
  });

  test('renders the empty canvas', async ({ page }) => {
    // React Flow renders a container with class react-flow
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('shows right panel placeholder when no node selected', async ({ page }) => {
    await expect(page.getByText('Select a node to configure it')).toBeVisible();
  });

  test('shows simulation sandbox toggle button', async ({ page }) => {
    await expect(page.getByText('Simulation Sandbox')).toBeVisible();
  });
});
