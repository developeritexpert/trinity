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
    assets?: AssetLayer[];
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
    /** Tuxedo button style code: e.g. 'tsb_1' | 'tsb_2' | 'tdb'. Empty for non-tuxedo styles. */
    tuxedoCode?: string;

    // for shirt
    collarCode?: string;
    collarCustomizedCode?: string;
    cuffCode?: string;
    contrastedCollarCode?: string;
    collarFabricCode?: string;
    contrastedCuffCode?: string;
    cuffFabricCode?: string;
    /** Hex color for thread/hole swatch display (e.g. '#384357') */
    swatchColor?: string;

    // for trousers
    lengthCode?: string;   // e.g. "length_long", "length_ankle", "length_bermuda"
    fitSuffix?: string;    // e.g. "slim", "wide", "regular" — used in fit asset filenames
}

export interface Attribute {
    id: string;
    label: string;
    displayType?: 'swatch' | 'card' | 'icon' | 'text' | 'dropdown' | 'radio';
    placeholder?: string;
    dependsOn?: {                 // <-- ADD THIS BLOCK
        attributeId: string;
        value: string | string[];
    };
    conditions?: any[];
    /** When true, selecting an option in this attribute will NOT auto-advance to the next step */
    noAutoAdvance?: boolean;
    options: Option[];
    /** Assets that apply to every option selection in this attribute (supports tokens) */
    commonAssets?: AssetLayer[];
}

export interface ProductConfig {
    productId: string;
    basePrice: number;
    attributes: Attribute[];
    defaultSelections: Record<string, string>;
    /** Assets rendered on every fabric selection — universal overlays/shadows */
    sharedLayers?: AssetLayer[];
}