import React, { useState, useRef } from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { productTypes, mockMaterials } from '../../data/mockData';
import { PlusCircle, Plus } from 'lucide-react';

export const AddItemForm: React.FC = () => {
  const { addItem } = useQuoteStore();
  const [productType, setProductType] = useState(productTypes[0]);
  const [materialId, setMaterialId] = useState(mockMaterials[0].id);
  const [length, setLength] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

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

    const material = mockMaterials.find(m => m.id === materialId);
    if (!material) return;

    // Mock calculation for cost price
    const costPrice = material.unitPrice * length * quantity;

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
            onChange={(e) => setProductType(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          >
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">材料 ID</label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          >
            {mockMaterials.filter(m => m.type === productType).map(m => (
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
    </div>
  );
};
