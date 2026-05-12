// src/features/cart/components/CartDrawer.tsx
'use client';
import { useCartStore } from '../store/useCartStore';

export const CartDrawer = () => {
    const { items, isOpen, setIsOpen, removeItem } = useCartStore();

    if (!isOpen) return null;

    const subtotal = items.reduce((sum, item) => sum + item.priceBreakdown.totalPrice, 0);

    const handleCheckout = async () => {
        alert(
            "Integration Live!\n\nNext Step:\nOnce your client grants Shopify Private App permission, we'll build the API Route to securely exchange this local cart for a Shopify Checkout link."
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Elegant glassmorphic backdrop overlay */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={() => setIsOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                {/* Main slide-in sidebar container */}
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-100 transform transition-transform duration-300">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-serif text-slate-900 font-semibold tracking-wide">Your Shopping Bag</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{items.length} tailored custom items</p>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-slate-50 rounded-full text-gray-400 hover:text-slate-900 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Scrollable list of custom creations */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <svg className="w-12 h-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-sm font-medium text-slate-500">Your shopping bag is empty.</p>
                                <p className="text-xs text-gray-400 mt-1">Choose your designs to get started.</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex items-start gap-4 border-b border-gray-50 pb-6 last:border-none last:pb-0 group">
                                    {/* Product Visual Tag */}
                                    <div className="w-14 h-18 bg-slate-50 border border-gray-100 rounded flex flex-col items-center justify-center text-slate-400 font-serif flex-shrink-0 text-[10px] text-center font-bold uppercase tracking-wider select-none">
                                        <span className="text-gray-300 font-sans text-[8px] tracking-normal mb-1">Tailor</span>
                                        {item.productName.split(' ')[0]}
                                    </div>

                                    {/* Specifications */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-serif font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors leading-tight">
                                                {item.productName}
                                            </h3>
                                            <span className="text-sm font-semibold text-slate-900 ml-2">
                                                ${item.priceBreakdown.totalPrice.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Price additions breakdown */}
                                        {item.priceBreakdown.addOns.length > 0 && (
                                            <div className="mt-2 text-[10px] text-gray-400 space-y-0.5 leading-relaxed bg-slate-50 p-2 rounded border border-gray-100/50">
                                                {item.priceBreakdown.addOns.map((addon, index) => (
                                                    <div key={index} className="flex justify-between">
                                                        <span>{addon.label.split(': ')[1] || addon.label}</span>
                                                        <span className="font-semibold text-slate-500">+${addon.amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Choices overview summary */}
                                        <div className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                                            <span className="font-semibold text-slate-500">Selections:</span>{' '}
                                            {Object.entries(item.selections)
                                                .map(([key, val]) => `${key}: ${val}`)
                                                .join(', ')}
                                        </div>

                                        {/* Remove operation */}
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="text-[10px] text-red-500 hover:text-red-700 font-semibold tracking-wider uppercase mt-4 flex items-center gap-1 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Remove Design
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Aggregate checkout section */}
                    {items.length > 0 && (
                        <div className="p-6 border-t border-gray-100 bg-slate-50 flex-shrink-0">
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Fabric Base Price</span>
                                    <span>${items.reduce((sum, item) => sum + item.priceBreakdown.basePrice, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Sartorial Adjustments</span>
                                    <span>
                                        ${items.reduce((sum, item) => {
                                            const addonsSum = item.priceBreakdown.addOns.reduce((s, a) => s + a.amount, 0);
                                            return sum + addonsSum;
                                        }, 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Custom Sizing & Hand Delivery</span>
                                    <span className="text-green-600 font-semibold tracking-wider uppercase text-[10px]">Free</span>
                                </div>
                                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-base font-bold text-slate-900 font-serif">
                                    <span>Total Sum</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full relative group py-4 text-xs font-semibold tracking-widest uppercase bg-slate-900 text-white rounded hover:bg-black transition-all shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
                            >
                                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50 transition-all group-hover:w-3 group-hover:h-3"></span>
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
