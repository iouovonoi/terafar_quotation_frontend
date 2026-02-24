import type { Material, Customer } from '../types';

export const mockMaterials: Material[] = [
  { id: 'A1', type: '圓管', name: 'A1', unitPrice: 2.0 }, // 每 mm 2元
  { id: 'B2', type: '圓管', name: 'B2', unitPrice: 1.466 }, // 100mm * 15 = 1500mm, 2200 / 1500 = 1.466
  { id: 'C3', type: '圓管', name: 'C3', unitPrice: 0.939 }, // 55mm * 120 = 6600mm, 6200 / 6600 = 0.939
  { id: 'D4', type: '圓鐵', name: 'D4', unitPrice: 3.5 },
  { id: 'E5', type: '四角鐵', name: 'E5', unitPrice: 4.2 },
];

export const mockCustomers: Customer[] = [
  { id: 'AAA', name: 'AAA', discount: 0.10 },
  { id: 'BBB', name: 'BBB', discount: 0.12 },
  { id: 'CCC', name: 'CCC', discount: 0.15 },
  { id: 'DDD', name: 'DDD', discount: 0.20 },
  { id: 'EEE', name: 'EEE', discount: 0.05 },
];

export const productTypes = ['圓管', '圓鐵', '四角鐵'];
