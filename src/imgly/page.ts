/**
 * Page and Scene Operations
 *
 * Functions for creating and managing pages (areas) within a scene,
 * scene metadata, and view navigation.
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { CreativeEngine, DesignUnit } from '@cesdk/cesdk-js';

import { ZOOM_PADDING } from './constants';
import type { AreaConfig } from './types';
import { showBackdrop } from './backdrop';

// ─── Page Operations ──────────────────────────────────────────────────────────

function createPage(engine: CreativeEngine): number {
  const page = engine.block.create('page');
  engine.block.appendChild(engine.scene.get()!, page);

  // Transparent background
  const fill = engine.block.getFill(page);
  engine.block.setFill(page, fill);
  engine.block.setColor(fill, 'fill/color/value', { r: 0, g: 0, b: 0, a: 0 });

  // Black stroke
  engine.block.setStrokeColor(page, { r: 0, g: 0, b: 0, a: 1 });
  engine.block.setStrokeEnabled(page, true);
  engine.block.setStrokeStyle(page, 'Solid');

  // Non-selectable and clipped
  engine.block.setScopeEnabled(page, 'editor/select', false);
  engine.editor.setSelectionEnabled(page, false);
  engine.block.setClipped(page, true);

  return page;
}

function setupPage(
  engine: CreativeEngine,
  page: number,
  area: AreaConfig,
  hasMasks: boolean
): void {
  const { width, height } = area.pageSize;

  engine.block.resizeContentAware([page], width, height);

  engine.block.setPositionX(page, 0);
  engine.block.setPositionY(page, 0);

  engine.block.setStrokeWidth(page, width * 0.005);
  engine.block.setStrokeEnabled(page, !hasMasks);
  engine.block.setName(page, area.id);
}

// ─── Scene Operations ─────────────────────────────────────────────────────────

/**
 * Create or update the scene with the given areas.
 *
 * @param engine - The CE.SDK engine instance
 * @param areas - Array of area configurations (pages to create)
 * @param designUnit - The design unit for the scene
 * @param hasMasks - Whether any area has masks (affects page stroke visibility)
 */
export function createOrUpdateScene(
  engine: CreativeEngine,
  areas: AreaConfig[],
  designUnit: DesignUnit,
  hasMasks: boolean = false
): void {
  if (!engine.scene) return;
  if (!engine.scene.get()) engine.scene.create('Free');

  engine.scene.setDesignUnit(designUnit);

  // Create/update pages
  const usedPages = areas.map((area) => {
    const existing = engine.block.findByName(area.id);
    const page = existing.length ? existing[0] : createPage(engine);
    setupPage(engine, page, area, hasMasks);
    return page;
  });

  // Remove unused pages
  engine.block
    .findByType('page')
    .filter((page) => !usedPages.includes(page))
    .forEach((page) => engine.block.destroy(page));
}

// ─── View Operations ──────────────────────────────────────────────────────────

/**
 * Get the currently visible area ID.
 */
export function getVisibleAreaId(engine: CreativeEngine): string | null {
  const pages = engine.block.findByType('page');
  const visiblePage = pages.find((page) => engine.block.isVisible(page));
  return visiblePage ? engine.block.getName(visiblePage) : null;
}

/**
 * Switch the editor view to a specific area (page).
 *
 * @param cesdk - The CreativeEditorSDK instance
 * @param areaId - The ID of the area to switch to
 */
export async function switchArea(
  cesdk: CreativeEditorSDK,
  areaId: string
): Promise<void> {
  const engine = cesdk.engine;

  // Switch page
  const [pageBlock] = engine.block.findByName(areaId);
  if (pageBlock == null) return;
  await cesdk.unstable_switchPage(pageBlock);

  // Show backdrop
  showBackdrop(engine, areaId);

  // Zoom to backdrop
  const backdropBlock = engine.block.findByName(`Backdrop-${areaId}`)[0];
  if (backdropBlock != null) {
    await cesdk.actions.run('zoom.toBlock', backdropBlock, {
      padding: ZOOM_PADDING,
      animate: false,
      autoFit: true
    });
  }

  // Deselect any blocks that were auto-selected by switchPage
  engine.block.findAllSelected().forEach((block) => {
    engine.block.setSelected(block, false);
  });
}
