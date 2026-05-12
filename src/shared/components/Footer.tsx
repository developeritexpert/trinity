// src/shared/components/Footer.tsx
'use client';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="w-full bg-[#F9FAFB] border-t border-gray-100 pt-16 pb-10 px-6 font-sans mt-auto">
            <div className="max-w-7xl mx-auto">
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 border-b border-gray-200/60 pb-12">
                    
                    {/* Brand Logo and Quick Links Column */}
                    <div className="space-y-6">
                        <div className="footer-logo">
                            <Link href="https://www.trinityclothiers.com/" className="inline-block group">
                                <img 
                                    src="https://www.trinityclothiers.com/cdn/shop/files/Logo.png?v=1736856009" 
                                    alt="logo" 
                                    height="100"
                                    className="h-[80px] md:h-[100px] w-auto object-contain transition-opacity group-hover:opacity-85"
                                />
                            </Link>
                        </div>
                        
                        <nav className="flex flex-col gap-2.5">
                            <Link href="/" className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors font-medium">
                                Home
                            </Link>
                            <Link href="/men/shirt" className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors font-medium">
                                Men's Shop
                            </Link>
                            <Link href="/women/womens-blazers" className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors font-medium">
                                Women's Shop
                            </Link>
                            <Link href="/measurement-instructions" className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors font-medium">
                                Women's Measurements
                            </Link>
                            <Link href="/measurement-instructions" className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors font-medium">
                                Men's Measurements
                            </Link>
                            <Link href="/about-us" className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors font-medium">
                                About Us
                            </Link>
                            <Link href="/contact-us" className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors font-medium">
                                Contact Us
                            </Link>
                        </nav>
                    </div>

                    {/* Social Connect Column */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-serif font-bold tracking-wider text-slate-900">
                            Social Connect
                        </h3>
                        
                        <ul className="flex flex-col gap-3">
                            <li>
                                <a 
                                    href="https://www.facebook.com/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="TrinityClothiers on Facebook"
                                    className="text-xs text-gray-500 hover:text-[#0066FF] transition-colors inline-flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-4 h-4 text-slate-700 hover:text-[#0066FF] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                    </svg>
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://twitter.com/shopify" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="TrinityClothiers on Twitter"
                                    className="text-xs text-gray-500 hover:text-slate-900 transition-colors inline-flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-4 h-4 text-slate-700 hover:text-slate-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                    Twitter
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://instagram.com/shopify" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="TrinityClothiers on Instagram"
                                    className="text-xs text-gray-500 hover:text-[#D946EF] transition-colors inline-flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-4 h-4 text-slate-700 hover:text-[#D946EF] transition-colors" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                    Instagram
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://www.youtube.com/user/shopify" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="TrinityClothiers on YouTube"
                                    className="text-xs text-gray-500 hover:text-red-600 transition-colors inline-flex items-center gap-2 font-medium"
                                >
                                    <svg className="w-4 h-4 text-slate-700 hover:text-red-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                    YouTube
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Branded Trust Payment Section */}
                    <div className="flex flex-col items-start lg:items-center justify-start space-y-4">
                        <div className="text-left lg:text-center w-full">
                            <h3 className="text-sm font-serif font-bold tracking-wider text-slate-900 mb-4">
                                Payment Method
                            </h3>
                            <div className="inline-block bg-white border border-gray-100 rounded p-2 shadow-xs">
                                <img 
                                    src="https://cdn.shopify.com/s/files/1/1785/0229/files/payment.png?v=1737016747" 
                                    alt="Payment Methods" 
                                    height="60"
                                    className="h-[45px] md:h-[60px] w-auto object-contain"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Legal Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[10px] text-gray-400 tracking-wider font-semibold uppercase space-y-4 sm:space-y-0">
                    <div className="flex items-center gap-1">
                        <span>© 2026, </span>
                        <Link href="/" className="hover:text-slate-700 transition-colors">
                            TrinityClothiers
                        </Link>
                        <span> All rights reserved.</span>
                    </div>
                    
                    <nav className="flex items-center gap-6">
                        <Link href="/policies/privacy-policy" className="hover:text-slate-700 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/policies/terms-of-service" className="hover:text-slate-700 transition-colors">
                            Terms & Conditions
                        </Link>
                    </nav>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
