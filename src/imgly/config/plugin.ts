/**
 * Product Editor Plugin - Configuration for CE.SDK Product Mockup Editing
 *
 * This plugin provides a product editor configuration optimized for
 * designing on product mockups (t-shirts, mugs, phone cases, etc.).
 *
 * @example Basic usage
 * ```typescript
 * import CreativeEditorSDK from '@cesdk/cesdk-js';
 * import { ProductEditorConfig } from './plugin';
 *
 * const cesdk = await CreativeEditorSDK.create('#editor', config);
 * await cesdk.addPlugin(new ProductEditorConfig());
 * ```
 */

import type { EditorPlugin, EditorPluginContext } from '@cesdk/cesdk-js';
import CreativeEditorSDK from '@cesdk/cesdk-js';

import { setupActions } from './actions';
import { setupFeatures } from './features';
import { setupTranslations } from './i18n';
import { setupSettings } from './settings';
import { setupUI } from './ui';

/**
 * Product Editor configuration plugin.
 *
 * Provides a product mockup editing experience optimized for
 * designing on physical products with printable areas.
 *
 * @public
 */
export class ProductEditorConfig implements EditorPlugin {
  /**
   * Unique identifier for this plugin.
   */
  name = 'cesdk-product-editor';

  /**
   * Plugin version - matches the CE.SDK version for compatibility.
   */
  version = CreativeEditorSDK.version;

  /**
   * Initialize the product editor configuration.
   *
   * @param ctx - The editor plugin context containing cesdk and engine instances
   */
  async initialize({ cesdk, engine }: EditorPluginContext) {
    if (cesdk) {
      // Reset editor to clear any previous configuration
      cesdk.resetEditor();

      // Configure which features are available
      setupFeatures(cesdk);

      // Configure the UI layout
      setupUI(cesdk);

      // Configure export, save, and share actions
      setupActions(cesdk);

      // Set custom translations and labels
      setupTranslations(cesdk);

      // Configure engine settings
      setupSettings(engine);

      // Re-apply deprecated configuration options
      cesdk.reapplyLegacyUserConfiguration();
    }
  }
}
