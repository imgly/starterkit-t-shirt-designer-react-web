/**
 * Product Scene Utilities
 *
 * Functions for mapping product configurations to CE.SDK scene operations.
 * These utilities bridge the gap between product data and the generic
 * scene functions in imgly/.
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

import {
  createOrUpdateScene,
  createBackdrop,
  updateBackdropImages,
  setMaskConfig,
  updateMasks,
  clearBackdrops,
  clearMasks,
  type Source
} from '../../imgly';

import type { ProductConfig, ProductColor } from '../product-catalog';

/**
 * Apply color to backdrop image URLs.
 * Replaces {{color}} placeholder with actual color ID.
 */
export function applyColorToImages(
  images: Source[],
  colorId: string
): Source[] {
  return images.map((img) => ({
    ...img,
    uri: img.uri.replace('{{color}}', colorId)
  }));
}

/**
 * Set up the scene for a product.
 * Creates pages, backdrops, and masks from product configuration.
 */
export async function setupProductScene(
  cesdk: CreativeEditorSDK,
  product: ProductConfig,
  color: ProductColor
): Promise<void> {
  const engine = cesdk.engine;
  const enabledAreas = product.areas.filter((area) => !area.disabled);

  // Clear masks before destroying pages (masks are children of pages)
  clearMasks(engine);

  // Check if any area has masks
  const hasMasks = enabledAreas.some(
    (area) => area.mockup?.editingMaskUrl || area.mockup?.exportingMaskUrl
  );

  // Create scene with pages
  createOrUpdateScene(
    engine,
    enabledAreas.map((area) => ({
      id: area.id,
      pageSize: area.pageSize
    })),
    product.designUnit,
    hasMasks
  );

  // Clear existing backdrops (in case of product change)
  clearBackdrops(engine);

  // Create backdrops and masks for each area
  for (const area of enabledAreas) {
    if (!area.mockup) continue;

    // Create backdrop with color-applied images
    const images = area.mockup.images
      ? applyColorToImages(area.mockup.images, color.id)
      : [];

    createBackdrop(engine, area.id, {
      images,
      printableAreaPx: area.mockup.printableAreaPx
    });

    // Set mask config if area has masks
    if (area.mockup.editingMaskUrl || area.mockup.exportingMaskUrl) {
      setMaskConfig(engine, area.id, {
        editingUrl: area.mockup.editingMaskUrl,
        exportingUrl: area.mockup.exportingMaskUrl
      });
    }
  }

  // Apply editing masks
  if (hasMasks) {
    updateMasks(engine, 'editing');
  }

  // Store product data in scene metadata for reference
  const scene = engine.scene.get();
  if (scene != null) {
    engine.block.setMetadata(scene, 'product', JSON.stringify(product));
    engine.block.setMetadata(scene, 'color', JSON.stringify(color));
  }
}

/**
 * Update backdrops for a color change.
 */
export function updateProductColor(
  cesdk: CreativeEditorSDK,
  product: ProductConfig,
  color: ProductColor
): void {
  const engine = cesdk.engine;

  for (const area of product.areas.filter((item) => !item.disabled)) {
    if (!area.mockup?.images) continue;

    const images = applyColorToImages(area.mockup.images, color.id);
    updateBackdropImages(engine, area.id, images);
  }

  // Update stored color
  const scene = engine.scene.get();
  if (scene != null) {
    engine.block.setMetadata(scene, 'color', JSON.stringify(color));
  }
}
