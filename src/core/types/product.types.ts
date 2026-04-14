// src/core/types/product.types.ts
export interface AssetLayer {
    url: string;
    zIndex: number;
    className?: string;
    style?: React.CSSProperties;
}

export interface Option {
    id: string;
    label: string;
    priceModifier: number;
    assets: AssetLayer[];
    colorCode?: string;  // For Fabric  → resolves {{color}} token
    styleCode?: string;  // For Style   → resolves {{style}} token
    lapelCode?: string;  // For Lapel   → "notch" | "peak" (for UI filtering, not URL)
}

export interface Attribute {
    id: string;
    label: string;
    options: Option[];
}

export interface ProductConfig {
    productId: string;
    basePrice: number;
    attributes: Attribute[];
    defaultSelections: Record<string, string>;
}