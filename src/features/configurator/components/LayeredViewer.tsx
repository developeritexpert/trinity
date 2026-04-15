// src/features/configurator/components/LayeredViewer.tsx
'use client';
import { useState, useEffect } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { AssetLayer } from '@/core/types/product.types';

export const LayeredViewer = () => {
    const { config, selections } = useConfigStore();

    // State to hold the images that are actually visible on screen right now
    const [displayedAssets, setDisplayedAssets] = useState<AssetLayer[]>([]);

    // State to control the loading spinner overlay
    const [isLoading, setIsLoading] = useState(true);

    if (!config) return <div className="w-full h-full bg-[#f5f5f5] animate-pulse" />;

    // 1. EXTRACT DYNAMIC TOKENS
    let activeColorCode = 'navy';
    let activeStyleCode = 'single_breasted';
    let activeLapelCode = 'notch';
    let activeWidthCode = 'standard';

    config.attributes.forEach((attr) => {
        const selectedOpt = attr.options.find(opt => opt.id === selections[attr.id]);
        if (attr.id === 'fabric' && selectedOpt?.colorCode) activeColorCode = selectedOpt.colorCode;
        if (attr.id === 'style' && selectedOpt?.styleCode) activeStyleCode = selectedOpt.styleCode;
        if (attr.id === 'lapel_style' && selectedOpt?.lapelCode) activeLapelCode = selectedOpt.lapelCode;
        if (attr.id === 'lapel_width' && selectedOpt?.widthCode) activeWidthCode = selectedOpt.widthCode;
    });

    // 2. Gather active assets and REPLACE TOKENS first
    const targetAssets: AssetLayer[] = [];
    config.attributes.forEach((attr) => {
        const selectedOptionId = selections[attr.id];
        const option = attr.options.find(opt => opt.id === selectedOptionId);

        if (option && option.assets) {
            option.assets.forEach(asset => {
                const finalUrl = asset.url
                    .replace('{{color}}', activeColorCode)
                    .replace('{{style}}', activeStyleCode)
                    .replace('{{lapel}}', activeLapelCode)
                    .replace('{{width}}', activeWidthCode);

                targetAssets.push({ ...asset, url: finalUrl });
            });
        }
    });

    // Sort by zIndex
    targetAssets.sort((a, b) => a.zIndex - b.zIndex);

    // 3. THE PRELOADER ENGINE
    useEffect(() => {
        let isMounted = true;

        // Show the loader immediately when selections change
        setIsLoading(true);

        // Create a promise for every image that needs to be loaded
        const preloadPromises = targetAssets.map(asset => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = asset.url;
                img.onload = resolve; // Image loaded successfully
                img.onerror = resolve; // Resolve even on error so the app doesn't break
            });
        });

        // Wait for ALL images to finish downloading in the background
        Promise.all(preloadPromises).then(() => {
            if (isMounted) {
                // Once fully downloaded, update the visible images and hide the loader
                setDisplayedAssets(targetAssets);
                setIsLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
        // We stringify the URLs so it only triggers when the actual images change
    }, [JSON.stringify(targetAssets.map(a => a.url))]);

    return (
        <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden p-4 lg:p-8 relative">

            {/* --- LOADING OVERLAY --- */}
            <div
                className={`absolute inset-0 z-[999] flex items-center justify-center bg-[#f8f9fa]/50 backdrop-blur-[2px] transition-opacity duration-300 
                ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Note: Added animate-spin. If your loader.svg already spins by itself, you can remove 'animate-spin' */}
                <img src="/loading.svg" alt="Loading..." className="w-12 h-12 animate-spin opacity-80" />
            </div>

            {/* --- THE SUIT IMAGES --- */}
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