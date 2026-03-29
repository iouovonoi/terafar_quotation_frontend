import React, { useState, useRef, useMemo } from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { productTypes, mockMaterials } from '../../data/mockData';
import { PlusCircle, Plus, Info } from 'lucide-react';

export const AddItemForm: React.FC = () => {
  const { addItem } = useQuoteStore();
  const [productType, setProductType] = useState(productTypes[0]);
  const [materialId, setMaterialId] = useState('');
  const [length, setLength] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // 根據產品類型過濾材料
  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter(m => m.type === productType);
  }, [productType]);

  // 當產品類型改變時，重置材料ID
  const handleProductTypeChange = (newType: string) => {
    setProductType(newType);
    const firstMaterial = mockMaterials.find(m => m.type === newType);
    setMaterialId(firstMaterial?.id || '');
  };

  // 取得當前選擇的材料
  const selectedMaterial = mockMaterials.find(m => m.id === materialId);

  // 計算進價（根據材料類型）
  const calculateCostPrice = () => {
    if (!selectedMaterial || !length || !quantity) return 0;

    if (productType === '方管' && selectedMaterial.costPrice) {
      // 對於方管，使用進價成本
      return selectedMaterial.costPrice * quantity;
    } else {
      // 對於其他材料，使用單位價格 * 長度 * 數量
      return selectedMaterial.unitPrice * length * quantity;
    }
  };

  const handleAdd = () => {
    if (!length || length <= 0) {
      setError('請輸入有效的裁切長度');
      lengthInputRef.current?.focus();
      return;
    }
    if (!quantity || quantity <= 0) {
      setError('請輸入有效的數量');
      quantityInputRef.current?.focus();
      return;
    }
    if (!selectedMaterial) {
      setError('請選擇材料');
      return;
    }

    const costPrice = calculateCostPrice();

    addItem({
      productType,
      materialId,
      length,
      quantity,
      costPrice,
    });

    // Reset form and focus back to length for quick entry
    setLength('');
    setQuantity('');
    setError(null);
    lengthInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>, nextRef: React.RefObject<HTMLElement | null>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef.current) {
        nextRef.current.focus();
      } else {
        handleAdd();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-text-main dark:text-slate-200">
          <PlusCircle className="text-primary dark:text-indigo-400" size={22} />
          新增至表格
        </h3>
        {error && <span className="text-sm text-red-500 font-medium">{error}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">製品種類</label>
          <select
            value={productType}
            onChange={(e) => handleProductTypeChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          >
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">
            {productType === '方管' ? '型號' : '材料 ID'}
          </label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          >
            <option value="">請選擇...</option>
            {filteredMaterials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">裁切長度 (mm)</label>
          <input
            ref={lengthInputRef}
            type="number"
            value={length}
            onChange={(e) => setLength(Number(e.target.value) || '')}
            onKeyDown={(e) => handleKeyDown(e, quantityInputRef as React.RefObject<HTMLElement | null>)}
            placeholder="例如: 12"
            className={`w-full bg-white dark:bg-slate-900 border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200 ${error && !length ? 'border-red-500' : ''}`}
          />
        </div>

        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">數量</label>
          <input
            ref={quantityInputRef}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || '')}
            onKeyDown={(e) => handleKeyDown(e, addButtonRef as React.RefObject<HTMLElement | null>)}
            placeholder="例如: 1"
            className={`w-full bg-white dark:bg-slate-900 border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200 ${error && !quantity ? 'border-red-500' : ''}`}
          />
        </div>

        <div>
          <button
            ref={addButtonRef}
            onClick={handleAdd}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-12 text-base rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={22} />
            新增
          </button>
        </div>
      </div>

      {/* 材料詳細資訊顯示 */}
      {selectedMaterial && productType === '方管' && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-200 dark:border-slate-600">
          <div className="flex gap-2 mb-2">
            <Info size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">材料資訊</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-text-muted dark:text-slate-400">進價</p>
              <p className="font-semibold text-text-main dark:text-slate-200">$ {selectedMaterial.buyInPrice}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400">進價成本</p>
              <p className="font-semibold text-text-main dark:text-slate-200">$ {selectedMaterial.costPrice?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400">尺寸 (L×W×厚)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">
                {selectedMaterial.length}×{selectedMaterial.width}×{selectedMaterial.thickness} mm
              </p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400">重量</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.weight} kg</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
