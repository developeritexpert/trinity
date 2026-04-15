// src/features/configurator/components/ConfiguratorLayout.tsx
'use client';
import { useEffect } from 'react';
import { ProductConfig } from '@/core/types/product.types';
import { useConfigStore } from '../store/useConfigStore';
import { LayeredViewer } from './LayeredViewer';

export const ConfiguratorLayout = ({ initialConfig }: { initialConfig: ProductConfig }) => {
    const { initProduct, config, activeTab, setActiveTab, selections, setSelection } = useConfigStore();

    useEffect(() => {
        initProduct(initialConfig);
    }, [initialConfig, initProduct]);

    if (!config) return null;

    const currentTabIndex = config.attributes.findIndex(attr => attr.id === activeTab);
    const activeAttributeData = config.attributes[currentTabIndex];

    const handleNext = () => {
        if (currentTabIndex < config.attributes.length - 1) {
            setActiveTab(config.attributes[currentTabIndex + 1].id);
        }
    };

    const handlePrev = () => {
        if (currentTabIndex > 0) {
            setActiveTab(config.attributes[currentTabIndex - 1].id);
        }
    };

    const totalPrice = config.basePrice + config.attributes.reduce((total, attr) => {
        const selectedOpt = attr.options.find(opt => opt.id === selections[attr.id]);
        return total + (selectedOpt?.priceModifier || 0);
    }, 0);

    // Helper to determine how to display the grid
    const isFabricStep = activeAttributeData?.id === 'fabric';

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen bg-white font-sans text-slate-800">

            {/* LEFT SIDE: Image Viewer */}
            <div className="lg:w-[60%] w-full h-[50vh] lg:h-full relative bg-[#f8f9fa] border-r border-gray-200">
                <LayeredViewer />
            </div>

            {/* RIGHT SIDE: Tailor UI */}
            <div className="lg:w-[40%] w-full h-[50vh] lg:h-full flex flex-col px-8 py-10 overflow-y-auto">

                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-serif text-slate-900 mb-1">Tailor Made Suit for Men</h1>
                        <p className="text-sm text-gray-400">Customize Your Suit</p>
                    </div>
                    <span className="text-xl font-medium text-blue-600">${totalPrice}</span>
                </div>

                {/* Step Title */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-serif text-slate-800">
                        {isFabricStep ? 'Premium Fabric' : activeAttributeData?.label}
                    </h2>
                    <div className="w-12 h-[2px] bg-gray-300 mx-auto mt-4"></div>
                </div>

                {/* Dynamic Options Grid */}
                <div className="flex-1">
                    <div className={`grid gap-4 ${isFabricStep ? 'grid-cols-4' : 'grid-cols-2'}`}>

                        {activeAttributeData?.options.map(option => {
                            const isSelected = selections[activeAttributeData.id] === option.id;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelection(activeAttributeData.id, option.id)}
                                    // We set min-h-[160px] for sketches so they are tall and elegant. 
                                    // Swatches stay aspect-square.
                                    className={`relative flex flex-col items-center justify-center overflow-hidden transition-all duration-200 rounded-md border
                    ${isFabricStep ? 'aspect-square p-0' : 'min-h-[160px] max-h-[200px] p-4'}
                    ${isSelected
                                            ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                >
                                    {option.thumbnail ? (
                                        <>
                                            <img
                                                src={option.thumbnail}
                                                alt={option.label}
                                                // object-contain prevents the sketches from stretching!
                                                className={`w-full ${isFabricStep ? 'h-full object-cover' : 'h-24 object-contain mb-3'}`}
                                            />
                                            {/* Show text under the image if it's NOT a fabric */}
                                            {!isFabricStep && (
                                                <span className="text-xs font-semibold text-slate-700 text-center uppercase tracking-wide">
                                                    {option.label}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-sm font-semibold text-slate-700 text-center uppercase tracking-wide">
                                            {option.label}
                                        </span>
                                    )}

                                    {/* Active Checkmark overlay (Only for Fabric Swatches) */}
                                    {isFabricStep && isSelected && (
                                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                            <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Area: Previous / Next Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center">

                    <p className="text-xs text-center text-gray-500 mb-6 max-w-xs leading-relaxed">
                        Choose from hundreds of premium options. Can't find exactly what you need? Let us know.
                    </p>

                    <div className="flex items-center gap-4 w-full justify-center">

                        {/* Previous (Preview) Button */}
                        <button
                            onClick={handlePrev}
                            disabled={currentTabIndex === 0}
                            className={`px-8 py-3 text-sm tracking-widest uppercase transition-colors border
                ${currentTabIndex === 0
                                    ? 'text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
                                    : 'text-gray-600 border-gray-300 hover:border-gray-500 hover:text-black'}`}
                        >
                            Prev
                        </button>

                        {/* Next / Add to Cart Button */}
                        {currentTabIndex < config.attributes.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="bg-[#0066FF] text-white px-12 py-3 text-sm tracking-widest uppercase hover:bg-blue-700 transition-colors shadow-md"
                            >
                                Next
                            </button>
                        ) : (
                            <button className="bg-slate-900 text-white px-10 py-3 text-sm tracking-widest uppercase hover:bg-black transition-colors shadow-lg">
                                Add to Cart
                            </button>
                        )}
                    </div>

                    <button className="mt-8 text-[#0066FF] text-xs uppercase tracking-widest hover:underline transition-colors">
                        Back to Shop
                    </button>
                </div>

            </div>
        </div>
    );
};