/**
 * Mask Operations
 *
 * Functions for creating and managing mask overlays for non-rectangular shapes.
 * Masks are positioned relative to the backdrop and provide visual boundaries
 * for editing and exporting.
 */

import type { CreativeEngine } from '@cesdk/cesdk-js';

import { MASK_BLOCK_KIND, METADATA_KEYS } from './constants';
import type { MaskConfig } from './types';
import { calculateBlockLayout, getPageBackdropConfig } from './backdrop';

// ─── Page Mask Metadata ───────────────────────────────────────────────────────

/**
 * Store mask URLs in page metadata for later retrieval during export.
 */
function setPageMaskUrls(
  engine: CreativeEngine,
  pageBlock: number,
  config: MaskConfig
): void {
  if (config.editingUrl) {
    engine.block.setMetadata(
      pageBlock,
      METADATA_KEYS.MASK_EDITING,
      config.editingUrl
    );
  }
  if (config.exportingUrl) {
    engine.block.setMetadata(
      pageBlock,
      METADATA_KEYS.MASK_EXPORTING,
      config.exportingUrl
    );
  }
}

/**
 * Get mask URL from page metadata.
 */
export function getPageMaskUrl(
  engine: CreativeEngine,
  pageBlock: number,
  type: 'editing' | 'exporting'
): string | null {
  const key =
    type === 'editing'
      ? METADATA_KEYS.MASK_EDITING
      : METADATA_KEYS.MASK_EXPORTING;
  return engine.block.getMetadata(pageBlock, key) || null;
}

// ─── Mask Operations ──────────────────────────────────────────────────────────

/**
 * Create a mask block for an area.
 */
function createMaskBlock(
  engine: CreativeEngine,
  pageBlock: number,
  areaId: string,
  maskUrl: string,
  maskType: 'editing' | 'exporting'
): number {
  const config = getPageBackdropConfig(engine, pageBlock);
  if (!config) {
    throw new Error(`No backdrop config found for area: ${areaId}`);
  }

  const layout = calculateBlockLayout(engine.block.getWidth(pageBlock), config);

  const block = engine.block.create('graphic');
  engine.block.setKind(block, MASK_BLOCK_KIND);
  engine.block.setName(block, `Mask-${maskType}-${areaId}`);

  engine.block.setShape(block, engine.block.createShape('rect'));

  const fill = engine.block.createFill('image');
  engine.block.setString(fill, 'fill/image/imageFileURI', maskUrl);
  engine.block.setFill(block, fill);

  engine.block.setWidth(block, layout.width);
  engine.block.setHeight(block, layout.height);
  engine.block.setPositionX(block, layout.x);
  engine.block.setPositionY(block, layout.y);

  engine.block.appendChild(pageBlock, block);
  engine.block.setScopeEnabled(block, 'editor/select', false);
  engine.editor.setSelectionEnabled(block, false);
  engine.block.setAlwaysOnTop(block, true);

  return block;
}

/**
 * Set mask configuration for an area.
 * Stores URLs in page metadata for later use.
 */
export function setMaskConfig(
  engine: CreativeEngine,
  areaId: string,
  config: MaskConfig
): void {
  const [pageBlock] = engine.block.findByName(areaId);
  if (pageBlock == null) return;

  setPageMaskUrls(engine, pageBlock, config);
}

/**
 * Clear all masks from the scene.
 */
export function clearMasks(engine: CreativeEngine): void {
  engine.block
    .findByKind(MASK_BLOCK_KIND)
    .forEach((block) => engine.block.destroy(block));
}

/**
 * Update masks for all pages based on type (editing or exporting).
 * Reads mask URLs from page metadata.
 */
export function updateMasks(
  engine: CreativeEngine,
  type: 'editing' | 'exporting'
): void {
  clearMasks(engine);

  const pages = engine.block.findByType('page');
  for (const pageBlock of pages) {
    const areaId = engine.block.getName(pageBlock);
    const maskUrl = getPageMaskUrl(engine, pageBlock, type);

    if (maskUrl) {
      createMaskBlock(engine, pageBlock, areaId, maskUrl, type);
    }
  }
}
