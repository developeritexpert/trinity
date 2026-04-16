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
    thumbnail?: string;
    colorCode?: string;
    styleCode?: string;
    lapelCode?: string;
    widthCode?: string;
    liningStyleCode?: string; // <-- ADD THIS
    liningColorCode?: string; // <-- ADD THIS
}

export interface Attribute {
    id: string;
    label: string;
    displayType?: 'swatch' | 'card' | 'icon';
    dependsOn?: {                 // <-- ADD THIS BLOCK
        attributeId: string;
        value: string | string[];
    };
    options: Option[];
}

export interface ProductConfig {
    productId: string;
    basePrice: number;
    attributes: Attribute[];
    defaultSelections: Record<string, string>;
}