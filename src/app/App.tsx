/**
 * CE.SDK T-Shirt Designer - Main App Component
 *
 * This component orchestrates all product-related logic. The imgly folder
 * contains agnostic editor functions - all product-specific operations
 * are handled here by mapping product data to generic scene functions.
 *
 * The CreativeEditor component is passed as children from index.tsx,
 * while cesdk instance is provided via prop for product operations.
 */

import { useEffect, useState, type ReactNode } from 'react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';

import { initTShirtDesigner, switchArea } from '../imgly';

import { PRODUCT_SAMPLES, ProductColor } from './product-catalog';
import { setupProductScene, updateProductColor } from './utils/product';
import { Sidebar } from './Sidebar/Sidebar';
import styles from './App.module.css';

// ============================================================================
// Types
// ============================================================================

interface AppProps {
  cesdk: CreativeEditorSDK | null;
  children: ReactNode;
}

// ============================================================================
// App Component
// ============================================================================

export default function App({ cesdk, children }: AppProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [areaId, setAreaId] = useState('front');
  const [color, setColor] = useState<ProductColor>(
    PRODUCT_SAMPLES[0].colors.find((color) => color.isDefault) ||
      PRODUCT_SAMPLES[0].colors[0]
  );

  // Initialize product scene when cesdk becomes available
  useEffect(() => {
    if (!cesdk || isInitialized) return;

    const initializeProduct = async () => {
      // Initialize editor (plugins, UI, actions)
      await initTShirtDesigner(cesdk);

      // Set up default product scene (t-shirt)
      const product = PRODUCT_SAMPLES[0];
      const defaultColor =
        product.colors.find((color) => color.isDefault) || product.colors[0];

      await setupProductScene(cesdk, product, defaultColor);

      // Switch to first area
      await switchArea(cesdk, product.areas[0].id);

      // Update React state
      setAreaId(product.areas[0].id);
      setColor(defaultColor);
      setIsInitialized(true);
    };

    initializeProduct();
  }, [cesdk, isInitialized]);

  // ============================================================================
  // Callbacks
  // ============================================================================

  const handleAreaChange = async (newAreaId: string) => {
    if (!cesdk) return;
    setAreaId(newAreaId);
    await switchArea(cesdk, newAreaId);
  };

  const handleColorChange = async (newColor: ProductColor) => {
    if (!cesdk) return;

    const product = PRODUCT_SAMPLES[0];

    setColor(newColor);

    // Update backdrops with new color
    updateProductColor(cesdk, product, newColor);

    // Refresh view
    await switchArea(cesdk, areaId);
  };

  const handleExportRequest = async () => {
    if (!cesdk) return;
    // Use the downloadDesignData action which handles
    // exporting and downloading all product areas as PDFs and thumbnails
    await cesdk.actions.run('downloadDesignData');
  };

  const handleAddToCart = (data: {
    totalQuantity: number;
    totalPrice: number;
    quantities: Map<string, number>;
  }) => {
    const product = PRODUCT_SAMPLES[0];
    // Demo: Log cart data to console
    // In production, integrate with your e-commerce system
    // eslint-disable-next-line no-console
    console.log('Add to cart:', {
      product: product.label,
      color: color.id,
      quantities: Object.fromEntries(data.quantities),
      totalQuantity: data.totalQuantity,
      totalPrice: `$${data.totalPrice.toFixed(2)}`
    });

    // Show a simple alert for demo purposes
    alert(
      `Added ${data.totalQuantity} ${product.label}(s) to cart!\n` +
        `Color: ${color.id}\n` +
        `Total: $${data.totalPrice.toFixed(2)}`
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={styles.app}>
      {children}
      <Sidebar
        areaId={areaId}
        color={color}
        onAreaChange={handleAreaChange}
        onColorChange={handleColorChange}
        onExportRequest={handleExportRequest}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
