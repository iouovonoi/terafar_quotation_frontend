export interface Material {
  id: string;
  type: string; // e.g., '圓管', '圓鐵', '四角鐵'
  name: string; // e.g., 'A1', 'B2'
  unitPrice: number; // 單位長度進價 (mock)
}

export interface Customer {
  id: string;
  name: string;
  discount: number;
}

export interface QuoteItem {
  id: string;
  productType: string;
  materialId: string;
  length: number;
  quantity: number;
  costPrice: number;
}

export interface CalcSettings {
  mode: 'manual' | 'system';
  cutMultiplier: number;
  weightMultiplier: number;
  customerId: string;
  discount: number;
}
