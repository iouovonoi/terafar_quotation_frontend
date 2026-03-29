export interface SquareTube {
  modelNumber: string; // e.g., 'BJ00127012'
  buyInPrice: number; // 進價
  costPrice: number; // 進價成本
  weight: number; // 全支重量 (kg)
  length: number; // 長 (mm)
  width: number; // 寬 (mm)
  thickness: number; // 厚度 (mm)
}

export interface Material {
  id: string;
  type: string; // e.g., '圓管', '圓鐵', '四角鐵', '方管'
  name: string; // e.g., 'A1', 'B2'
  unitPrice: number; // 單位長度進價 (mock)
  modelNumber?: string; // 型號 (for 方管)
  buyInPrice?: number; // 進價
  costPrice?: number; // 進價成本
  weight?: number; // 全支重量
  length?: number; // 標準長度(mm)
  width?: number; // 寬(mm)
  thickness?: number; // 厚度(mm)
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
