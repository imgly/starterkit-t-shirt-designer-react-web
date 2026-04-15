/**
 * Backdrop Operations
 *
 * Functions for creating and managing backdrop images behind the design area.
 * Backdrops are positioned relative to the printable area and provide the
 * visual context (e.g., t-shirt mockup) for the design.
 */

import type { CreativeEngine } from '@cesdk/cesdk-js';

import { BACKDROP_BLOCK_KIND, METADATA_KEYS } from './constants';
import type { BackdropConfig, Source } from './types';

// ─── Layout Helpers ───────────────────────────────────────────────────────────

export interface BlockLayout {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Calculate block dimensions and position from backdrop config.
 * Converts pixel coordinates to design units based on page width.
 */
export function calculateBlockLayout(
  pageWidth: number,
  config: BackdropConfig
): BlockLayout {
  const image = config.images[0];
  if (!image) {
    throw new Error('Backdrop configuration must include images');
  }

  const scale = pageWidth / config.printableAreaPx.width;
  return {
    width: image.width * scale,
    height: image.height * scale,
    x: -config.printableAreaPx.x * scale,
    y: -config.printableAreaPx.y * scale
  };
}

// ─── Page Backdrop Config ─────────────────────────────────────────────────────

/**
 * Store backdrop config in page metadata for layout calculations.
 */
function setPageBackdropConfig(
  engine: CreativeEngine,
  pageBlock: number,
  config: BackdropConfig
): void {
  engine.block.setMetadata(
    pageBlock,
    METADATA_KEYS.BACKDROP_CONFIG,
    JSON.stringify(config)
  );
}

/**
 * Get backdrop config from page metadata.
 */
export function getPageBackdropConfig(
  engine: CreativeEngine,
  pageBlock: number
): BackdropConfig | null {
  const data = engine.block.getMetadata(
    pageBlock,
    METADATA_KEYS.BACKDROP_CONFIG
  );
  if (!data) return null;
  return JSON.parse(data) as BackdropConfig;
}

// ─── Backdrop Operations ──────────────────────────────────────────────────────

/**
 * Create a backdrop block for an area.
 */
function createBackdropBlock(
  engine: CreativeEngine,
  areaId: string,
  config: BackdropConfig,
  pageBlock: number
): number {
  const block = engine.block.create('graphic');
  engine.block.setKind(block, BACKDROP_BLOCK_KIND);
  engine.block.setName(block, `Backdrop-${areaId}`);

  engine.block.setShape(block, engine.block.createShape('rect'));
  engine.block.setFill(block, engine.block.createFill('image'));

  engine.block.setScopeEnabled(block, 'editor/select', false);
  engine.editor.setSelectionEnabled(block, false);

  if (config.images.length) {
    const layout = calculateBlockLayout(
      engine.block.getWidth(pageBlock),
      config
    );
    engine.block.setWidth(block, layout.width);
    engine.block.setHeight(block, layout.height);
    engine.block.setPositionX(block, layout.x);
    engine.block.setPositionY(block, layout.y);
    engine.block.resetCrop(block);
  }

  // Insert behind other elements
  engine.block.insertChild(engine.scene.get()!, block, 0);
  return block;
}

/**
 * Update backdrop images for an area.
 */
export function updateBackdropImages(
  engine: CreativeEngine,
  areaId: string,
  images: Source[]
): void {
  const block = engine.block.findByName(`Backdrop-${areaId}`)[0];
  if (block == null || !images.length) return;

  const fill = engine.block.getFill(block)!;
  engine.block.setSourceSet(fill, 'fill/image/sourceSet', images);
}

/**
 * Show backdrop for an area, hiding all others.
 */
export function showBackdrop(engine: CreativeEngine, areaId: string): void {
  // Hide all backdrops
  engine.block
    .findByKind(BACKDROP_BLOCK_KIND)
    .forEach((block) => engine.block.setVisible(block, false));

  // Show target
  const block = engine.block.findByName(`Backdrop-${areaId}`)[0];
  if (block != null) engine.block.setVisible(block, true);
}

/**
 * Create backdrop for an area.
 */
export function createBackdrop(
  engine: CreativeEngine,
  areaId: string,
  config: BackdropConfig
): void {
  const [pageBlock] = engine.block.findByName(areaId);
  if (!pageBlock) {
    throw new Error(`No page block found for area: ${areaId}`);
  }

  // Store config in page metadata
  setPageBackdropConfig(engine, pageBlock, config);

  // Create backdrop block
  const backdrop = createBackdropBlock(engine, areaId, config, pageBlock);

  // Set initial images
  if (config.images.length) {
    updateBackdropImages(engine, areaId, config.images);
  }

  engine.block.setVisible(backdrop, false);
}

/**
 * Clear all backdrops from the scene.
 */
export function clearBackdrops(engine: CreativeEngine): void {
  engine.block
    .findByKind(BACKDROP_BLOCK_KIND)
    .forEach((block) => engine.block.destroy(block));
}
