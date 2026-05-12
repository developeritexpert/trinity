// src/core/shopify/variantMap.ts

/**
 * Resolves local frontend product IDs into Shopify Variant IDs.
 * Reads IDs from environment variables, falling back to local placeholders
 * to ensure compilation and testing work perfectly out-of-the-box.
 * 
 * @param productId - The local identifier (e.g., 'mens-shirt', 'womens-blazers')
 * @returns The Shopify Variant ID or null if unrecognized
 */
export function getShopifyVariantId(productId: string): string | null {
    if (!productId) return null;

    const normalizedId = productId.toLowerCase().trim();

    switch (normalizedId) {
        case 'men-shirt':
        case 'mens-shirt':
            return process.env.SHOPIFY_VARIANT_MENS_SHIRT || '10000000000001';

        case 'men-suit':
        case 'mens-suit':
            return process.env.SHOPIFY_VARIANT_MENS_SUIT || '10000000000002';

        case 'men-blazer':
        case 'mens-blazer':
            return process.env.SHOPIFY_VARIANT_MENS_BLAZER || '10000000000003';

        case 'men-trouser':
        case 'mens-trouser':
            return process.env.SHOPIFY_VARIANT_MENS_TROUSER || '10000000000004';

        case 'women-blazer':
        case 'womens-blazers':
        case 'womens-blazer':
            return process.env.SHOPIFY_VARIANT_WOMENS_BLAZER || '10000000000005';

        case 'women-shirt':
        case 'womens-shirt':
            return process.env.SHOPIFY_VARIANT_WOMENS_SHIRT || '10000000000006';

        case 'women-trouser':
        case 'womens-trouser':
        case 'women-trousers':
            return process.env.SHOPIFY_VARIANT_WOMENS_TROUSER || '10000000000007';

        default:
            console.warn(`[Shopify Variant Map] Unmapped local product ID: "${productId}"`);
            return null;
    }
}

export default getShopifyVariantId;
