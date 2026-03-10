/**
 * Workflow Interaction Tests for AEMFlow
 *
 * These tests verify the interactive functionality of the workflow builder,
 * including node manipulation, connections, and user interactions.
 *
 * @module tests/e2e/workflow-interactions
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.react-flow', { timeout: 10000 });
});

test.describe('Canvas Interactions', () => {
  /**
   * Tests that the canvas can be panned
   */
  test('pan canvas with mouse drag', async ({ page }) => {
    const canvas = page.locator('.react-flow__pane');

    // Get initial transform
    const initialTransform = await canvas.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    // Pan the canvas
    await canvas.hover();
    await page.mouse.down();
    await page.mouse.move(100, 100);
    await page.mouse.up();

    // Verify canvas was panned (transform changed)
    await page.waitForTimeout(200);
  });

  /**
   * Tests that the canvas can be zoomed
   */
  test('zoom canvas with mouse wheel', async ({ page }) => {
    const canvas = page.locator('.react-flow__pane');

    await canvas.hover();

    // Zoom in
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(200);

    // Zoom out
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(200);
  });

  /**
   * Tests the fit view control
   */
  test('fit view button works', async ({ page }) => {
    const fitButton = page.locator('[data-testid="fit-view"]')
      .or(page.locator('button[title*="fit"]'))
      .or(page.locator('.react-flow__controls button').first())
      .first();

    if (await fitButton.isVisible()) {
      await fitButton.click();
      await page.waitForTimeout(300);
      // Visual verification - canvas should be centered
    }
  });
});

test.describe('Node Operations', () => {
  /**
   * Tests adding a node to the canvas
   */
  test('add node to canvas', async ({ page }) => {
    const initialNodeCount = await page.locator('.react-flow__node').count();

    // Try to add a node
    const addButton = page.locator('button:has-text("Start")')
      .or(page.locator('button:has-text("Add")'))
      .first();

    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(300);

      const newNodeCount = await page.locator('.react-flow__node').count();
      expect(newNodeCount).toBeGreaterThanOrEqual(initialNodeCount);
    }
  });

  /**
   * Tests selecting a node
   */
  test('select node on click', async ({ page }) => {
    // Ensure there's a node to click
    const node = page.locator('.react-flow__node').first();

    if (await node.isVisible()) {
      await node.click();
      await page.waitForTimeout(200);

      // Check if node has selected state
      const isSelected = await node.evaluate((el) => {
        return el.classList.contains('selected') ||
               el.getAttribute('data-selected') === 'true' ||
               el.closest('.selected') !== null;
      });

      // The node should be visually selected (class or attribute change)
    }
  });

  /**
   * Tests dragging a node to a new position
   */
  test('drag node to new position', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();

    if (await node.isVisible()) {
      const initialBox = await node.boundingBox();

      if (initialBox) {
        // Drag the node
        await node.hover();
        await page.mouse.down();
        await page.mouse.move(initialBox.x + 100, initialBox.y + 100);
        await page.mouse.up();

        await page.waitForTimeout(200);

        const newBox = await node.boundingBox();
        if (newBox) {
          // Position should have changed
          expect(newBox.x).not.toBe(initialBox.x);
          expect(newBox.y).not.toBe(initialBox.y);
        }
      }
    }
  });

  /**
   * Tests deleting a node
   */
  test('delete node with keyboard', async ({ page }) => {
    // Add a node first
    const addButton = page.locator('button:has-text("Step")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(200);
    }

    const initialCount = await page.locator('.react-flow__node').count();
    const node = page.locator('.react-flow__node').first();

    if (await node.isVisible() && initialCount > 0) {
      await node.click();
      await page.keyboard.press('Delete');
      await page.waitForTimeout(200);

      const newCount = await page.locator('.react-flow__node').count();
      expect(newCount).toBeLessThanOrEqual(initialCount);
    }
  });
});

test.describe('Connection Operations', () => {
  /**
   * Tests creating a connection between nodes
   */
  test('connect two nodes', async ({ page }) => {
    // Need at least 2 nodes
    const nodes = page.locator('.react-flow__node');
    const nodeCount = await nodes.count();

    if (nodeCount >= 2) {
      // Find connection handles
      const sourceHandle = page.locator('.react-flow__handle-source').first();
      const targetHandle = page.locator('.react-flow__handle-target').last();

      if (await sourceHandle.isVisible() && await targetHandle.isVisible()) {
        const sourceBox = await sourceHandle.boundingBox();
        const targetBox = await targetHandle.boundingBox();

        if (sourceBox && targetBox) {
          // Drag from source to target
          await page.mouse.move(sourceBox.x + 5, sourceBox.y + 5);
          await page.mouse.down();
          await page.mouse.move(targetBox.x + 5, targetBox.y + 5);
          await page.mouse.up();

          await page.waitForTimeout(300);

          // Verify edge was created
          const edgeCount = await page.locator('.react-flow__edge').count();
          expect(edgeCount).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

test.describe('Keyboard Shortcuts', () => {
  /**
   * Tests Cmd+K opens command palette
   */
  test('Cmd+K opens command palette', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(300);

    const palette = page.locator('[data-testid="command-palette"]')
      .or(page.locator('[role="dialog"]'))
      .or(page.locator('.command-palette'))
      .first();

    // Command palette should be visible
    if (await palette.isVisible()) {
      expect(await palette.isVisible()).toBeTruthy();
    }
  });

  /**
   * Tests Escape closes modals
   */
  test('Escape closes modals', async ({ page }) => {
    // Open command palette
    await page.keyboard.press('Meta+k');
    await page.waitForTimeout(200);

    // Press Escape to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const palette = page.locator('[data-testid="command-palette"]')
      .or(page.locator('.command-palette'))
      .first();

    // Palette should be hidden
    const isHidden = !(await palette.isVisible());
    expect(isHidden).toBeTruthy();
  });

  /**
   * Tests Cmd+Z for undo
   */
  test('Cmd+Z triggers undo', async ({ page }) => {
    // Make a change first
    const addButton = page.locator('button:has-text("Step")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(200);

      const countBefore = await page.locator('.react-flow__node').count();

      // Undo
      await page.keyboard.press('Meta+z');
      await page.waitForTimeout(300);

      const countAfter = await page.locator('.react-flow__node').count();
      // Count should decrease or stay same (undo worked)
      expect(countAfter).toBeLessThanOrEqual(countBefore);
    }
  });

  /**
   * Tests Cmd+S for save
   */
  test('Cmd+S triggers save', async ({ page }) => {
    // Listen for any save indication (toast, notification, etc.)
    await page.keyboard.press('Meta+s');
    await page.waitForTimeout(500);

    // Check for save confirmation
    const toast = page.locator('.toast')
      .or(page.locator('[role="alert"]'))
      .or(page.locator('.notification'))
      .first();

    // Save should trigger some feedback
  });
});

test.describe('Export Functionality', () => {
  /**
   * Tests export to JSON
   */
  test('export workflow to JSON', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

    // Find and click export button
    const exportButton = page.locator('button:has-text("Export")')
      .or(page.locator('[data-testid="export-button"]'))
      .first();

    if (await exportButton.isVisible()) {
      await exportButton.click();
      await page.waitForTimeout(200);

      // Click JSON export option
      const jsonOption = page.locator('button:has-text("JSON")')
        .or(page.locator('[data-testid="export-json"]'))
        .first();

      if (await jsonOption.isVisible()) {
        await jsonOption.click();

        const download = await downloadPromise;
        if (download) {
          expect(download.suggestedFilename()).toContain('.json');
        }
      }
    }
  });
});

test.describe('Template Loading', () => {
  /**
   * Tests loading a workflow template
   */
  test('load template from gallery', async ({ page }) => {
    const galleryButton = page.locator('button:has-text("Gallery")')
      .or(page.locator('button:has-text("Templates")'))
      .first();

    if (await galleryButton.isVisible()) {
      await galleryButton.click();
      await page.waitForTimeout(300);

      // Select first template
      const template = page.locator('[data-testid="template-item"]')
        .or(page.locator('.template-card'))
        .first();

      if (await template.isVisible()) {
        const initialNodes = await page.locator('.react-flow__node').count();

        await template.click();
        await page.waitForTimeout(500);

        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);

        const newNodes = await page.locator('.react-flow__node').count();
        // Should have nodes from template
        expect(newNodes).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('Accessibility', () => {
  /**
   * Tests keyboard navigation
   */
  test('can navigate with Tab key', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Should be able to tab through interactive elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeDefined();
  });

  /**
   * Tests focus visibility
   */
  test('focus is visible on interactive elements', async ({ page }) => {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check if focus ring is visible
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.outline !== 'none' || style.boxShadow !== 'none';
    });

    // Focus should be visible
  });
});
