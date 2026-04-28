// src/features/configurator/components/ConfiguratorLayout.tsx
'use client';
import { useEffect } from 'react';
import { ProductConfig } from '@/core/types/product.types';
import { useConfigStore } from '../store/useConfigStore';
import { LayeredViewer } from './LayeredViewer';
import { shirtIcons, trouserIcons } from '@/core/utils/fonts';

export const ConfiguratorLayout = ({ initialConfig }: { initialConfig: ProductConfig }) => {
    const { initProduct, config, activeTab, setActiveTab, selections, setSelection } = useConfigStore();

    const isTrouser = initialConfig.productId.includes('trouser');
    const productFont = isTrouser ? trouserIcons : shirtIcons;

    useEffect(() => {
        initProduct(initialConfig);
    }, [initialConfig, initProduct]);

    if (!config) return null;

    // RULES ENGINE: Filter hidden steps
    const allVisible = config.attributes.filter(attr => {
        if (!attr.dependsOn) return true;
        const dependentValue = selections[attr.dependsOn.attributeId];
        if (!dependentValue) return false;
        return Array.isArray(attr.dependsOn.value)
            ? attr.dependsOn.value.includes(dependentValue)
            : attr.dependsOn.value === dependentValue;
    });

    // Navigation Tabs: Filter out attributes that are shown inline
    const INLINE_IDS = ['button_holes', 'button_threads', 'button_holes_all', 'button_holes_cuffs', 'button_threads_all', 'button_threads_cuffs'];
    const visibleAttributes = allVisible.filter(attr => !INLINE_IDS.includes(attr.id));

    const currentTabIndex = visibleAttributes.findIndex(attr => attr.id === activeTab);
    const safeTabIndex = currentTabIndex !== -1 ? currentTabIndex : 0;
    const activeAttributeData = visibleAttributes[safeTabIndex];

    // Identify dependent attributes to show inline on this page
    const inlineAttributes = allVisible.filter(attr =>
        attr.dependsOn?.attributeId === activeAttributeData?.id &&
        INLINE_IDS.includes(attr.id)
    );

    const handleNext = () => {
        if (safeTabIndex < visibleAttributes.length - 1) setActiveTab(visibleAttributes[safeTabIndex + 1].id);
    };

    const handlePrev = () => {
        if (safeTabIndex > 0) setActiveTab(visibleAttributes[safeTabIndex - 1].id);
    };

    const handleOptionClick = (attributeId: string, optionId: string) => {
        setSelection(attributeId, optionId);

        // SMART UX: Generic auto-advance
        const futureSelections = { ...selections, [attributeId]: optionId };
        const futureVisible = config.attributes.filter(attr => {
            if (!attr.dependsOn) return true;
            const depVal = futureSelections[attr.dependsOn.attributeId];
            if (!depVal) return false;
            return Array.isArray(attr.dependsOn.value)
                ? attr.dependsOn.value.includes(depVal)
                : attr.dependsOn.value === depVal;
        });

        const currentIndex = futureVisible.findIndex(attr => attr.id === attributeId);
        if (currentIndex !== -1 && currentIndex < futureVisible.length - 1) {
            const nextAttr = futureVisible[currentIndex + 1];
            // Don't auto-advance to inline attributes!
            if (INLINE_IDS.includes(nextAttr.id)) return;

            const dep = nextAttr?.dependsOn;
            if (dep && dep.attributeId === attributeId) {
                const matches = Array.isArray(dep.value)
                    ? dep.value.includes(optionId)
                    : dep.value === optionId;
                if (matches) {
                    setActiveTab(nextAttr.id);
                }
            }
        }
    };

    const totalPrice = config.basePrice + allVisible.reduce((total, attr) => {
        const selectedOpt = attr.options.find(opt => opt.id === selections[attr.id]);
        return total + (selectedOpt?.priceModifier || 0);
    }, 0);

    // --- REUSABLE GRID RENDERER ---
    const renderAttributeSection = (attr: any, isInline = false) => {
        const attrId = attr.id;
        let mode = attr.displayType || 'card';

        if (['fabric', 'lining_fabric', 'button_holes', 'button_threads', 'button_holes_all', 'button_holes_cuffs', 'button_threads_all', 'button_threads_cuffs'].includes(attrId)) mode = 'swatch';
        if (['buttons', 'pocket_squares', 'lapel_style', 'lapel_width', 'pocket_style', 'contrasted_button_hole_stitch'].includes(attrId)) mode = 'icon';
        if (['style', 'lining_style'].includes(attrId)) mode = 'card';

        let gridClass = 'grid-cols-3 gap-4 auto-rows-max';
        if (['button_holes', 'button_threads', 'button_holes_all', 'button_holes_cuffs', 'button_threads_all', 'button_threads_cuffs'].includes(attrId)) gridClass = 'grid-cols-5 gap-2 auto-rows-max';
        else if (mode === 'card') gridClass = 'grid-cols-2 gap-6 auto-rows-max';
        else if (mode === 'icon') gridClass = 'grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max';

        let boxClass = '';
        if (mode === 'swatch') boxClass = 'aspect-[4/3] p-0 w-full';
        else if (mode === 'icon') boxClass = 'aspect-square p-2 w-full max-w-[110px] mx-auto';
        else boxClass = 'h-[170px] p-4 w-full max-w-[220px] mx-auto';

        let imgClass = '';
        if (mode === 'swatch') imgClass = 'w-full h-full object-cover scale-105 group-hover:scale-100';
        else if (mode === 'icon') imgClass = 'w-[65%] h-[65%] object-contain mix-blend-multiply opacity-80 group-hover:opacity-100';
        else imgClass = 'w-[85%] h-[85%] object-contain mix-blend-multiply opacity-80 group-hover:opacity-100';

        return (
            <div key={attrId} className={isInline ? "mt-12" : ""}>
                {isInline && (
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">
                        {attr.label}
                    </h3>
                )}
                <div className={`grid ${gridClass}`}>
                    {attr.options.map((option: any) => {
                        const isSelected = selections[attrId] === option.id;
                        const thumb = option.thumbnail;
                        const isIcon = option.thumbnailType === 'icon' || (!thumb?.includes('/') && /^[0-9a-fA-F]{3,5}$/.test(thumb || ''));
                        const isColorSwatch = !!option.swatchColor;

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleOptionClick(attrId, option.id)}
                                className={`group relative flex flex-col items-center justify-center overflow-hidden transition-all duration-200 bg-white border rounded-md
                                    ${boxClass}
                                    ${isSelected ? 'border-slate-800 shadow-md ring-1 ring-slate-800' : 'border-gray-200 hover:border-gray-400'}`}
                            >
                                {mode !== 'swatch' && (
                                    <div className="absolute top-2 right-2 z-10 text-gray-300 group-hover:text-gray-500 transition-colors drop-shadow-md">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                )}
                                {isSelected && (
                                    <div className="absolute top-2 left-2 z-10 bg-[#0066FF] text-white rounded-full p-0.5 shadow-sm">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                                {isColorSwatch ? (
                                    <div
                                        className="absolute inset-0 w-full h-full"
                                        style={{
                                            backgroundColor: option.swatchColor,
                                            backgroundImage: `url(${thumb})`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                ) : !thumb ? (
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-700 px-2">{option.label}</span>
                                ) : isIcon ? (
                                    <span
                                        style={{ fontSize: '40px', lineHeight: 1 }}
                                        className={`transition-all duration-300 select-none ${productFont.className}`}
                                        aria-hidden="true"
                                    >
                                        {String.fromCodePoint(parseInt(thumb, 16))}
                                    </span>
                                ) : (
                                    <img src={thumb} alt={option.label} className={`transition-all duration-300 ${imgClass}`} />
                                )}
                                <div className={`absolute bottom-0 left-0 w-full bg-[#1e1e1e]/95 backdrop-blur-sm text-white py-2 transition-transform duration-300 flex items-center justify-center flex-col z-20
                                    ${isSelected ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                                    <span className="text-[9px] leading-tight text-center px-1 tracking-wider uppercase font-medium w-full truncate">
                                        {option.label}
                                    </span>
                                    {(option.priceModifier ?? 0) > 0 && <span className="text-[8px] text-gray-400 mt-0.5">(+${option.priceModifier})</span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

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
                            <h1 className="text-3xl font-serif text-slate-900 mb-1">Tailor Made Shirt for Men</h1>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Customize Your Shirt</p>
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
                    {activeAttributeData && renderAttributeSection(activeAttributeData)}
                    {inlineAttributes.map(attr => renderAttributeSection(attr, true))}
                </div>

                {/* 3. FOOTER (Fixed at bottom) */}
                <div className="px-8 py-6 flex-shrink-0 bg-white flex flex-col items-center z-10 border-t border-gray-100">
                    <p className="text-[11px] text-center text-gray-400 mb-6 max-w-sm leading-relaxed">
                        Choose from hundreds of premium options. Can't find exactly what you need? Let us know — we'll take care of it.
                    </p>
                    <div className="flex items-center gap-6 w-full justify-center mb-6">
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