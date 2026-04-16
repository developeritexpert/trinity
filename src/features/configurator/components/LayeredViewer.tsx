'use client';
import { useState, useEffect } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { AssetLayer } from '@/core/types/product.types';

export const LayeredViewer = () => {
    const { config, selections } = useConfigStore();

    const [displayedAssets, setDisplayedAssets] = useState<AssetLayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    if (!config) return <div className="w-full h-full bg-[#f5f5f5] animate-pulse" />;

    // 1. RULES ENGINE: Filter out steps that are hidden so we don't draw "ghost" assets
    const visibleAttributes = config.attributes.filter(attr => {
        if (!attr.dependsOn) return true;
        const dependentValue = selections[attr.dependsOn.attributeId];
        if (!dependentValue) return false;
        return Array.isArray(attr.dependsOn.value)
            ? attr.dependsOn.value.includes(dependentValue)
            : attr.dependsOn.value === dependentValue;
    });

    // 2. EXTRACT DYNAMIC TOKENS
    let activeColorCode = 'navy';
    let activeStyleCode = 'single_breasted';
    let activeLapelCode = 'notch';
    let activeWidthCode = 'standard';
    let activeLiningStyleCode = ''; // Default to empty string for "custom"
    let activeLiningColorCode = '116_fabric';

    visibleAttributes.forEach((attr) => {
        const selectedOpt = attr.options.find(opt => opt.id === selections[attr.id]);
        if (attr.id === 'fabric' && selectedOpt?.colorCode) activeColorCode = selectedOpt.colorCode;
        if (attr.id === 'style' && selectedOpt?.styleCode) activeStyleCode = selectedOpt.styleCode;
        if (attr.id === 'lapel_style' && selectedOpt?.lapelCode) activeLapelCode = selectedOpt.lapelCode;
        if (attr.id === 'lapel_width' && selectedOpt?.widthCode) activeWidthCode = selectedOpt.widthCode;
        if (attr.id === 'lining_style' && selectedOpt?.liningStyleCode !== undefined) activeLiningStyleCode = selectedOpt.liningStyleCode;
        if (attr.id === 'lining_fabric' && selectedOpt?.liningColorCode) activeLiningColorCode = selectedOpt.liningColorCode;
    });

    // 3. Gather active assets and REPLACE ALL 6 TOKENS
    const targetAssets: AssetLayer[] = [];
    visibleAttributes.forEach((attr) => {
        const selectedOptionId = selections[attr.id];
        const option = attr.options.find(opt => opt.id === selectedOptionId);

        if (option && option.assets) {
            option.assets.forEach(asset => {
                const finalUrl = asset.url
                    .replace('{{color}}', activeColorCode)
                    .replace('{{style}}', activeStyleCode)
                    .replace('{{lapel}}', activeLapelCode)
                    .replace('{{width}}', activeWidthCode)
                    .replace('{{lining_style}}', activeLiningStyleCode)
                    .replace('{{lining_color}}', activeLiningColorCode);

                targetAssets.push({ ...asset, url: finalUrl });
            });
        }
    });

    // Sort by zIndex
    targetAssets.sort((a, b) => a.zIndex - b.zIndex);

    // 4. THE PRELOADER ENGINE
    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const preloadPromises = targetAssets.map(asset => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = asset.url;
                img.onload = resolve;
                img.onerror = resolve;
            });
        });

        Promise.all(preloadPromises).then(() => {
            if (isMounted) {
                setDisplayedAssets(targetAssets);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [JSON.stringify(targetAssets.map(a => a.url))]);

    return (
        <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden p-4 lg:p-8 relative">
            {/* LOADING OVERLAY */}
            <div
                className={`absolute inset-0 z-[999] flex items-center justify-center bg-[#f8f9fa]/50 backdrop-blur-[2px] transition-opacity duration-300 
                ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <img src="/loading.svg" alt="Loading..." className="w-12 h-12 animate-spin opacity-80" />
            </div>

            {/* SUIT IMAGES */}
            <div className="relative w-full max-w-[550px] aspect-[1/2] transition-all duration-500">
                {displayedAssets.map((asset, index) => {
                    const customClass = asset.className ? asset.className : "top-0 left-0 w-full h-full object-contain";
                    return (
                        <img
                            key={`${asset.url}-${index}`}
                            src={asset.url}
                            alt="Product Layer"
                            className={`absolute pointer-events-none drop-shadow-sm transition-opacity duration-300 ${customClass}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};