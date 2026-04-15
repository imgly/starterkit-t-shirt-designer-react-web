/**
 * Constants
 *
 * Shared constants for scene operations and product editing.
 */

/**
 * Block kind identifier for backdrop images.
 */
export const BACKDROP_BLOCK_KIND = 'backdrop_image';

/**
 * Block kind identifier for mask images.
 */
export const MASK_BLOCK_KIND = 'mask_image';

/**
 * Metadata keys used for storing scene data.
 */
export const METADATA_KEYS = {
  MASK_EDITING: 'mask_editing_url',
  MASK_EXPORTING: 'mask_exporting_url',
  BACKDROP_CONFIG: 'backdrop_config'
} as const;

/**
 * Default padding for zoom operations.
 */
export const ZOOM_PADDING = {
  left: 40,
  top: 80,
  right: 40,
  bottom: 100
} as const;
