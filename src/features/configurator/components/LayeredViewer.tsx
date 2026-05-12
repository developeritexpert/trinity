// src/features/configurator/components/LayeredViewer.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import { AssetLayer } from '@/core/types/product.types';

export const LayeredViewer = () => {
    const { config, selections } = useConfigStore();

    const [displayedAssets, setDisplayedAssets] = useState<AssetLayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Zoom and Pan State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

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
    let activeCollarCustomizedCode = 'classic_customized'; // default fallback
    let activeContrastedCollarCode = ''; // cc_all or cc_inner_fabric
    let activeCollarFabricCode = '';     // e.g. 699, 2738, etc.
    let activeContrastedCuffCode = '';   // cuff_all or cuff_inner
    let activeCuffFabricCode = '';       // e.g. 699, 2738, etc.
    let activeFitCode = 'slim_fit';      // Default for trousers — maps to fit folder name (styleCode)
    let activeCollarCodeToken = 'classic_collar'; // collarCode field from collar option
    let activeFasteningCode = 'standard';          // selected fastening option id
    let activeLengthCode = 'length_long';           // trouser length token
    let activeFitSuffix = 'slim';                   // trouser fit filename suffix

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
        if (attr.id === 'collar' && selectedOpt?.collarCode) activeCollarCodeToken = selectedOpt.collarCode;
        if (attr.id === 'collar' && selectedOpt?.collarCustomizedCode) activeCollarCustomizedCode = selectedOpt.collarCustomizedCode;
        if (attr.id === 'fastening') activeFasteningCode = selections['fastening'] ?? 'standard';
        if (attr.id === 'cuffs' && selectedOpt?.cuffCode) activeCuffCode = selectedOpt.cuffCode;
        if (attr.id === 'contrasted_collar' && selectedOpt?.contrastedCollarCode !== undefined) activeContrastedCollarCode = selectedOpt.contrastedCollarCode;
        if (attr.id === 'contrasted_collar_fabric' && selectedOpt?.collarFabricCode) activeCollarFabricCode = selectedOpt.collarFabricCode;
        if (attr.id === 'contrasted_cuff' && selectedOpt?.contrastedCuffCode !== undefined) activeContrastedCuffCode = selectedOpt.contrastedCuffCode;
        if (attr.id === 'cuff_fabric' && selectedOpt?.cuffFabricCode) activeCuffFabricCode = selectedOpt.cuffFabricCode;
        if (attr.id === 'fit' && selectedOpt?.styleCode) activeFitCode = selectedOpt.styleCode;
        if (attr.id === 'fit' && selectedOpt?.fitSuffix)  activeFitSuffix = selectedOpt.fitSuffix;
        if (attr.id === 'length' && selectedOpt?.lengthCode) activeLengthCode = selectedOpt.lengthCode;
    });

    // Derived: map styleCode → short filename prefix used in hemline assets
    const STYLE_PREFIX_MAP: Record<string, string> = {
        sb_1_button: 'sb_1',
        sb_2_button: 'sb_2',
        sb_3_button: 'sb_3',
        without_lapel: 'wl_2',
        db_4_button: 'db_4',
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
                .replace('{{collarCode}}', activeCollarCodeToken)
                .replace('{{collar_customized}}', activeCollarCustomizedCode)
                .replace('{{cuff}}', activeCuffCode)
                .replace('{{contrasted_collar}}', activeContrastedCollarCode)
                .replace('{{collar_fabric}}', activeCollarFabricCode)
                .replace('{{contrasted_cuff}}', activeContrastedCuffCode)
                .replace('{{cuff_fabric}}', activeCuffFabricCode)
                .replace('{{hole_collar}}', activeHoleCollarCode)
                .replace('{{fit}}', activeFitCode)
                .replace('{{fitSuffix}}', activeFitSuffix)
                .replace('{{lengthCode}}', activeLengthCode)
                .replace('{{fastening}}', activeFasteningCode);
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
            .replace('{{collarCode}}', activeCollarCodeToken)
            .replace('{{collar_customized}}', activeCollarCustomizedCode)
            .replace('{{cuff}}', activeCuffCode)
            .replace('{{contrasted_collar}}', activeContrastedCollarCode)
            .replace('{{collar_fabric}}', activeCollarFabricCode)
            .replace('{{contrasted_cuff}}', activeContrastedCuffCode)
            .replace('{{cuff_fabric}}', activeCuffFabricCode)
            .replace('{{hole_collar}}', activeHoleCollarCode)
            .replace('{{fit}}', activeFitCode)
            .replace('{{fitSuffix}}', activeFitSuffix)
            .replace('{{lengthCode}}', activeLengthCode)
            .replace('{{fastening}}', activeFasteningCode);

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

    // Read Computed CSS legacy Zoom dynamically from active element styles at runtime
    const getComputedZoom = () => {
        if (typeof window === 'undefined') return 1;
        const el = document.querySelector('.layers.viewport');
        if (!el) return 1;
        const zoomVal = window.getComputedStyle(el).zoom;
        return zoomVal ? parseFloat(zoomVal) || 1 : 1;
    };

    // Boundary Clamp Engine (Keeps model perfectly contained on screen proportional to current zoom scale)
    const clampPosition = (x: number, y: number, currentScale: number) => {
        const zoomFactor = getComputedZoom();
        // Adjust bounds dynamically depending on scale and legacy CSS zoom factors
        const baseLimitX = 140 / zoomFactor;
        const baseLimitY = 245 / zoomFactor;

        const limitX = currentScale <= 1 ? baseLimitX : (currentScale - 1) * (180 / zoomFactor) + baseLimitX; 
        const limitY = currentScale <= 1 ? baseLimitY : (currentScale - 1) * (280 / zoomFactor) + baseLimitY; 

        return {
            x: Math.max(-limitX, Math.min(limitX, x)),
            y: Math.max(-limitY, Math.min(limitY, y))
        };
    };

    // Zoom Handlers
    const handleZoomIn = () => {
        setScale(prev => {
            const next = Math.min(prev + 0.4, 3);
            setPosition(current => clampPosition(current.x, current.y, next));
            return next;
        });
    };

    const handleZoomOut = () => {
        setScale(prev => {
            const next = Math.max(prev - 0.4, 1);
            if (next === 1) {
                setPosition({ x: 0, y: 0 });
            } else {
                setPosition(current => clampPosition(current.x, current.y, next));
            }
            return next;
        });
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Click and Drag event listeners (Compensating for active CSS Zoom)
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        const zoomFactor = getComputedZoom();
        dragStartRef.current = {
            // Divide position by zoomFactor to map mouse delta 1-to-1 in zoomed screens
            x: e.clientX - position.x * zoomFactor,
            y: e.clientY - position.y * zoomFactor
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const zoomFactor = getComputedZoom();
        const rawX = (e.clientX - dragStartRef.current.x) / zoomFactor;
        const rawY = (e.clientY - dragStartRef.current.y) / zoomFactor;
        setPosition(clampPosition(rawX, rawY, scale));
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Mobile Touch Drag handlers (Compensating for active CSS Zoom)
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            const zoomFactor = getComputedZoom();
            dragStartRef.current = {
                x: e.touches[0].clientX - position.x * zoomFactor,
                y: e.touches[0].clientY - position.y * zoomFactor
            };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        if (e.touches.length === 1) {
            const zoomFactor = getComputedZoom();
            const rawX = (e.touches[0].clientX - dragStartRef.current.x) / zoomFactor;
            const rawY = (e.touches[0].clientY - dragStartRef.current.y) / zoomFactor;
            setPosition(clampPosition(rawX, rawY, scale));
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Silky smooth mousewheel handler with clamp
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        const step = 0.15;
        setScale(prev => {
            const next = Math.max(1, Math.min(prev + direction * step, 3));
            if (next === 1) {
                setPosition({ x: 0, y: 0 });
            } else {
                setPosition(current => clampPosition(current.x, current.y, next));
            }
            return next;
        });
    };

    return (
        <div 
            id="available_window" 
            className={`image_render w-full h-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden p-4 lg:p-8 relative ${config.productId.replace(/-/g, '_')}_wrap select-none`}
            onWheel={handleWheel}
        >
            {/* FLOATING ZOOM / PAN CONTROLS */}
            <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-900 hover:text-white transition-all hover:scale-105 active:scale-95 text-lg font-bold select-none"
                    aria-label="Zoom In"
                >
                    ＋
                </button>
                <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-900 hover:text-white transition-all hover:scale-105 active:scale-95 text-lg font-bold select-none"
                    aria-label="Zoom Out"
                >
                    －
                </button>
                <button
                    onClick={handleReset}
                    title="Reset View"
                    className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-md flex items-center justify-center text-slate-800 hover:bg-slate-900 hover:text-white transition-all hover:scale-105 active:scale-95 select-none"
                    aria-label="Reset View"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                    </svg>
                </button>
            </div>

            {/* HELPER GESTURE INSTRUCTION */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/80 backdrop-blur-sm text-white px-5 py-1.5 rounded-full text-[10px] tracking-wider uppercase font-semibold pointer-events-none transition-all duration-300">
                Drag model to move • Scroll to zoom
            </div>

            {/* LOADING OVERLAY */}
            <div
                className={`absolute inset-0 z-[999] flex items-center justify-center bg-[#f8f9fa]/50 backdrop-blur-[2px] transition-opacity duration-300 
                ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                <img src="/loading.svg" alt="Loading..." className="w-12 h-12 animate-spin opacity-80" />
            </div>

            {/* SUIT IMAGES CONTAINER (ZOOMABLE & DRAGGABLE) */}
            <div 
                className={`layers viewport relative w-full max-w-[550px] aspect-[1/2] select-none ${config.productId.replace(/-/g, '_')}`}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
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