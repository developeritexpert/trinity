// src/core/config/index.ts
import { ProductConfig } from '../types/product.types';
import menShirtConfig from './men-shirt.json';
import menSuitConfig from './men-suit.json';
import menTrouserConfig from './men-trouser.json';
import womensBlazerConfig from './womens-blazers.json';
import womenShirtConfig from './women-shirt.json';
import womenTrouserConfig from './women-trouser.json';
import menBlazerConfig from './men-blazer.json';
import menBlazerApiConfig from './men-blazer-api.json';

const configRegistry: Record<string, any> = {
    'men-shirt': menShirtConfig,
    'men-suit': menSuitConfig,
    'men-blazer': menBlazerConfig,
    'men-blazer-api': menBlazerApiConfig,
    'men-trouser': menTrouserConfig,
    'women-blazer': womensBlazerConfig,
    'women-shirt': womenShirtConfig,
    'women-trouser': womenTrouserConfig,
};

// Added `?` to make them optional, and added an if-statement check
export const getProductConfig = (category?: string, product?: string): ProductConfig | null => {
    // SAFETY CHECK: If either is missing, return null immediately
    if (!category || !product) return null;

    const registryKey = `${category.toLowerCase()}-${product.toLowerCase()}`;

    const config = configRegistry[registryKey];

    if (!config) return null;

    return config as ProductConfig;
};