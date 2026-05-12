// src/shared/components/Header.tsx
'use client';
import Link from 'next/link';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { CartDrawer } from '@/features/cart/components/CartDrawer';

export const Header = () => {
    const { items, setIsOpen } = useCartStore();
    const cartCount = items.length;

    return (
        <header className="w-full bg-white border-b border-gray-100 z-40 relative font-sans">
            {/* Top Promotion Utility Bar */}
            <div className="w-full bg-[#0070d8] text-[white] py-2 text-center text-[10px] font-bold tracking-widest">
                *Free shipping for Orders over $175
            </div>

            {/* Main Navbar */}
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Logo & Brand Left */}
                <Link href="/" className="flex items-center group">
                    <img
                        src="https://www.trinityclothiers.com/cdn/shop/files/Logo_220x.png?v=1736856009"
                        alt="Trinity Clothiers"
                        className="h-9 w-auto object-contain transition-opacity group-hover:opacity-80"
                    />
                </Link>

                {/* Navigation Links Center */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link href="/" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                        Home
                    </Link>

                    {/* Shop Dropdown */}
                    <div className="relative group/shop py-4">
                        <button className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors focus:outline-none">
                            Shop
                            <svg className="w-3 h-3 text-gray-400 group-hover/shop:text-[#0066FF] transition-transform duration-200 group-hover/shop:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu Container */}
                        <div className="absolute top-full left-0 mt-0 w-52 bg-white border border-gray-100 shadow-xl rounded-md py-2 opacity-0 invisible group-hover/shop:opacity-100 group-hover/shop:visible transition-all duration-200 z-50">
                            <Link href="/men/shirt" className="block px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] transition-colors">
                                Men's Custom Shirts
                            </Link>
                            <Link href="/men/suit" className="block px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] transition-colors">
                                Men's Custom Suits
                            </Link>
                            <Link href="/men/blazer" className="block px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] transition-colors">
                                Men's Custom Blazers
                            </Link>
                            <Link href="/men/trouser" className="block px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] transition-colors">
                                Men's Custom Trousers
                            </Link>
                            <div className="border-t border-gray-100 my-1" />
                            <Link href="/women/womens-blazers" className="block px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] transition-colors">
                                Women's Custom Blazers
                            </Link>
                        </div>
                    </div>

                    <Link href="https://www.trinityclothiers.com/pages/measurements" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                        Measurement Instructions
                    </Link>
                    <Link href="https://www.trinityclothiers.com/pages/ambassador" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                        Ambassador
                    </Link>
                    <Link href="https://www.trinityclothiers.com/pages/about-us" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                        About Us
                    </Link>
                    <Link href="https://www.trinityclothiers.com/pages/contact-us" className="text-[11px] font-semibold uppercase tracking-widest text-slate-900 hover:text-[#0066FF] transition-colors">
                        Contact Us
                    </Link>
                </nav>

                {/* Right Utilities (Profile, Search, Cart Bag) */}
                <div className="flex items-center gap-5 text-slate-700">
                    {/* Profile Account */}
                    <button className="hover:text-[#0066FF] transition-colors p-1" aria-label="Account Profile">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>

                    {/* Search */}
                    <button className="hover:text-[#0066FF] transition-colors p-1" aria-label="Search Catalog">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* Unified Cart Bag Toggle */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="hover:text-[#0066FF] transition-colors p-1 relative flex items-center"
                        aria-label="Shopping Bag"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1.5 bg-[#0066FF] text-white text-[8px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

            </div>
            <CartDrawer />
        </header>
    );
};

export default Header;
