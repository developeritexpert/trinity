// src/features/cart/store/useCartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PriceBreakdown } from '@/core/shopify/calculatePrice';

export interface CartItem {
    id: string;                          // Unique ID for this cart item instance
    productId: string;                   // Local product configuration ID (e.g., 'womens-blazers', 'men-shirt')
    productName: string;                 // Human-friendly title (e.g., "Women's Blazer")
    selections: Record<string, string>;  // Selected attributes map (e.g., { fabric: "fab_navy_blue", ... })
    priceBreakdown: PriceBreakdown;      // Precise calculation breakdown (base, addons, total)
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            isOpen: false,
            
            addItem: (newItem) => set((state) => ({
                items: [
                    ...state.items, 
                    { 
                        ...newItem, 
                        id: `cart_${Math.random().toString(36).substring(2, 9)}` // generate a secure local item ID
                    }
                ],
                isOpen: true // Automatically open the cart drawer when an item is added
            })),
            
            removeItem: (id) => set((state) => ({
                items: state.items.filter((item) => item.id !== id)
            })),
            
            clearCart: () => set({ items: [] }),

            setIsOpen: (isOpen) => set({ isOpen }),
        }),
        {
            name: 'trinity-cart-storage', // LocalStorage item key
        }
    )
);
export default useCartStore;
