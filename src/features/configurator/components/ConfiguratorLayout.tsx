// src/features/configurator/components/ConfiguratorLayout.tsx
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { ProductConfig } from '@/core/types/product.types';
import { useConfigStore } from '../store/useConfigStore';
import { LayeredViewer } from './LayeredViewer';
import { menBlazerIcons, shirtIcons, trouserIcons, womenBlazerIcons, womenShirtIcons, womenTrouserIcons } from '@/core/utils/fonts';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { calculatePrice } from '@/core/shopify/calculatePrice';

export const ConfiguratorLayout = ({ initialConfig }: { initialConfig: ProductConfig }) => {
    const { initProduct, config, activeTab, setActiveTab, selections, setSelection } = useConfigStore();
    const { addItem } = useCartStore();

    const isTrouser = initialConfig.productId.includes('trouser');
    const isWomensBlazer = initialConfig.productId.includes('womens-blazer');
    const isWomensShirt = initialConfig.productId.includes('womens-shirt');
    const isMenBlazer = initialConfig.productId.includes('men-blazer');
    const isWomenTrouser = initialConfig.productId.includes('women-trouser');
    const productFont = isWomensBlazer ? womenBlazerIcons : isWomenTrouser ? womenTrouserIcons : isTrouser ? trouserIcons : isWomensShirt ? womenShirtIcons : isMenBlazer ? menBlazerIcons : shirtIcons;

    const getProductLabelDetails = (productId: string) => {
        const idLower = productId.toLowerCase();

        let gender = "Men";
        if (idLower.includes('women') || idLower.includes('womens') || idLower.includes('female')) {
            gender = "Women";
        }

        let productType = "Suit";
        if (idLower.includes('shirt')) {
            productType = "Shirt";
        } else if (idLower.includes('blazer')) {
            productType = "Blazer";
        } else if (idLower.includes('trouser') || idLower.includes('pant')) {
            productType = "Trouser";
        } else if (idLower.includes('suit')) {
            productType = "Suit";
        }

        return { gender, productType };
    };

    const { gender, productType } = getProductLabelDetails(initialConfig.productId);

    useEffect(() => {
        initProduct(initialConfig);
    }, [initialConfig, initProduct]);

    if (!config) return null;

    // RULES ENGINE: Filter hidden steps
    const allVisible = config.attributes.filter(attr => {
        if (attr.conditions && attr.conditions.length > 0) {
            // Check flat conditions against radio button selections by matching option labels
            return attr.conditions.some((cond: any) => {
                return cond.rules.every((rule: any) => {
                    const selectedOptionId = selections['measurements'];
                    if (!selectedOptionId) return false;
                    
                    const parentAttr = config.attributes.find(a => a.id === 'measurements');
                    const selectedOption = parentAttr?.options.find(o => o.id === selectedOptionId);
                    if (!selectedOption) return false;
                    
                    const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                    return normalize(selectedOption.label) === normalize(rule.value);
                });
            });
        }
        if (!attr.dependsOn) return true;
        const dependentValue = selections[attr.dependsOn.attributeId];
        if (!dependentValue) return false;
        return Array.isArray(attr.dependsOn.value)
            ? attr.dependsOn.value.includes(dependentValue)
            : attr.dependsOn.value === dependentValue;
    });

    // Navigation Tabs: Filter out attributes that are shown inline
    const INLINE_IDS = ['button_holes', 'button_threads', 'button_holes_all', 'button_holes_cuffs', 'button_threads_all', 'button_threads_cuffs'];
    const isMeasurementSubAttr = (attr: any) => 
        (attr.category === 'measurements' && attr.dependsOn?.attributeId === 'measurements') || 
        (attr.conditions && attr.conditions.length > 0);
    
    const visibleAttributes = allVisible.filter(attr => !INLINE_IDS.includes(attr.id) && !isMeasurementSubAttr(attr));

    const currentTabIndex = visibleAttributes.findIndex(attr => attr.id === activeTab);
    const safeTabIndex = currentTabIndex !== -1 ? currentTabIndex : 0;
    const activeAttributeData = visibleAttributes[safeTabIndex];

    // Identify dependent attributes to show inline on this page
    const inlineAttributes = allVisible.filter(attr =>
        (attr.dependsOn?.attributeId === activeAttributeData?.id && INLINE_IDS.includes(attr.id)) ||
        (activeAttributeData?.id === 'measurements' && isMeasurementSubAttr(attr))
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
        // Skip auto-advance if the attribute opts out with noAutoAdvance: true
        const currentAttrDef = config.attributes.find(a => a.id === attributeId);
        if (currentAttrDef?.noAutoAdvance) return;
        // Do not auto-advance when clicking sub-options within an inline measurement section
        if (currentAttrDef && isMeasurementSubAttr(currentAttrDef)) return;

        const futureSelections = { ...selections, [attributeId]: optionId };
        const futureVisible = config.attributes.filter(attr => {
            if (attr.conditions && attr.conditions.length > 0) {
                return attr.conditions.some((cond: any) => {
                    return cond.rules.every((rule: any) => {
                        const selectedOptionId = futureSelections['measurements'];
                        if (!selectedOptionId) return false;
                        
                        const parentAttr = config.attributes.find(a => a.id === 'measurements');
                        const selectedOption = parentAttr?.options.find(o => o.id === selectedOptionId);
                        if (!selectedOption) return false;
                        
                        const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        return normalize(selectedOption.label) === normalize(rule.value);
                    });
                });
            }
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
            if (INLINE_IDS.includes(nextAttr.id) || isMeasurementSubAttr(nextAttr)) return;

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

    const handleAddToCart = () => {
        const breakdown = calculatePrice(config, selections);
        const friendlyName = config.productId === 'womens-blazers'
            ? "Women's Custom Blazer"
            : config.productId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        addItem({
            productId: config.productId,
            productName: friendlyName,
            selections,
            priceBreakdown: breakdown
        });
    };

    // --- REUSABLE GRID RENDERER ---
    const renderAttributeSection = (attr: any, isInline = false) => {
        const attrId = attr.id;
        // If the JSON explicitly sets displayType, always honour it.
        // Only fall back to id-based hardcoded modes when displayType is absent.
        let mode = attr.displayType || (() => {
            if (['fabric', 'lining_fabric', 'button_holes', 'button_threads', 'button_holes_all', 'button_holes_cuffs', 'button_threads_all', 'button_threads_cuffs'].includes(attrId)) return 'swatch';
            if (['buttons', 'pocket_squares', 'lapel_style', 'lapel_width', 'pocket_style', 'contrasted_button_hole_stitch'].includes(attrId)) return 'icon';
            if (['style', 'lining_style'].includes(attrId)) return 'card';
            return 'card';
        })();

        let gridClass = 'grid-cols-3 gap-4 auto-rows-max';
        if (mode === 'dropdown') {
            return (
                <div key={attrId} className={`w-full ${isInline ? "mt-6" : "mt-6"}`}>
                    <label htmlFor={attrId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                        {attr.label} {attr.required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative w-full">
                        <select
                            id={attrId}
                            value={selections[attrId] || ''}
                            onChange={(e) => setSelection(attrId, e.target.value)}
                            className="w-full px-4 py-3 text-slate-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] transition-all text-sm font-medium appearance-none shadow-sm cursor-pointer"
                        >
                            <option value="" disabled>— Select —</option>
                            {attr.options.map((opt: any) => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.label} {(opt.priceModifier ?? 0) > 0 ? `(+$${opt.priceModifier})` : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            );
        }

        if (mode === 'text') {
            return (
                <div key={attrId} className={`flex flex-col items-center justify-center w-full ${isInline ? "mt-12" : "mt-6"}`}>
                    {isInline && (
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 text-center">
                            {attr.label}
                        </h3>
                    )}
                    <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <label htmlFor={attrId} className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                            {attr.label}
                        </label>
                        <div className="relative">
                            <input
                                id={attrId}
                                type="text"
                                value={selections[attrId] || ''}
                                placeholder={attr.placeholder || "Enter text..."}
                                maxLength={15}
                                onChange={(e) => setSelection(attrId, e.target.value)}
                                className="w-full px-4 py-3 text-slate-800 bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 focus:border-[#0066FF] transition-all text-sm font-medium placeholder-gray-400"
                            />
                            {selections[attrId] && (
                                <button
                                    onClick={() => setSelection(attrId, '')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <p className="text-[10px] text-gray-400 italic">
                                Only English letters and numbers are supported.
                            </p>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                {(selections[attrId] || '').length}/15
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

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
        <div className="flex flex-col w-full h-full bg-white font-sans text-slate-800 overflow-hidden">

            {/* TOP WORKSPACE: Split Model and Controls */}
            <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">

                {/* LEFT SIDE: Image Viewer */}
                <div className="lg:w-[60%] w-full h-[50vh] lg:h-full relative bg-[#f4f4f4] border-r border-gray-200">
                    <LayeredViewer />
                </div>

                {/* RIGHT SIDE: Tailor UI */}
                <div className="lg:w-[40%] w-full h-[50vh] lg:h-full flex flex-col bg-[#fafafa]">

                    {/* 1. HEADER (Fixed at top) */}
                    <div className="px-4 pt-4 pb-4 flex-shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-serif text-slate-900 mb-1">Tailor Made {productType} for {gender}</h1>
                                <p className="text-xs text-gray-400 uppercase tracking-widest">Customize Your {productType}</p>
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
                        
                        {activeAttributeData?.id === 'measurements' ? (() => {
                            const jacketDropdowns = inlineAttributes.filter(a => ['jacket_size', 'fit', 'would_you_change_the_length_of_the_sleeve', 'would_you_change_the_length_of_the_jacket', 'jacket_s_fit', 'neck', 'chest', 'jacket_waist', 'seat', 'jacket_length', 'shoulder_width', 'sleeve_length', 'bicep', 'wrist'].includes(a.id));
                            const trouserDropdowns = inlineAttributes.filter(a => ['trousers_size', 'trousers_fit', 'trousers_waist', 'trouser_length', 'thigh', 'knee', 'u_crotch', 'bottom'].includes(a.id));
                            const waistcoatDropdowns = inlineAttributes.filter(a => ['waistcoat_length'].includes(a.id));
                            const bodyProfileSwatches = inlineAttributes.filter(a => !['jacket_size', 'fit', 'would_you_change_the_length_of_the_sleeve', 'would_you_change_the_length_of_the_jacket', 'jacket_s_fit', 'neck', 'chest', 'jacket_waist', 'seat', 'jacket_length', 'shoulder_width', 'sleeve_length', 'bicep', 'wrist', 'trousers_size', 'trousers_fit', 'trousers_waist', 'trouser_length', 'thigh', 'knee', 'u_crotch', 'bottom', 'waistcoat_length'].includes(a.id));

                            return (
                                <div className="mt-8 space-y-12">
                                    {jacketDropdowns.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                                <span className="text-xl">👔</span>
                                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Jacket Measurements</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {jacketDropdowns.map(attr => renderAttributeSection(attr, true))}
                                            </div>
                                        </div>
                                    )}

                                    {trouserDropdowns.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                                <span className="text-xl">👖</span>
                                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Trouser Measurements</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {trouserDropdowns.map(attr => renderAttributeSection(attr, true))}
                                            </div>
                                        </div>
                                    )}

                                    {waistcoatDropdowns.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                                <span className="text-xl">🦺</span>
                                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Waistcoat Measurements</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {waistcoatDropdowns.map(attr => renderAttributeSection(attr, true))}
                                            </div>
                                        </div>
                                    )}

                                    {bodyProfileSwatches.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                                <span className="text-xl">👤</span>
                                                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Body Profile & Preferences</h4>
                                            </div>
                                            <div className="space-y-8">
                                                {bodyProfileSwatches.map(attr => renderAttributeSection(attr, true))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })() : (
                            inlineAttributes.map(attr => renderAttributeSection(attr, true))
                        )}
                    </div>

                    {/* 3. FOOTER (Fixed at bottom of controls) */}
                    <div className="px-8 py-6 flex-shrink-0 bg-white flex flex-col items-center z-10 border-t border-gray-100">
                        <p className="text-[11px] text-center text-gray-400 mb-6 max-w-sm leading-relaxed">
                            Choose from hundreds of premium options. Can't find exactly what you need? Let us know — we'll take care of it.
                        </p>
                        <div className="flex items-center gap-6 w-full justify-center">
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
                                <button
                                    onClick={handleAddToCart}
                                    className="relative group px-10 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-300 bg-slate-900 text-white hover:bg-black shadow-lg hover:shadow-xl"
                                >
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* BOTTOM FULL-WIDTH BAR: Centered Back to Shop */}
            <div className="back-to-shop-bar w-full h-18 bg-white border-t border-gray-100 flex-shrink-0 flex items-center justify-center py-4 z-20">
                <Link
                    href="/"
                    className="relative group px-12 py-3.5 bg-[#0070d8] text-white rounded text-xs font-semibold tracking-widest uppercase hover:bg-blue-700 transition-all shadow-sm hover:shadow-md text-center inline-block"
                >
                    <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/45 transition-all group-hover:w-3 group-hover:h-3"></span>
                    <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/45 transition-all group-hover:w-3 group-hover:h-3"></span>
                    <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/45 transition-all group-hover:w-3 group-hover:h-3"></span>
                    <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/45 transition-all group-hover:w-3 group-hover:h-3"></span>
                    Back to Shop
                </Link>
            </div>

        </div>
    );
};