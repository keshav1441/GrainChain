import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  crop_type: string;
  price_per_kg: number;
  quantity: number;
  farmer_id: string;
  farmer_name: string;
  location: string;
  image?: string;
  max_quantity: number; // Available quantity from farmer
  selected_quantity: number; // Quantity selected by user
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (item: Omit<CartItem, 'selected_quantity'> & { selected_quantity: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getItemCount: (id: string) => number;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addToCart: (item) => {
        const { items } = get();
        const existingItem = items.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = Math.min(
            existingItem.selected_quantity + item.selected_quantity,
            item.max_quantity
          );
          set({
            items: items.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, selected_quantity: newQuantity }
                : cartItem
            )
          });
        } else {
          // Add new item to cart
          set({
            items: [...items, { ...item }]
          });
        }
      },

      removeFromCart: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        });
      },

      updateQuantity: (id, quantity) => {
        const { items } = get();
        const item = items.find(cartItem => cartItem.id === id);
        
        if (item && quantity > 0 && quantity <= item.max_quantity) {
          set({
            items: items.map(cartItem =>
              cartItem.id === id
                ? { ...cartItem, selected_quantity: quantity }
                : cartItem
            )
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => 
          total + (item.price_per_kg * item.selected_quantity), 0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.selected_quantity, 0);
      },

      getItemCount: (id) => {
        const item = get().items.find(cartItem => cartItem.id === id);
        return item ? item.selected_quantity : 0;
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      setCartOpen: (open) => {
        set({ isOpen: open });
      },
    }),
    {
      name: 'grainchain-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
