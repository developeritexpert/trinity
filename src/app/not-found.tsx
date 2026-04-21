// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300&display=swap"
                rel="stylesheet"
            />
            <style>{`
                .nf-root {
                    min-height: 100vh;
                    background-color: #06060a;
                    background-image:
                        repeating-linear-gradient(
                            0deg,
                            transparent, transparent 49px,
                            rgba(200,169,110,0.04) 49px,
                            rgba(200,169,110,0.04) 50px
                        ),
                        repeating-linear-gradient(
                            90deg,
                            transparent, transparent 49px,
                            rgba(200,169,110,0.04) 49px,
                            rgba(200,169,110,0.04) 50px
                        );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Jost', sans-serif;
                }

                /* ── Grain texture ── */
                .nf-grain {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 1;
                    opacity: 0.45;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
                }

                /* ── Radial warmth ── */
                .nf-radial {
                    position: fixed;
                    inset: 0;
                    background: radial-gradient(
                        ellipse 85% 65% at 50% 50%,
                        rgba(200,169,110,0.055) 0%,
                        transparent 70%
                    );
                    pointer-events: none;
                    z-index: 1;
                }

                /* ── Corner brackets ── */
                .nf-corner {
                    position: fixed;
                    width: 52px;
                    height: 52px;
                    pointer-events: none;
                    z-index: 2;
                    opacity: 0;
                    animation: nfFadeIn 1.2s ease 1.3s forwards;
                }
                .nf-corner--tl { top: 1.75rem; left: 1.75rem; }
                .nf-corner--tr { top: 1.75rem; right: 1.75rem; transform: scaleX(-1); }
                .nf-corner--bl { bottom: 1.75rem; left: 1.75rem; transform: scaleY(-1); }
                .nf-corner--br { bottom: 1.75rem; right: 1.75rem; transform: scale(-1, -1); }

                /* ── Content ── */
                .nf-content {
                    position: relative;
                    z-index: 3;
                    text-align: center;
                    padding: 2rem 1.5rem;
                    max-width: 740px;
                    width: 100%;
                }

                /* ── Eyebrow ── */
                .nf-eyebrow {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.1rem;
                    margin-bottom: 2.8rem;
                    opacity: 0;
                    animation: nfRise 1s cubic-bezier(0.22,1,0.36,1) 0.25s forwards;
                }
                .nf-eyebrow-line {
                    height: 1px;
                    width: 48px;
                    background: linear-gradient(90deg, transparent, rgba(200,169,110,0.7));
                }
                .nf-eyebrow-line:last-child {
                    background: linear-gradient(90deg, rgba(200,169,110,0.7), transparent);
                }
                .nf-eyebrow-text {
                    font-family: 'Jost', sans-serif;
                    font-weight: 200;
                    font-size: 0.6rem;
                    letter-spacing: 0.62em;
                    color: rgba(200,169,110,0.85);
                    text-transform: uppercase;
                }

                /* ── Needle icon ── */
                .nf-needle-wrap {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.6rem;
                    opacity: 0;
                    animation: nfRise 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s forwards;
                }
                .nf-needle-path {
                    stroke-dasharray: 140;
                    stroke-dashoffset: 140;
                    animation: nfDraw 1.6s cubic-bezier(0.4,0,0.2,1) 0.8s forwards;
                }
                .nf-thread-path {
                    stroke-dasharray: 80;
                    stroke-dashoffset: 80;
                    animation: nfDraw 2s cubic-bezier(0.4,0,0.2,1) 1.1s forwards;
                }

                /* ── 404 ── */
                .nf-number {
                    display: block;
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 300;
                    font-size: clamp(8rem, 22vw, 17rem);
                    line-height: 0.86;
                    letter-spacing: -0.02em;
                    background: linear-gradient(
                        165deg,
                        #f5f0e8 0%,
                        #d9bc80 40%,
                        rgba(180,140,60,0.4) 100%
                    );
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                    opacity: 0;
                    animation: nfDescend 1.2s cubic-bezier(0.22,1,0.36,1) 0s forwards;
                }

                /* ── Ornament divider ── */
                .nf-ornament {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin: 2.1rem 0 1.6rem;
                    opacity: 0;
                    animation: nfRise 0.9s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
                }
                .nf-orn-line {
                    height: 1px;
                    width: 90px;
                    background: linear-gradient(90deg, transparent, rgba(200,169,110,0.45));
                }
                .nf-orn-line:last-child {
                    background: linear-gradient(90deg, rgba(200,169,110,0.45), transparent);
                }
                .nf-orn-cluster {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .nf-diamond {
                    background: #c8a96e;
                    transform: rotate(45deg);
                    flex-shrink: 0;
                }
                .nf-diamond--lg { width: 5px; height: 5px; opacity: 0.8; }
                .nf-diamond--sm { width: 3px; height: 3px; opacity: 0.4; }

                /* ── Subtitle ── */
                .nf-subtitle {
                    font-family: 'Jost', sans-serif;
                    font-weight: 200;
                    font-size: 0.58rem;
                    letter-spacing: 0.58em;
                    color: rgba(245,240,232,0.4);
                    text-transform: uppercase;
                    margin: 0 0 1.9rem;
                    opacity: 0;
                    animation: nfRise 0.9s cubic-bezier(0.22,1,0.36,1) 0.72s forwards;
                }

                /* ── Copy ── */
                .nf-copy {
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 300;
                    font-style: italic;
                    font-size: clamp(1.05rem, 2.1vw, 1.32rem);
                    color: rgba(245,240,232,0.42);
                    line-height: 1.85;
                    max-width: 440px;
                    margin: 0 auto 3rem;
                    opacity: 0;
                    animation: nfRise 0.9s cubic-bezier(0.22,1,0.36,1) 0.88s forwards;
                }

                /* ── CTA ── */
                .nf-cta {
                    display: inline-block;
                    padding: 1.1rem 3.2rem;
                    border: 1px solid rgba(200,169,110,0.32);
                    color: rgba(200,169,110,0.88);
                    font-family: 'Jost', sans-serif;
                    font-weight: 200;
                    font-size: 0.6rem;
                    letter-spacing: 0.52em;
                    text-transform: uppercase;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    opacity: 0;
                    animation: nfRise 0.9s cubic-bezier(0.22,1,0.36,1) 1.05s forwards;
                    transition: color 0.5s ease, border-color 0.5s ease;
                }
                .nf-cta::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: #c8a96e;
                    transform: translateX(-101%);
                    transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
                }
                .nf-cta:hover {
                    color: #06060a;
                    border-color: #c8a96e;
                }
                .nf-cta:hover::after {
                    transform: translateX(0);
                }
                .nf-cta-inner {
                    position: relative;
                    z-index: 1;
                }

                /* ── Animations ── */
                @keyframes nfRise {
                    from { opacity: 0; transform: translateY(22px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes nfDescend {
                    from { opacity: 0; transform: translateY(-28px) scale(0.975); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes nfFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes nfDraw {
                    to { stroke-dashoffset: 0; }
                }
            `}</style>

            <div className="nf-root">
                {/* Atmosphere layers */}
                <div className="nf-grain" aria-hidden="true" />
                <div className="nf-radial" aria-hidden="true" />

                {/* Corner brackets */}
                {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
                    <svg
                        key={pos}
                        className={`nf-corner nf-corner--${pos}`}
                        viewBox="0 0 52 52"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path d="M1 52 L1 1 L52 1" stroke="rgba(200,169,110,0.32)" strokeWidth="1" />
                        <path d="M7 52 L7 7 L52 7" stroke="rgba(200,169,110,0.14)" strokeWidth="0.5" />
                    </svg>
                ))}

                {/* Main content */}
                <div className="nf-content">

                    {/* Eyebrow */}
                    <div className="nf-eyebrow" aria-hidden="true">
                        <div className="nf-eyebrow-line" />
                        <span className="nf-eyebrow-text">Bespoke Atelier</span>
                        <div className="nf-eyebrow-line" />
                    </div>

                    {/* Needle icon */}
                    <div className="nf-needle-wrap" aria-hidden="true">
                        <svg width="88" height="32" viewBox="0 0 88 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Needle body */}
                            <path
                                className="nf-needle-path"
                                d="M10 16 L74 7 L84 16 L74 25 L10 16Z"
                                stroke="rgba(200,169,110,0.7)"
                                strokeWidth="0.8"
                                fill="rgba(200,169,110,0.04)"
                            />
                            {/* Needle eye */}
                            <ellipse
                                className="nf-needle-path"
                                cx="15" cy="16" rx="3.5" ry="5"
                                stroke="rgba(200,169,110,0.7)"
                                strokeWidth="0.8"
                                fill="none"
                            />
                            {/* Thread */}
                            <path
                                className="nf-thread-path"
                                d="M11 16 C4 8, -6 18, 2 22 C8 25, 10 19, 6 17"
                                stroke="rgba(200,169,110,0.42)"
                                strokeWidth="0.7"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* 404 */}
                    <span className="nf-number" aria-label="404 — Page not found">
                        404
                    </span>

                    {/* Ornament */}
                    <div className="nf-ornament" aria-hidden="true">
                        <div className="nf-orn-line" />
                        <div className="nf-orn-cluster">
                            <div className="nf-diamond nf-diamond--sm" />
                            <div className="nf-diamond nf-diamond--lg" />
                            <div className="nf-diamond nf-diamond--sm" />
                        </div>
                        <div className="nf-orn-line" />
                    </div>

                    {/* Subtitle */}
                    <p className="nf-subtitle">Pattern Not Found</p>


                    {/* CTA */}
                    <Link href="/men/suit" className="nf-cta">
                        <span className="nf-cta-inner">Return to the Atelier</span>
                    </Link>
                </div>
            </div>
        </>
    );
}