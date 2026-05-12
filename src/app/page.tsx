// src/app/page.tsx
import Link from "next/link";
import Footer from "@/shared/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* Premium Luxury Hero Section */}
      <section className="relative flex-grow flex flex-col justify-center py-20 md:py-32 px-6 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Subtle background luxury mesh gradient blur */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-50/50 rounded-full filter blur-3xl -z-10" />
        
        <div className="max-w-2xl space-y-8 relative z-10">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#0066FF] uppercase">
            SARTORIAL EXCELLENCE
          </span>
          
          <h1 className="text-4xl md:text-6xl font-serif font-semibold tracking-tight text-slate-900 leading-[1.15]">
            Custom Garments,<br />
            Tailored <span className="italic font-light text-slate-500">Exclusively</span> for You.
          </h1>
          
          <p className="text-xs md:text-sm text-gray-500 leading-relaxed max-w-lg">
            Experience the luxury of premium bespoke tailoring. Choose your custom fabrics, lining styles, pocket varieties, hemlines, and custom buttons in our real-time interactive configurator.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/women/womens-blazers"
              className="relative group px-8 py-4 bg-slate-900 text-white rounded text-[10px] font-semibold tracking-widest uppercase hover:bg-black transition-all shadow-lg hover:shadow-xl text-center"
            >
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40 transition-all group-hover:w-3 group-hover:h-3"></span>
              <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40 transition-all group-hover:w-3 group-hover:h-3"></span>
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40 transition-all group-hover:w-3 group-hover:h-3"></span>
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40 transition-all group-hover:w-3 group-hover:h-3"></span>
              Customize Women's Blazer
            </Link>

            <Link 
              href="/men/shirt"
              className="relative group px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded text-[10px] font-semibold tracking-widest uppercase hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
            >
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-400/30 transition-all group-hover:w-3 group-hover:h-3"></span>
              <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-400/30 transition-all group-hover:w-3 group-hover:h-3"></span>
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-400/30 transition-all group-hover:w-3 group-hover:h-3"></span>
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-slate-400/30 transition-all group-hover:w-3 group-hover:h-3"></span>
              Design Men's Custom Shirt
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Showroom */}
      <section className="bg-slate-50/50 border-t border-slate-100 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-serif font-semibold tracking-tight text-slate-900">
              The Bespoke Collection
            </h2>
            <p className="text-xs text-gray-400 tracking-wider uppercase">
              Select a silhouette to begin your custom configuration
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Blazer Card */}
            <div className="bg-white border border-slate-100 p-8 rounded hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <span className="text-[9px] font-bold tracking-widest text-[#0066FF] uppercase">Women's Collection</span>
                <h3 className="text-lg font-serif font-semibold text-slate-800">Double Breasted Blazer</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Tailored blazers custom fit with premium linings, lapel configurations, and luxury button options.
                </p>
              </div>
              <Link href="/women/womens-blazers" className="text-[10px] font-semibold text-slate-900 group-hover:text-[#0066FF] transition-colors mt-8 inline-flex items-center gap-1.5 uppercase tracking-widest">
                Begin Customizing
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Custom Shirt Card */}
            <div className="bg-white border border-slate-100 p-8 rounded hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <span className="text-[9px] font-bold tracking-widest text-[#0066FF] uppercase">Men's Collection</span>
                <h3 className="text-lg font-serif font-semibold text-slate-800">Sartorial Dress Shirt</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Bespoke shirts crafted from authentic long-staple cotton twills, custom collars, and sleeve choices.
                </p>
              </div>
              <Link href="/men/shirt" className="text-[10px] font-semibold text-slate-900 group-hover:text-[#0066FF] transition-colors mt-8 inline-flex items-center gap-1.5 uppercase tracking-widest">
                Begin Customizing
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Premium Suit Card */}
            <div className="bg-white border border-slate-100 p-8 rounded hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <span className="text-[9px] font-bold tracking-widest text-[#0066FF] uppercase">Men's Collection</span>
                <h3 className="text-lg font-serif font-semibold text-slate-800">Custom Executive Suit</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Classic two-piece and three-piece custom wool suits hand-stitched for unmatched visual presence.
                </p>
              </div>
              <Link href="/men/suit" className="text-[10px] font-semibold text-slate-900 group-hover:text-[#0066FF] transition-colors mt-8 inline-flex items-center gap-1.5 uppercase tracking-widest">
                Begin Customizing
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
