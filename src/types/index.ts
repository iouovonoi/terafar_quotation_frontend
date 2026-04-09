/*
 * @Author: ChiaEnKang
 * @Date: 2026-04-08 10:19:48
 * @LastEditors: ChiaEnKang
 * @LastEditTime: 2026-04-08 11:03:32
 */
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
}

export type PageType = 'quote' | 'material' | 'customer' | 'history';

export interface ExtraCharge {
  id: string;
  name: string;   // e.g. '運費', '折扣', '加工費'
  amount: number;  // 正數=加項, 負數=減項
}

export interface QuoteItem {
  id: string;
  productType: string;
  materialId: string;
  materialName: string;
  length: number; // 標準長度(mm)
  width: number; // 寬(mm)
  thickness: number; // 厚度(mm)
  weight: number; // 重量(kg)
  cuttingMethod: 'full' | 'half' | 'actual'; // 全支/半切/切實
  numberOfCuttingLengths: number; // 裁切幾種長
  quantity: number;
  customerId: string; // 客戶編號
  customerName: string; // 客戶名稱
  buyInPrice: number; // 進價 (e.g., 23.5/KG)
  costPrice: number; // 進價成本 = 進價 × 全支重量 (自動計算)
  crossSectionArea: number; // 截面積 = 寬 × 厚度
  unitPrice?: number; // ML模型預測的單價
  amount?: number; // 金額 = 單價 × 數量（可手動調整）
  note?: string; // 備註
  extraCharges?: ExtraCharge[]; // 額外加減項目
  // 手動調整乘數
  cutMultiplier?: number; // 切工乘數 (default: 1)
  weightMultiplier?: number; // 重量乘數 (default: 1)
  customerMultiplier?: number; // 客戶乘數 (default: 1)
  manualAmount?: number; // 人工計算金額
}
