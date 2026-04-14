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
    colorCode?: string; // For Fabric
    styleCode?: string; // <-- ADD THIS: For Jacket Style
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