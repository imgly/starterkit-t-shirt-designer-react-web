/**
 * Canvas Configuration - Canvas Bar and Context Menu
 *
 * Configure the canvas bar (top/bottom of canvas) and right-click context menu.
 * Different edit modes can have different menu configurations.
 *
 * ## Edit Modes
 *
 * - `'Transform'`: Default mode for selecting and moving blocks
 * - `'Text'`: Text editing mode (when editing text content)
 * - `'Crop'`: Crop mode (when cropping images)
 * - `'Trim'`: Trim mode (when trimming video/audio)
 *
 * ## Canvas Bar Position
 *
 * The canvas bar can be positioned at `'top'` or `'bottom'` of the canvas.
 *
 * @see https://img.ly/docs/cesdk/js/user-interface/customization/canvas-632c8e/
 * @see https://img.ly/docs/cesdk/js/user-interface/customization/canvas-menu-0d2b5b/
 */

import type CreativeEditorSDK from '@cesdk/cesdk-js';

/**
 * Configure the canvas bar and context menu.
 *
 * @param cesdk - The CreativeEditorSDK instance to configure
 */
export function setupCanvas(cesdk: CreativeEditorSDK): void {
  // ============================================================================
  // CANVAS BAR CONFIGURATION
  // Bottom canvas bar shows the product area selector (Front/Back).
  // The component dynamically renders only for multi-area products.
  // ============================================================================

  // #region Canvas Bar
  // Canvas bar is empty - area selection is handled by the sidebar
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.bar', at: 'bottom' /* Position: 'top' | 'bottom' */ },
    []
  );
  // #endregion

  // ============================================================================
  // CANVAS MENU - TRANSFORM MODE
  // Context menu when blocks are selected in default mode
  // ============================================================================

  // #region Canvas Menu - Transform Mode
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.menu', when: { editMode: 'Transform' } },
    [
      // ============================
      // Group Navigation
      // ============================
      'ly.img.group.enter.canvasMenu',
      'ly.img.group.select.canvasMenu',
      'ly.img.separator',

      // ============================
      // Content Editing
      // ============================
      'ly.img.text.edit.canvasMenu',
      'ly.img.replace.canvasMenu',
      'ly.img.separator',

      // ============================
      // Layer Ordering
      // ============================
      'ly.img.bringForward.canvasMenu',
      'ly.img.sendBackward.canvasMenu',
      'ly.img.separator',

      // ============================
      // Common Operations
      // ============================
      'ly.img.duplicate.canvasMenu',
      'ly.img.delete.canvasMenu',
      'ly.img.separator',
      'ly.img.options.canvasMenu'
    ]
  );
  // #endregion

  // ============================================================================
  // CANVAS MENU - TEXT MODE
  // Context menu when editing text content
  // ============================================================================

  // #region Canvas Menu - Text Mode
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.menu', when: { editMode: 'Text' } },
    [
      'ly.img.text.color.canvasMenu',
      'ly.img.separator',
      'ly.img.text.bold.canvasMenu',
      'ly.img.text.italic.canvasMenu',
      'ly.img.text.underline.canvasMenu',
      'ly.img.text.strikethrough.canvasMenu',
      'ly.img.separator',
      'ly.img.text.list.unordered.canvasMenu',
      'ly.img.text.list.ordered.canvasMenu',
      'ly.img.separator',
      'ly.img.text.variables.canvasMenu'
    ]
  );
  // #endregion

  // ============================================================================
  // CANVAS MENU - CROP MODE
  // Context menu when cropping images
  // Note: Crop controls are primarily in the inspector bar.
  // Canvas menu provides quick access to flip and options.
  // ============================================================================

  // #region Canvas Menu - Crop Mode
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.menu', when: { editMode: 'Crop' } },
    [
      'ly.img.flipX.canvasMenu',
      'ly.img.flipY.canvasMenu',
      'ly.img.separator',
      'ly.img.options.canvasMenu'
    ]
  );
  // #endregion

  // ============================================================================
  // CANVAS MENU - VECTOR MODE
  // Empty context menu when editing vector paths
  // ============================================================================

  // #region Canvas Menu - Vector Mode
  cesdk.ui.setComponentOrder(
    { in: 'ly.img.canvas.menu', when: { editMode: 'Vector' } },
    []
  );
  // #endregion
}
