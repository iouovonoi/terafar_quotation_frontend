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
  updateItem: (id: string, updates: Partial<QuoteItem>) => void;

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

  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, { ...item, id: crypto.randomUUID() }]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clearItems: () => set({ items: [] }),
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
  })),

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
