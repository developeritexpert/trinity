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
    priceModifier?: number;
    assets: AssetLayer[];
    /** Path to an image file, OR a 4-char hex unicode code point for CustomIcons font (e.g. "0030") */
    thumbnail?: string;
    /** Explicit override. Auto-detected from thumbnail if omitted. */
    thumbnailType?: 'image' | 'icon';
    colorCode?: string;
    styleCode?: string;
    lapelCode?: string;
    widthCode?: string;
    liningStyleCode?: string;
    liningColorCode?: string;

    // for shirt
    collarCode?: string;
    cuffCode?: string;
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
    /** Assets rendered on every fabric selection — universal overlays/shadows */
    sharedLayers?: AssetLayer[];
}