// src/features/configurator/components/LayeredViewer.tsx
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

    // Add these for shirts:
    let activeCollarCode = 'cutaway';
    let activeCuffCode = 'single_1_button';
    let activeContrastedCollarCode = ''; // cc_all or cc_inner_fabric
    let activeCollarFabricCode = '';     // e.g. 699, 2738, etc.
    let activeContrastedCuffCode = '';   // cuff_all or cuff_inner
    let activeCuffFabricCode = '';       // e.g. 699, 2738, etc.
    let activeFitCode = 'slim_fit';      // Default for trousers
    let activeHemlineCode = 'straight';   // Default hemline styleCode

    visibleAttributes.forEach((attr) => {
        const selectedOpt = attr.options.find(opt => opt.id === selections[attr.id]);
        if (attr.id === 'fabric' && selectedOpt?.colorCode) activeColorCode = selectedOpt.colorCode;
        if (attr.id === 'style' && selectedOpt?.styleCode) activeStyleCode = selectedOpt.styleCode;
        if (attr.id === 'lapel_style' && selectedOpt?.lapelCode) activeLapelCode = selectedOpt.lapelCode;
        if (attr.id === 'lapel_width' && selectedOpt?.widthCode) activeWidthCode = selectedOpt.widthCode;
        if (attr.id === 'lining_style' && selectedOpt?.liningStyleCode !== undefined) activeLiningStyleCode = selectedOpt.liningStyleCode;
        if (attr.id === 'lining_fabric' && selectedOpt?.liningColorCode) activeLiningColorCode = selectedOpt.liningColorCode;

        // Add these for shirts:
        if (attr.id === 'collar' && selectedOpt?.collarCode) activeCollarCode = selectedOpt.collarCode;
        if (attr.id === 'cuffs' && selectedOpt?.cuffCode) activeCuffCode = selectedOpt.cuffCode;
        if (attr.id === 'contrasted_collar' && selectedOpt?.contrastedCollarCode !== undefined) activeContrastedCollarCode = selectedOpt.contrastedCollarCode;
        if (attr.id === 'contrasted_collar_fabric' && selectedOpt?.collarFabricCode) activeCollarFabricCode = selectedOpt.collarFabricCode;
        if (attr.id === 'contrasted_cuff' && selectedOpt?.contrastedCuffCode !== undefined) activeContrastedCuffCode = selectedOpt.contrastedCuffCode;
        if (attr.id === 'cuff_fabric' && selectedOpt?.cuffFabricCode) activeCuffFabricCode = selectedOpt.cuffFabricCode;
        if (attr.id === 'fit' && selectedOpt?.colorCode) activeFitCode = selectedOpt.colorCode;
        if (attr.id === 'hemline' && selectedOpt?.styleCode) activeHemlineCode = selectedOpt.styleCode;
    });

    // Derived: map styleCode → short filename prefix used in hemline assets
    const STYLE_PREFIX_MAP: Record<string, string> = {
        sb_1_button:   'sb_1',
        sb_2_button:   'sb_2',
        sb_3_button:   'sb_3',
        without_lapel: 'wl_2',
        db_4_button:   'db_4',
    };
    const activeStylePrefix = STYLE_PREFIX_MAP[activeStyleCode] ?? activeStyleCode;

    // Derived token: only button_down and new_kent have holes/threads images
    const activeHoleCollarCode = activeCollarCode === 'button_down' ? 'button_down' : 'new_kent';

    // 3. Gather active assets and REPLACE ALL TOKENS
    const targetAssets: AssetLayer[] = [];

    // Always include sharedLayers first (universal overlays/shadows defined at config level)
    if (config.sharedLayers) {
        config.sharedLayers.forEach(asset => {
            const finalUrl = asset.url
                .replace('{{color}}', activeColorCode)
                .replace('{{style}}', activeStyleCode)
                .replace('{{style_prefix}}', activeStylePrefix)
                .replace('{{lapel}}', activeLapelCode)
                .replace('{{width}}', activeWidthCode)
                .replace('{{lining_style}}', activeLiningStyleCode)
                .replace('{{lining_color}}', activeLiningColorCode)
                .replace('{{collar}}', activeCollarCode)
                .replace('{{cuff}}', activeCuffCode)
                .replace('{{contrasted_collar}}', activeContrastedCollarCode)
                .replace('{{collar_fabric}}', activeCollarFabricCode)
                .replace('{{contrasted_cuff}}', activeContrastedCuffCode)
                .replace('{{cuff_fabric}}', activeCuffFabricCode)
                .replace('{{hole_collar}}', activeHoleCollarCode)
                .replace('{{fit}}', activeFitCode)
                .replace('{{hemline}}', activeHemlineCode);
            targetAssets.push({ ...asset, url: finalUrl });
        });
    }

    visibleAttributes.forEach((attr) => {
        const selectedOptionId = selections[attr.id];
        const option = attr.options.find(opt => opt.id === selectedOptionId);

        // helper to apply tokens
        const resolveUrl = (url: string) => url
            .replace('{{color}}', activeColorCode)
            .replace('{{style}}', activeStyleCode)
            .replace('{{style_prefix}}', activeStylePrefix)
            .replace('{{lapel}}', activeLapelCode)
            .replace('{{width}}', activeWidthCode)
            .replace('{{lining_style}}', activeLiningStyleCode)
            .replace('{{lining_color}}', activeLiningColorCode)
            .replace('{{collar}}', activeCollarCode)
            .replace('{{cuff}}', activeCuffCode)
            .replace('{{contrasted_collar}}', activeContrastedCollarCode)
            .replace('{{collar_fabric}}', activeCollarFabricCode)
            .replace('{{contrasted_cuff}}', activeContrastedCuffCode)
            .replace('{{cuff_fabric}}', activeCuffFabricCode)
            .replace('{{hole_collar}}', activeHoleCollarCode)
            .replace('{{fit}}', activeFitCode)
            .replace('{{hemline}}', activeHemlineCode);

        // 1. Process commonAssets (apply to all options)
        if (attr.commonAssets) {
            attr.commonAssets.forEach(asset => {
                targetAssets.push({ ...asset, url: resolveUrl(asset.url) });
            });
        }

        // 2. Process option-specific assets
        if (option && option.assets) {
            option.assets.forEach(asset => {
                targetAssets.push({ ...asset, url: resolveUrl(asset.url) });
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