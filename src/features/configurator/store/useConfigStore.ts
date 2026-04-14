// src/features/configurator/store/useConfigStore.ts
import { create } from 'zustand';
import { ProductConfig } from '@/core/types/product.types';

interface ConfigState {
    config: ProductConfig | null;
    selections: Record<string, string>;
    activeTab: string; // Tracks whether user is looking at 'fabric', 'collar', etc.

    initProduct: (config: ProductConfig) => void;
    setSelection: (attributeId: string, optionId: string) => void;
    setActiveTab: (tabId: string) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
    config: null,
    selections: {},
    activeTab: '',

    initProduct: (config) => set({
        config,
        selections: config.defaultSelections,
        activeTab: config.attributes[0]?.id || ''
    }),

    setSelection: (attributeId, optionId) => set((state) => ({
        selections: { ...state.selections, [attributeId]: optionId }
    })),

    setActiveTab: (tabId) => set({ activeTab: tabId })
}));