import React, { useState, useRef, useMemo } from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { productTypes, mockMaterials } from '../../data/mockData';
import { PlusCircle, Plus, HelpCircle } from 'lucide-react';

export const AddItemForm: React.FC = () => {
  const { addItem } = useQuoteStore();
  const [productType, setProductType] = useState(productTypes[0]);
  const [materialId, setMaterialId] = useState('');
  const [cuttingMethod, setCuttingMethod] = useState<'full' | 'half' | 'actual'>('full');
  const [numberOfCuttingLengths, setNumberOfCuttingLengths] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [customerId, setCustomerId] = useState('');
  const [costPriceOverride, setCostPriceOverride] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

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

  // 計算截面積
  const crossSectionArea = selectedMaterial && selectedMaterial.width && selectedMaterial.thickness
    ? Math.round(selectedMaterial.width * selectedMaterial.thickness * 100) / 100
    : 0;

  const handleAdd = () => {
    // 驗證
    if (!selectedMaterial) {
      setError('請選擇材料');
      return;
    }
    if (!numberOfCuttingLengths || numberOfCuttingLengths <= 0) {
      setError('請輸入有效的裁切幾種長');
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

    const costPrice = costPriceOverride !== '' ? costPriceOverride : (selectedMaterial.costPrice || 0);

    addItem({
      productType,
      materialId,
      materialName: selectedMaterial.name,
      length: selectedMaterial.length || 0,
      width: selectedMaterial.width || 0,
      thickness: selectedMaterial.thickness || 0,
      weight: selectedMaterial.weight || 0,
      cuttingMethod,
      numberOfCuttingLengths: numberOfCuttingLengths as number,
      quantity: quantity as number,
      customerId,
      costPrice: costPrice as number,
      crossSectionArea,
    });

    // Reset form
    setNumberOfCuttingLengths('');
    setQuantity('');
    setCostPriceOverride('');
    setCustomerId('');
    setError(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold flex items-center gap-2 text-text-main dark:text-slate-200">
          <PlusCircle className="text-primary dark:text-indigo-400" size={22} />
          輸入區
        </h3>
        {error && <span className="text-sm text-red-500 font-medium">{error}</span>}
      </div>

      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-5 mb-8">
        <div>
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">製品種類</label>
          <select
            value={productType}
            onChange={(e) => handleProductTypeChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          >
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">材料ID</label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          >
            <option value="">請選擇...</option>
            {filteredMaterials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">切法</label>
          <select
            value={cuttingMethod}
            onChange={(e) => setCuttingMethod(e.target.value as 'full' | 'half' | 'actual')}
            className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          >
            <option value="full">全支</option>
            <option value="half">半切</option>
            <option value="actual">切實</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5 flex items-center gap-1">
            裁切幾種長
            <button
              type="button"
              onMouseEnter={() => setShowHelpTooltip(true)}
              onMouseLeave={() => setShowHelpTooltip(false)}
              className="text-text-muted hover:text-primary dark:hover:text-indigo-400"
              title="輸入共有幾種不同的裁切長度"
            >
              <HelpCircle size={16} />
            </button>
          </label>
          <input
            type="number"
            value={numberOfCuttingLengths}
            onChange={(e) => setNumberOfCuttingLengths(Number(e.target.value) || '')}
            placeholder="例如: 3"
            className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          />
          {showHelpTooltip && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap z-10">
              輸入共有幾種不同的裁切長度
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">數量</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || '')}
            placeholder="例如: 5"
            className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">客戶編號</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="例如: 1C16164"
            className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-base h-12 focus:border-primary focus:ring-primary dark:text-slate-200"
          />
        </div>
      </div>

      {/* Material Info and Cost Price Row */}
      {selectedMaterial && (
        <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-200 dark:border-slate-600 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5 text-sm">
            <div>
              <p className="text-text-muted dark:text-slate-400 text-xs font-semibold uppercase">長(mm)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.length || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-xs font-semibold uppercase">寬(mm)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.width || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-xs font-semibold uppercase">厚度(mm)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.thickness || '-'}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-xs font-semibold uppercase">截面積(mm²)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{crossSectionArea}</p>
            </div>
            <div>
              <p className="text-text-muted dark:text-slate-400 text-xs font-semibold uppercase">重量(kg)</p>
              <p className="font-semibold text-text-main dark:text-slate-200">{selectedMaterial.weight || '-'}</p>
            </div>
            <div>
              <label className="text-text-muted dark:text-slate-400 text-xs font-semibold uppercase block mb-1">進價成本</label>
              <input
                type="number"
                value={costPriceOverride !== '' ? costPriceOverride : selectedMaterial.costPrice || ''}
                onChange={(e) => setCostPriceOverride(Number(e.target.value) || '')}
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-base h-10 focus:border-primary focus:ring-primary dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          ref={addButtonRef}
          onClick={handleAdd}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-8 h-12 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={22} />
          新增
        </button>
      </div>
    </div>
  );
};
