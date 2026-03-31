import type { Material, Customer, SquareTube } from '../types';
import squaretubesData from './squaretubes.json';

// 方管數據映射到 Material 格式
const squareTubeMaterials: Material[] = squaretubesData.map((tube: SquareTube) => ({
  id: tube.modelNumber,
  type: '方管',
  name: tube.modelNumber,
  unitPrice: tube.buyInPrice || 0,
  modelNumber: tube.modelNumber,
  buyInPrice: tube.buyInPrice || 0,
  costPrice: tube.costPrice,
  weight: tube.weight,
  length: tube.length,
  width: tube.width,
  thickness: tube.thickness,
}));

export const mockMaterials: Material[] = [
  { 
    id: 'A1', 
    type: '圓管', 
    name: 'A1', 
    unitPrice: 2.0,
    costPrice: 50,
    length: 6000,
    width: 50,
    thickness: 2,
    weight: 4.5
  },
  { 
    id: 'B2', 
    type: '圓管', 
    name: 'B2', 
    unitPrice: 1.466,
    costPrice: 60,
    length: 6000,
    width: 60,
    thickness: 2.5,
    weight: 6.2
  },
  { 
    id: 'C3', 
    type: '圓管', 
    name: 'C3', 
    unitPrice: 0.939,
    costPrice: 55,
    length: 6000,
    width: 45,
    thickness: 2,
    weight: 4.0
  },
  { 
    id: 'D4', 
    type: '圓鐵', 
    name: 'D4', 
    unitPrice: 3.5,
    costPrice: 45,
    length: 6000,
    width: 30,
    thickness: 30,
    weight: 3.8
  },
  { 
    id: 'E5', 
    type: '四角鐵', 
    name: 'E5', 
    unitPrice: 4.2,
    costPrice: 55,
    length: 6000,
    width: 40,
    thickness: 40,
    weight: 5.2
  },
  ...squareTubeMaterials,
];

export const mockCustomers: Customer[] = [
  { id: 'AAA', name: 'AAA', discount: 0.10 },
  { id: 'BBB', name: 'BBB', discount: 0.12 },
  { id: 'CCC', name: 'CCC', discount: 0.15 },
  { id: 'DDD', name: 'DDD', discount: 0.20 },
  { id: 'EEE', name: 'EEE', discount: 0.05 },
];

export const productTypes = ['圓管', '圓鐵', '四角鐵', '方管'];
