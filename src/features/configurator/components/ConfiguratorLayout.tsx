// src/features/configurator/components/ConfiguratorLayout.tsx
'use client';
import { useEffect } from 'react';
import { ProductConfig } from '@/core/types/product.types';
import { useConfigStore } from '../store/useConfigStore';
import { LayeredViewer } from './LayeredViewer';

export const ConfiguratorLayout = ({ initialConfig }: { initialConfig: ProductConfig }) => {
    const { initProduct, config, activeTab, setActiveTab, selections, setSelection } = useConfigStore();

    // Initialize store when component mounts
    useEffect(() => {
        initProduct(initialConfig);
    }, [initialConfig, initProduct]);

    if (!config) return null;

    // Find the currently active attribute (e.g., Fabric or Collar)
    const activeAttributeData = config.attributes.find(attr => attr.id === activeTab);

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen bg-white">
            {/* LEFT SIDE: Image Viewer */}
            <div className="lg:w-2/3 w-full h-[50vh] lg:h-full relative overflow-y-auto">
                <LayeredViewer />
            </div>

            {/* RIGHT SIDE: Controls (Hockerty Style) */}
            <div className="lg:w-1/3 w-full h-[50vh] lg:h-full flex flex-col border-l border-gray-200">

                {/* Top Tabs */}
                <div className="flex overflow-x-auto border-b border-gray-200">
                    {config.attributes.map(attr => (
                        <button
                            key={attr.id}
                            onClick={() => setActiveTab(attr.id)}
                            className={`flex-1 py-4 px-4 text-sm font-medium uppercase tracking-wider whitespace-nowrap transition-colors
                ${activeTab === attr.id ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
                        >
                            {attr.label}
                        </button>
                    ))}
                </div>

                {/* Options Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-xl font-light mb-6">Choose your {activeAttributeData?.label}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {activeAttributeData?.options.map(option => {
                            const isSelected = selections[activeAttributeData.id] === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelection(activeAttributeData.id, option.id)}
                                    className={`border p-4 flex flex-col items-center justify-center rounded-md transition-all
                    ${isSelected ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    {/* You can add a thumbnail image here later */}
                                    <span className="text-sm mt-2">{option.label}</span>
                                    {option.priceModifier > 0 && (
                                        <span className="text-xs text-gray-500 mt-1">+${option.priceModifier.toFixed(2)}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Bar: Price & Add to Cart */}
                <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total Price</p>
                        {/* MVP: Just showing base price. We will add dynamic calculation later */}
                        <p className="text-2xl font-semibold">${config.basePrice.toFixed(2)}</p>
                    </div>
                    <button className="bg-black text-white px-8 py-3 rounded uppercase text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};