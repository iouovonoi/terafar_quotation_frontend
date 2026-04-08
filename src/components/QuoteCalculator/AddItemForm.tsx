import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { productTypes, mockMaterials, mockCustomers } from '../../data/mockData';
import { SearchCombobox } from '../SearchCombobox';
import type { SearchComboboxRef } from '../SearchCombobox';
import { PlusCircle, Plus, HelpCircle } from 'lucide-react';

export const AddItemForm: React.FC = () => {
  const { addItem } = useQuoteStore();
  const [productType, setProductType] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [cuttingMethod, setCuttingMethod] = useState<'full' | 'half' | 'actual'>('full');
  const [numberOfCuttingLengths, setNumberOfCuttingLengths] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [customerId, setCustomerId] = useState('');
  const [buyInPrice, setBuyInPrice] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Enter 跳轉用的 refs
  // 順序: 0=製品種類, 1=材料ID, 2=切法, 3=裁切幾種長度, 4=數量, 5=客戶編號, 6=備註, 7=進價
  const fieldRefs = useRef<(HTMLSelectElement | HTMLInputElement | SearchComboboxRef | null)[]>([]);
  const setFieldRef = (index: number) => (el: HTMLSelectElement | HTMLInputElement | null) => {
    fieldRefs.current[index] = el;
  };

  const focusNext = (currentIndex: number) => {
    // 如果是最後一個欄位（進價），觸發新增
    const maxIndex = selectedMaterial ? 7 : 6;
    if (currentIndex >= maxIndex) {
      addButtonRef.current?.focus();
      return;
    }
    const next = fieldRefs.current[currentIndex + 1];
    if (next && 'focus' in next) {
      next.focus();
    }
  };

  const handleEnterKey = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNext(currentIndex);
    }
  };

  // 根據產品類型過濾材料
  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter(m => m.type === productType);
  }, [productType]);

  // 當產品類型改變時，重置材料ID
  const handleProductTypeChange = (newType: string) => {
    setProductType(newType);
    setMaterialId('');
  };

  // 取得當前選擇的材料
  const selectedMaterial = mockMaterials.find(m => m.id === materialId);

  // 當選擇材料時，自動填入進價和計算進價成本
  useEffect(() => {
    if (selectedMaterial && selectedMaterial.buyInPrice) {
      setBuyInPrice(selectedMaterial.buyInPrice);
    } else {
      setBuyInPrice('');
    }
  }, [selectedMaterial]);

  // 計算截面積
  const crossSectionArea = selectedMaterial && selectedMaterial.width && selectedMaterial.thickness
    ? Math.round(selectedMaterial.width * selectedMaterial.thickness * 100) / 100
    : 0;

  // 計算進價成本 = 進價 × 全支重量
  const calcCostPrice = (price: number, weight: number) => Math.round(price * weight * 100) / 100;

  const handleAdd = () => {
    // 驗證
    if (!productType) {
      setError('請選擇製品種類');
      return;
    }
    if (!selectedMaterial) {
      setError('請選擇材料');
      return;
    }
    if (numberOfCuttingLengths === '') {
      setError('請輸入裁切幾種長度');
      return;
    }
    if (!quantity || quantity <= 0) {
      setError('請輸入有效的數量');
      return;
    }
    if (!customerId.trim()) {
      setError('請輸入客戶編號');
      return;
    }
    if (buyInPrice === '') {
      setError('進價未填入');
      return;
    }

    // 計算進價成本 = 進價 × 全支重量
    const weight = selectedMaterial.weight || 0;
    const calculatedCostPrice = calcCostPrice(buyInPrice as number, weight);

    addItem({
      productType,
      materialId,
      materialName: selectedMaterial.name,
      length: selectedMaterial.length || 0,
      width: selectedMaterial.width || 0,
      thickness: selectedMaterial.thickness || 0,
      weight,
      cuttingMethod,
      numberOfCuttingLengths: numberOfCuttingLengths as number,
      quantity: quantity as number,
      customerId,
      buyInPrice: buyInPrice as number,
      costPrice: calculatedCostPrice,
      crossSectionArea,
      note: note.trim() || undefined,
    });

    // Reset form
    setProductType('');
    setMaterialId('');
    setNumberOfCuttingLengths('');
    setQuantity('');
    setBuyInPrice('');
    setCustomerId('');
    setNote('');
    setError(null);
  };

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-[15px] h-10 px-3 focus:border-primary focus:ring-primary dark:text-slate-200";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold flex items-center gap-2 text-text-main dark:text-slate-200">
          <PlusCircle className="text-primary dark:text-indigo-400" size={22} />
          輸入區
        </h3>
        {error && <span className="text-[15px] text-red-500 font-medium">{error}</span>}
      </div>

      {/* First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-[15px] font-semibold text-text-muted mb-1.5">製品種類</label>
          <select
            ref={setFieldRef(0)}
            value={productType}
            onChange={(e) => handleProductTypeChange(e.target.value)}
            onKeyDown={(e) => handleEnterKey(e, 0)}
            className={inputClass}
          >
            <option value="">請選擇...</option>
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-text-muted mb-1.5">材料ID</label>
          <SearchCombobox
            ref={(el) => { fieldRefs.current[1] = el; }}
            options={filteredMaterials.map(m => ({ id: m.id, name: m.name }))}
            value={materialId}
            onChange={setMaterialId}
            placeholder="搜尋材料ID..."
            inputClass="w-full"
            onKeyDown={(e) => handleEnterKey(e, 1)}
          />
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-text-muted mb-1.5">切法</label>
          <select
            ref={setFieldRef(2)}
            value={cuttingMethod}
            onChange={(e) => setCuttingMethod(e.target.value as 'full' | 'half' | 'actual')}
            onKeyDown={(e) => handleEnterKey(e, 2)}
            className={inputClass}
          >
            <option value="full">全支</option>
            <option value="half">半切</option>
            <option value="actual">切實</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-[15px] font-semibold text-text-muted mb-1.5 flex items-center gap-1">
            裁切幾種長度
            <button
              type="button"
              onMouseEnter={() => setShowHelpTooltip(true)}
              onMouseLeave={() => setShowHelpTooltip(false)}
              className="text-text-muted hover:text-primary dark:hover:text-indigo-400"
              title="輸入共有幾種不同的裁切長度"
            >
              <HelpCircle size={14} />
            </button>
          </label>
          <input
            ref={setFieldRef(3)}
            type="number"
            value={numberOfCuttingLengths}
            onChange={(e) => setNumberOfCuttingLengths(e.target.value === '' ? '' : Number(e.target.value))}
            onKeyDown={(e) => handleEnterKey(e, 3)}
            placeholder="例如: 3"
            className={inputClass}
          />
          {showHelpTooltip && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-900 dark:bg-slate-700 text-white text-[15px] rounded-lg whitespace-nowrap z-10">
              輸入共有幾種不同的裁切長度
            </div>
          )}
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-text-muted mb-1.5">數量</label>
          <input
            ref={setFieldRef(4)}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            onKeyDown={(e) => handleEnterKey(e, 4)}
            placeholder="例如: 5"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-text-muted mb-1.5">選擇客戶</label>
          <SearchCombobox
            ref={(el) => { fieldRefs.current[5] = el; }}
            options={mockCustomers.map(c => ({ id: c.id, name: c.name }))}
            value={customerId}
            onChange={setCustomerId}
            placeholder="搜尋客戶..."
            inputClass="w-full"
            onKeyDown={(e) => handleEnterKey(e, 5)}
          />
        </div>

        <div>
          <label className="block text-[15px] font-semibold text-text-muted mb-1.5">備註</label>
          <input
            ref={setFieldRef(6)}
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => handleEnterKey(e, 6)}
            placeholder="選填"
            className={inputClass}
          />
        </div>
      </div>

      {/* Material Info and Cost Price Row */}
      {selectedMaterial && (
        <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-200 dark:border-slate-600 p-4 mb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 text-[15px]">
            <div>
              <p className="text-text-muted dark:text-slate-400 text-[15px] font-semibold">長(mm)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.length || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-[15px] font-semibold">寬(mm)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.width || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-[15px] font-semibold">厚度(mm)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.thickness || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-[15px] font-semibold">截面積(mm²)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{crossSectionArea}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-[15px] font-semibold">重量(kg)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.weight || '-'}</p>
            </div>
            <div>
              <label className="text-text-muted dark:text-slate-400 text-[15px] font-semibold block mb-1">進價/KG</label>
              <input
                ref={setFieldRef(7)}
                type="number"
                step="0.01"
                value={buyInPrice}
                onChange={(e) => setBuyInPrice(e.target.value === '' ? '' : Number(e.target.value))}
                onKeyDown={(e) => handleEnterKey(e, 7)}
                placeholder="例如: 23.5"
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-[15px] h-9 px-3 focus:border-primary focus:ring-primary dark:text-slate-200"
              />
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-[15px] font-semibold block mb-1">進價成本</p>
              <p className="font-semibold text-text-main dark:text-slate-200 h-9 flex items-center px-3">
                {buyInPrice !== '' && buyInPrice !== 0
                  ? `$${calcCostPrice(buyInPrice as number, selectedMaterial.weight || 0).toFixed(2)}`
                  : '-'}
              </p>
            </div>
          </div>
          {buyInPrice !== '' && buyInPrice !== 0 && selectedMaterial.weight && (
            <p className="text-[15px] text-text-muted dark:text-slate-400 mt-2">
              計算方式: {buyInPrice}/KG × {selectedMaterial.weight}KG = ${calcCostPrice(buyInPrice as number, selectedMaterial.weight).toFixed(2)}/支
            </p>
          )}
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          ref={addButtonRef}
          onClick={handleAdd}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 h-10 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm text-[15px]"
        >
          <Plus size={18} />
          新增
        </button>
      </div>
    </div>
  );
};
