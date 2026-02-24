import { create } from 'zustand';
import type { QuoteItem, CalcSettings } from '../types';
import { mockCustomers } from '../data/mockData';

interface QuoteState {
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Theme state
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Quote Items
  items: QuoteItem[];
  addItem: (item: Omit<QuoteItem, 'id'>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;

  // Calculation Settings
  settings: CalcSettings;
  updateSettings: (newSettings: Partial<CalcSettings>) => void;
  setCustomer: (customerId: string) => void;
}

export const useQuoteStore = create<QuoteState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  items: [
    // Initial mock data based on HTML
    { id: '1', productType: '圓管', materialId: 'A1', length: 20, quantity: 30, costPrice: 1200 },
    { id: '2', productType: '圓管', materialId: 'B2', length: 100, quantity: 15, costPrice: 2200 },
    { id: '3', productType: '圓管', materialId: 'C3', length: 55, quantity: 120, costPrice: 6200 },
  ],
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: crypto.randomUUID() }]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clearItems: () => set({ items: [] }),

  settings: {
    mode: 'manual',
    cutMultiplier: 1.25,
    weightMultiplier: 5.0,
    customerId: 'CCC',
    discount: 0.15,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  setCustomer: (customerId) => set((state) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    return {
      settings: {
        ...state.settings,
        customerId,
        discount: customer ? customer.discount : 0
      }
    };
  }),
}));
