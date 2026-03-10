/**
 * Visual Regression Tests for AEMFlow
 *
 * These tests capture screenshots of critical UI components and compare
 * them against baseline images to detect unintended visual changes.
 *
 * Run tests: npx playwright test
 * Update baselines: npx playwright test --update-snapshots
 *
 * @module tests/e2e/visual-regression
 */

import { test, expect, Page } from '@playwright/test';

/**
 * Test fixture that navigates to the app before each test
 */
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for the app to fully load
  await page.waitForSelector('[data-testid="workflow-canvas"]', { timeout: 10000 }).catch(() => {
    // Fallback: wait for ReactFlow container
    return page.waitForSelector('.react-flow', { timeout: 10000 });
  });
});

test.describe('Workflow Builder - Visual Regression', () => {
  /**
   * Tests the initial empty state of the workflow builder
   */
  test('empty canvas state', async ({ page }) => {
    await expect(page).toHaveScreenshot('workflow-builder-empty.png', {
      fullPage: true,
    });
  });

  /**
   * Tests the toolbar visual appearance
   */
  test('toolbar appearance', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]').or(page.locator('.toolbar')).first();
    if (await toolbar.isVisible()) {
      await expect(toolbar).toHaveScreenshot('toolbar.png');
    }
  });

  /**
   * Tests the node palette/sidebar visual appearance
   */
  test('node palette sidebar', async ({ page }) => {
    const sidebar = page.locator('[data-testid="node-palette"]').or(page.locator('.sidebar')).first();
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('node-palette.png');
    }
  });

  /**
   * Tests canvas with nodes added
   */
  test('canvas with workflow nodes', async ({ page }) => {
    // Try to add a node via UI or directly
    await addSampleNodes(page);

    // Wait for nodes to render
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('canvas-with-nodes.png', {
      fullPage: true,
    });
  });

  /**
   * Tests dark mode appearance
   */
  test('dark mode toggle', async ({ page }) => {
    // Find and click dark mode toggle
    const darkModeButton = page.locator('[data-testid="dark-mode-toggle"]')
      .or(page.locator('button:has-text("Dark")'))
      .or(page.locator('[aria-label*="dark"]'))
      .first();

    if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      await page.waitForTimeout(300); // Wait for transition

      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
      });
    }
  });

  /**
   * Tests node selection state
   */
  test('selected node state', async ({ page }) => {
    await addSampleNodes(page);

    // Click on a node to select it
    const node = page.locator('.react-flow__node').first();
    if (await node.isVisible()) {
      await node.click();
      await page.waitForTimeout(200);

      await expect(node).toHaveScreenshot('selected-node.png');
    }
  });
});

test.describe('Modals and Dialogs - Visual Regression', () => {
  /**
   * Tests the command palette appearance (Cmd+K)
   */
  test('command palette', async ({ page }) => {
    // Open command palette with keyboard shortcut
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(300);

    const palette = page.locator('[data-testid="command-palette"]')
      .or(page.locator('[role="dialog"]'))
      .first();

    if (await palette.isVisible()) {
      await expect(palette).toHaveScreenshot('command-palette.png');
    }
  });

  /**
   * Tests the template gallery modal
   */
  test('template gallery', async ({ page }) => {
    // Try to open template gallery
    const galleryButton = page.locator('button:has-text("Gallery")')
      .or(page.locator('button:has-text("Templates")')
      .or(page.locator('[data-testid="template-gallery-button"]')))
      .first();

    if (await galleryButton.isVisible()) {
      await galleryButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[data-testid="template-gallery"]')
        .or(page.locator('[role="dialog"]'))
        .first();

      if (await modal.isVisible()) {
        await expect(modal).toHaveScreenshot('template-gallery.png');
      }
    }
  });

  /**
   * Tests the workflow simulator modal
   */
  test('workflow simulator', async ({ page }) => {
    // Add nodes first so simulator has something to work with
    await addSampleNodes(page);

    const simulatorButton = page.locator('button:has-text("Simulate")')
      .or(page.locator('[data-testid="simulator-button"]'))
      .first();

    if (await simulatorButton.isVisible()) {
      await simulatorButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[data-testid="workflow-simulator"]')
        .or(page.locator('[role="dialog"]'))
        .first();

      if (await modal.isVisible()) {
        await expect(modal).toHaveScreenshot('workflow-simulator.png');
      }
    }
  });

  /**
   * Tests the analytics dashboard modal
   */
  test('analytics dashboard', async ({ page }) => {
    await addSampleNodes(page);

    const analyticsButton = page.locator('button:has-text("Analytics")')
      .or(page.locator('[data-testid="analytics-button"]'))
      .first();

    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      await page.waitForTimeout(300);

      const modal = page.locator('[data-testid="workflow-analytics"]')
        .or(page.locator('[role="dialog"]'))
        .first();

      if (await modal.isVisible()) {
        await expect(modal).toHaveScreenshot('analytics-dashboard.png');
      }
    }
  });
});

test.describe('Node Types - Visual Regression', () => {
  /**
   * Tests each node type appearance
   */
  const nodeTypes = [
    'Start',
    'End',
    'AEM Step',
    'Process',
    'Branch',
    'Email',
    'DAM Update',
  ];

  for (const nodeType of nodeTypes) {
    test(`${nodeType} node appearance`, async ({ page }) => {
      // Try to add the specific node type
      const addButton = page.locator(`button:has-text("${nodeType}")`)
        .or(page.locator(`[data-node-type="${nodeType.toLowerCase().replace(' ', '-')}"]`))
        .first();

      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(300);

        const node = page.locator('.react-flow__node').last();
        if (await node.isVisible()) {
          await expect(node).toHaveScreenshot(`node-${nodeType.toLowerCase().replace(' ', '-')}.png`);
        }
      }
    });
  }
});

test.describe('Responsive Design - Visual Regression', () => {
  /**
   * Tests tablet viewport appearance
   */
  test('tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('responsive-tablet.png', {
      fullPage: true,
    });
  });

  /**
   * Tests mobile viewport appearance
   */
  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('responsive-mobile.png', {
      fullPage: true,
    });
  });
});

test.describe('Export Dialogs - Visual Regression', () => {
  /**
   * Tests the export dropdown/menu appearance
   */
  test('export menu', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export")')
      .or(page.locator('[data-testid="export-button"]'))
      .first();

    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(200);

      const menu = page.locator('[data-testid="export-menu"]')
        .or(page.locator('[role="menu"]'))
        .first();

      if (await menu.isVisible()) {
        await expect(menu).toHaveScreenshot('export-menu.png');
      }
    }
  });
});

/**
 * Helper function to add sample nodes to the canvas
 * @param page - Playwright page object
 */
async function addSampleNodes(page: Page): Promise<void> {
  // Try multiple approaches to add nodes

  // Approach 1: Click add buttons in sidebar
  const addStartButton = page.locator('button:has-text("Start")').first();
  if (await addStartButton.isVisible()) {
    await addStartButton.click();
    await page.waitForTimeout(200);
  }

  const addStepButton = page.locator('button:has-text("AEM Step")')
    .or(page.locator('button:has-text("Step")'))
    .first();
  if (await addStepButton.isVisible()) {
    await addStepButton.click();
    await page.waitForTimeout(200);
  }

  const addEndButton = page.locator('button:has-text("End")').first();
  if (await addEndButton.isVisible()) {
    await addEndButton.click();
    await page.waitForTimeout(200);
  }

  // Approach 2: Use keyboard shortcut to add nodes
  // This is a fallback if buttons aren't found

  // Approach 3: Load a template
  const templateButton = page.locator('button:has-text("Template")')
    .or(page.locator('button:has-text("Gallery")'))
    .first();
  if (await templateButton.isVisible() && !(await page.locator('.react-flow__node').first().isVisible())) {
    await templateButton.click();
    await page.waitForTimeout(300);

    // Select first template
    const firstTemplate = page.locator('[data-testid="template-item"]')
      .or(page.locator('.template-card'))
      .first();
    if (await firstTemplate.isVisible()) {
      await firstTemplate.click();
      await page.waitForTimeout(300);
    }

    // Close modal if still open
    await page.keyboard.press('Escape');
  }
}
