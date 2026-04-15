// src/features/configurator/components/LayeredViewer.tsx
'use client';
import { useConfigStore } from '../store/useConfigStore';
import { AssetLayer } from '@/core/types/product.types';

export const LayeredViewer = () => {
    const { config, selections } = useConfigStore();

    if (!config) return <div className="w-full h-full bg-[#f5f5f5] animate-pulse" />;

    // 1. EXTRACT DYNAMIC TOKENS (Color, Style, Lapel, Width)
    let activeColorCode = 'navy';
    let activeStyleCode = 'single_breasted';
    let activeLapelCode = 'notch';
    let activeWidthCode = 'standard';

    config.attributes.forEach((attr) => {
        const selectedOpt = attr.options.find(opt => opt.id === selections[attr.id]);
        if (attr.id === 'fabric'      && selectedOpt?.colorCode) activeColorCode = selectedOpt.colorCode;
        if (attr.id === 'style'       && selectedOpt?.styleCode) activeStyleCode = selectedOpt.styleCode;
        if (attr.id === 'lapel_style' && selectedOpt?.lapelCode) activeLapelCode = selectedOpt.lapelCode;
        if (attr.id === 'lapel_width' && selectedOpt?.widthCode) activeWidthCode = selectedOpt.widthCode;
    });

    // 2. Gather all active assets
    const activeAssets: AssetLayer[] = [];
    config.attributes.forEach((attr) => {
        const selectedOptionId = selections[attr.id];
        const option = attr.options.find(opt => opt.id === selectedOptionId);
        if (option && option.assets) activeAssets.push(...option.assets);
    });

    const sortedAssets = activeAssets.sort((a, b) => a.zIndex - b.zIndex);

    return (
        <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden p-4 lg:p-8">
            <div className="relative w-full max-w-[550px] aspect-[1/2] transition-all duration-500">

                {sortedAssets.map((asset, index) => {
                    const customClass = asset.className ? asset.className : "top-0 left-0 w-full h-full object-contain";

                    // 3. REPLACE ALL 4 TOKENS IN THE URL
                    const finalImageUrl = asset.url
                        .replace('{{color}}', activeColorCode)
                        .replace('{{style}}', activeStyleCode)
                        .replace('{{lapel}}', activeLapelCode)
                        .replace('{{width}}', activeWidthCode);

                    return (
                        <img
                            key={`${finalImageUrl}-${index}`}
                            src={finalImageUrl}
                            alt="Product Layer"
                            className={`absolute pointer-events-none drop-shadow-sm ${customClass}`}
                        />
                    );
                })}

            </div>
        </div>
    );
};