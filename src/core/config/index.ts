// src/core/config/index.ts
import { ProductConfig } from '../types/product.types';
import menShirtConfig from './men-shirt.json';
import menSuitConfig from './men-suit.json';

const configRegistry: Record<string, any> = {
    'men-shirt': menShirtConfig,
    'men-suit': menSuitConfig,
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