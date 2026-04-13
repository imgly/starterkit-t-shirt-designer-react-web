/**
 * Type Definitions
 *
 * Shared types for scene operations and product editing.
 */

import type { Source } from '@cesdk/cesdk-js';

// Export DesignUnit for convenience
export type { DesignUnit, Source } from '@cesdk/cesdk-js';

/**
 * Configuration for a design area (page).
 */
export interface AreaConfig {
  id: string;
  pageSize: {
    width: number;
    height: number;
  };
}

/**
 * Configuration for a backdrop image behind the design area.
 */
export interface BackdropConfig {
  images: Source[];
  printableAreaPx: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Configuration for mask overlays (editing and exporting).
 */
export interface MaskConfig {
  editingUrl?: string;
  exportingUrl?: string;
}

/**
 * Product metadata interface for the area selector.
 * This is read from scene metadata (stored by App.tsx).
 */
export interface ProductMetadata {
  areas: Array<{ id: string; label: string; disabled?: boolean }>;
}
