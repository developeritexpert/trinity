// src/shared/components/Footer.tsx
'use client';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-12 px-6 font-sans mt-auto">
            <div className="max-w-7xl mx-auto">

                {/* 4-Column Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-gray-100 pb-16">

                    {/* Column 1: Logo */}
                    <div className="flex items-start">
                        <Link href="/" className="inline-block group">
                            <img
                                src="https://www.trinityclothiers.com/cdn/shop/files/Logo_220x.png?v=1736856009"
                                alt="Trinity Clothiers"
                                className="h-14 w-auto object-contain transition-opacity group-hover:opacity-80"
                            />
                        </Link>
                    </div>

                    {/* Column 2: First Nav Menu */}
                    <div>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/women/womens-blazers" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                                    Women's Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/measurement-instructions" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                                    Men's Measurements
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact-us" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Second Nav Menu */}
                    <div>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/men/shirt" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                                    Men's Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/measurement-instructions" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                                    Women's Measurements
                                </Link>
                            </li>
                            <li>
                                <Link href="https://www.trinityclothiers.com/pages/about-us" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social Connect */}
                    <div className="space-y-4">
                        <h3 className="text-base font-serif font-semibold tracking-wide text-slate-900">
                            Social Connect
                        </h3>

                        <div className="flex items-center gap-2.5">
                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TrinityClothiers on Facebook"
                                className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center text-slate-800 hover:border-[#0066FF] hover:text-[#0066FF] transition-all"
                            >
                                <span className="text-sm font-bold">f</span>
                            </a>

                            {/* Twitter / X */}
                            <a
                                href="https://twitter.com/shopify"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TrinityClothiers on Twitter"
                                className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center text-slate-800 hover:border-black hover:text-black transition-all"
                            >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://instagram.com/shopify"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TrinityClothiers on Instagram"
                                className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center text-slate-800 hover:border-[#D946EF] hover:text-[#D946EF] transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>

                            {/* YouTube */}
                            <a
                                href="https://www.youtube.com/user/shopify"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TrinityClothiers on YouTube"
                                className="w-9 h-9 border border-gray-300 rounded-md flex items-center justify-center text-slate-800 hover:border-red-600 hover:text-red-600 transition-all"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                </div>

                {/* Branded Trust Payment Section */}
                <div className="py-12 text-center space-y-6">
                    <h3 className="text-2xl font-serif tracking-wide text-slate-800">
                        Payment Method
                    </h3>
                    <div className="inline-block bg-white px-4">
                        <img
                            src="https://cdn.shopify.com/s/files/1/1785/0229/files/payment.png?v=1737016747"
                            alt="Payment Methods"
                            className="h-[55px] md:h-[60px] w-auto object-contain mx-auto"
                        />
                    </div>
                </div>

                {/* Bottom Legal Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-100 text-[10px] text-gray-500 tracking-wider font-semibold uppercase space-y-4 sm:space-y-0">
                    <div className="flex items-center gap-1">
                        <span>© 2026, </span>
                        <Link href="/" className="hover:text-slate-800 transition-colors">
                            TrinityClothiers
                        </Link>
                        <span> All rights reserved.</span>
                    </div>

                    <nav className="flex items-center gap-6">
                        <Link href="/policies/privacy-policy" className="hover:text-slate-800 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/policies/terms-of-service" className="hover:text-slate-800 transition-colors">
                            Terms & Condition
                        </Link>
                    </nav>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
