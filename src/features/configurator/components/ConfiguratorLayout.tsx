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

    // RULES ENGINE: Filter hidden steps
    const visibleAttributes = config.attributes.filter(attr => {
        if (!attr.dependsOn) return true;
        const dependentValue = selections[attr.dependsOn.attributeId];
        if (!dependentValue) return false;
        return Array.isArray(attr.dependsOn.value)
            ? attr.dependsOn.value.includes(dependentValue)
            : attr.dependsOn.value === dependentValue;
    });

    const currentTabIndex = visibleAttributes.findIndex(attr => attr.id === activeTab);
    const safeTabIndex = currentTabIndex !== -1 ? currentTabIndex : 0;
    const activeAttributeData = visibleAttributes[safeTabIndex];

    const handleNext = () => {
        if (safeTabIndex < visibleAttributes.length - 1) setActiveTab(visibleAttributes[safeTabIndex + 1].id);
    };

    const handlePrev = () => {
        if (safeTabIndex > 0) setActiveTab(visibleAttributes[safeTabIndex - 1].id);
    };

    // --- NEW: SMART CLICK HANDLER ---
    const handleOptionClick = (attributeId: string, optionId: string) => {
        // 1. Set the selection in the state
        setSelection(attributeId, optionId);

        // 2. UX AUTO-ADVANCE: If they pick a custom lining, instantly jump to the lining fabric step!
        if (attributeId === 'lining_style') {
            if (optionId === 'lining_custom' || optionId === 'lining_unlined') {
                setActiveTab('lining_fabric');
            }
            // If they pick "lining_default", it does nothing and they remain on the current tab, just as you requested!
        }
    };

    const totalPrice = config.basePrice + visibleAttributes.reduce((total, attr) => {
        const selectedOpt = attr.options.find(opt => opt.id === selections[attr.id]);
        return total + (selectedOpt?.priceModifier || 0);
    }, 0);

    // Safety check: Treat 'fabric' and 'lining_fabric' as swatches automatically
    const isSwatch = activeAttributeData?.displayType === 'swatch' || activeAttributeData?.id === 'fabric' || activeAttributeData?.id === 'lining_fabric';

    return (
        <div className="flex flex-col lg:flex-row w-full h-screen bg-white font-sans text-slate-800 overflow-hidden">

            {/* LEFT SIDE: Image Viewer */}
            <div className="lg:w-[60%] w-full h-[50vh] lg:h-full relative bg-[#f4f4f4] border-r border-gray-200">
                <LayeredViewer />
            </div>

            {/* RIGHT SIDE: Tailor UI */}
            <div className="lg:w-[40%] w-full h-[50vh] lg:h-full flex flex-col bg-[#fafafa]">

                {/* 1. HEADER (Fixed at top) */}
                <div className="px-8 pt-10 pb-4 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-serif text-slate-900 mb-1">Tailor Made Suit for Men</h1>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Customize Your Suit</p>
                        </div>
                        <span className="text-xl font-medium text-[#0066FF]">${totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="text-center mt-8">
                        <h2 className="text-xl font-serif text-slate-800 tracking-wide">
                            {activeAttributeData?.label}
                        </h2>
                    </div>
                </div>

                {/* 2. SCROLLABLE GRID CONTENT */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-10">
                    <div className={`grid gap-4 ${isSwatch ? 'grid-cols-3' : 'grid-cols-3'}`}>

                        {activeAttributeData?.options.map(option => {
                            const isSelected = selections[activeAttributeData.id] === option.id;

                            return (
                                <button
                                    key={option.id}
                                    // UPDATED: Now points to our smart click handler instead of setSelection directly
                                    onClick={() => handleOptionClick(activeAttributeData.id, option.id)}
                                    className={`group relative flex flex-col items-center justify-center overflow-hidden transition-all duration-200 bg-white border rounded-md
                                        ${isSwatch ? 'aspect-[4/3] p-0' : 'aspect-square p-2'}
                                        ${isSelected ? 'border-slate-800 shadow-md ring-1 ring-slate-800' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    {/* Info Icon (Hidden if Swatch to keep fabric clean) */}
                                    {!isSwatch && (
                                        <div className="absolute top-2 right-2 z-10 text-gray-300 group-hover:text-gray-500 transition-colors drop-shadow-md">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* White Checkmark when Selected (Sits beautifully on top of dark fabrics) */}
                                    {isSelected && (
                                        <div className="absolute top-2 left-2 z-10 bg-white text-slate-900 rounded-full p-0.5 shadow-md">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Option Image */}
                                    {option.thumbnail ? (
                                        <img
                                            src={option.thumbnail}
                                            alt={option.label}
                                            className={`w-full h-full transition-all duration-300
                                                ${isSwatch ? 'object-cover scale-105 group-hover:scale-100' : 'object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 p-2'}
                                            `}
                                        />
                                    ) : (
                                        <span className="text-xs font-medium uppercase tracking-wider text-slate-700 px-2">{option.label}</span>
                                    )}

                                    {/* UNIVERSAL DARK HOVER LABEL OVERLAY */}
                                    <div className={`absolute bottom-0 left-0 w-full bg-[#1e1e1e]/95 backdrop-blur-sm text-white text-[10px] py-2.5 transition-transform duration-300 flex items-center justify-center flex-col z-20
                                        ${isSelected ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                                        <span className="tracking-wider uppercase font-medium">{option.label}</span>
                                        {option.priceModifier > 0 && <span className="text-[9px] text-gray-400 mt-0.5">(+${option.priceModifier})</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. FOOTER (Fixed at bottom) */}
                <div className="px-8 py-6 flex-shrink-0 bg-white flex flex-col items-center z-10 border-t border-gray-100">

                    <p className="text-[11px] text-center text-gray-400 mb-6 max-w-sm leading-relaxed">
                        Choose from hundreds of premium options. Can't find exactly what you need? Let us know — we'll take care of it.
                    </p>

                    <div className="flex items-center gap-6 w-full justify-center mb-6">

                        {/* PREVIOUS BUTTON (Bracket Style) */}
                        <button
                            onClick={handlePrev}
                            disabled={safeTabIndex === 0}
                            className={`relative group px-10 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-300
                                ${safeTabIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-[#0066FF] hover:bg-blue-50/50'}`}
                        >
                            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current transition-all group-hover:w-3 group-hover:h-3"></span>
                            <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current transition-all group-hover:w-3 group-hover:h-3"></span>
                            <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current transition-all group-hover:w-3 group-hover:h-3"></span>
                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current transition-all group-hover:w-3 group-hover:h-3"></span>
                            Previous
                        </button>

                        {/* NEXT / ADD TO CART BUTTON (Bracket Style) */}
                        {safeTabIndex < visibleAttributes.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="relative group px-14 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-300 bg-[#0066FF] text-white hover:bg-blue-700"
                            >
                                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                Next
                            </button>
                        ) : (
                            <button className="relative group px-10 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-300 bg-slate-900 text-white hover:bg-black shadow-lg hover:shadow-xl">
                                Add to Cart
                            </button>
                        )}
                    </div>

                    {/* BACK TO SHOP BUTTON (Bracket Style) */}
                    <button className="relative group px-6 py-2 mt-2 text-[#0066FF] text-[10px] font-semibold tracking-widest uppercase transition-colors">
                        <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#0066FF]/50 transition-all group-hover:w-2 group-hover:h-2"></span>
                        <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-[#0066FF]/50 transition-all group-hover:w-2 group-hover:h-2"></span>
                        <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-[#0066FF]/50 transition-all group-hover:w-2 group-hover:h-2"></span>
                        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#0066FF]/50 transition-all group-hover:w-2 group-hover:h-2"></span>
                        Back to Shop
                    </button>
                </div>

            </div>
        </div>
    );
};