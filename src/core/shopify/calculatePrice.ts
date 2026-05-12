// src/core/shopify/calculatePrice.ts
import { ProductConfig } from '../types/product.types';

export interface PriceBreakdown {
    basePrice: number;
    addOns: { label: string; amount: number; attributeId: string; optionId: string }[];
    totalPrice: number;
}

/**
 * Calculates the exact dynamic price of a configured product based on active choices.
 * This runs client-side for live UI prices and server-side for secure validation.
 * 
 * @param config - The main ProductConfig containing basePrice and attribute definitions.
 * @param selections - Key-value pair of selected attribute IDs and option IDs.
 * @returns An object containing the base price, array of price adjustments, and the total price.
 */
export function calculatePrice(config: ProductConfig, selections: Record<string, string>): PriceBreakdown {
    const basePrice = config.basePrice || 0;
    const addOns: PriceBreakdown['addOns'] = [];

    // Go through each attribute defined in the configuration
    for (const attribute of config.attributes) {
        const selectedOptionId = selections[attribute.id];
        if (!selectedOptionId) continue;

        // Find the option metadata
        const option = attribute.options.find(opt => opt.id === selectedOptionId);
        if (!option) continue;

        const modifier = option.priceModifier || 0;
        if (modifier !== 0) {
            addOns.push({
                label: `${attribute.label}: ${option.label || option.id}`,
                amount: modifier,
                attributeId: attribute.id,
                optionId: option.id
            });
        }
    }

    // Accumulate total using precise decimal rounding to avoid standard JS floating point errors
    const addonsTotal = addOns.reduce((sum, item) => sum + item.amount, 0);
    const totalPrice = Number((basePrice + addonsTotal).toFixed(2));

    return {
        basePrice,
        addOns,
        totalPrice
    };
}
