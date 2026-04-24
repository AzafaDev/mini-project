import { create } from "zustand";

export interface CartItem {
  eventId: string;
  eventName: string;
  eventImage: string;
  ticketType: "GENERAL" | "VIP";
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item: CartItem) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.eventId === item.eventId && i.ticketType === item.ticketType
      );

      if (existingIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex].quantity += item.quantity;
        return { items: updatedItems };
      }

      return { items: [...state.items, item] };
    });
  },

  removeItem: (index: number) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },

  updateQuantity: (index: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(index);
      return;
    }

    set((state) => {
      const updatedItems = [...state.items];
      updatedItems[index].quantity = quantity;
      return { items: updatedItems };
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
