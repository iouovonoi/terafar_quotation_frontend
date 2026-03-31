import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { Trash2, Inbox, Calculator, X, RotateCcw, Plus, Minus } from 'lucide-react';
import type { QuoteItem, ExtraCharge } from '../../types';

const cuttingMethodLabels: Record<'full' | 'half' | 'actual', string> = {
  full: '全支',
  half: '半切',
  actual: '切實',
};

interface SlidePanel {
  itemId: string;
  cutMultiplier: number;
  weightMultiplier: number;
  customerMultiplier: number;
}

export const QuoteTable: React.FC = () => {
  const { items, removeItem, updateItem } = useQuoteStore();
  const [slidePanel, setSlidePanel] = useState<SlidePanel | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  // 開啟面板（帶動畫）
  const openPanel = (item: QuoteItem) => {
    setSlidePanel({
      itemId: item.id,
      cutMultiplier: item.cutMultiplier || 1,
      weightMultiplier: item.weightMultiplier || 1,
      customerMultiplier: item.customerMultiplier || 1,
    });
    // 延遲觸發動畫
    requestAnimationFrame(() => setIsPanelVisible(true));
  };

  // 關閉面板（帶動畫）
  const closePanel = () => {
    setIsPanelVisible(false);
    setTimeout(() => setSlidePanel(null), 300);
  };

  // 調用 API 獲取單價預測
  const fetchUnitPrice = useCallback(async (item: QuoteItem) => {
    setLoadingItemId(item.id);
    try {
      const payload = {
        進價成本: item.costPrice,
        長: item.length,
        寬: item.width,
        厚度: item.thickness,
        數量: item.quantity,
        截面積: item.crossSectionArea,
        裁切幾種長度: Math.floor(item.numberOfCuttingLengths),
        切法: cuttingMethodLabels[item.cuttingMethod],
        型號: item.materialId,
        客戶: item.customerId,
      };

      console.log('Sending payload to ML API:', payload);

      const response = await fetch('http://127.0.0.1:1234/api/prediction/predict?model=main_no_cutting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const unitPrice = data.predicted_price || data.unitPrice || 0;
      const amount = unitPrice * item.quantity;

      updateItem(item.id, { unitPrice, amount });

      // 自動滑出面板讓使用者調整
      openPanel({ ...item, unitPrice, amount });
    } catch (error) {
      console.error('Failed to fetch unit price:', error);
    } finally {
      setLoadingItemId(null);
    }
  }, [updateItem]);

  // 處理面板提交（含額外加減項）
  const handlePanelSubmit = (itemId: string, cutMultiplier: number, weightMultiplier: number, customerMultiplier: number, extraCharges: ExtraCharge[]) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const baseAmount = item.costPrice * cutMultiplier * weightMultiplier * customerMultiplier * item.quantity;
    const extraTotal = extraCharges.reduce((sum, ec) => sum + ec.amount, 0);
    const manualAmount = baseAmount + extraTotal;

    updateItem(itemId, {
      cutMultiplier,
      weightMultiplier,
      customerMultiplier,
      extraCharges,
      manualAmount,
      amount: manualAmount,
    });

    closePanel();
  };

  // 還原為原始金額（單價 × 數量）
  const handleResetAmount = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.unitPrice) return;

    const originalAmount = item.unitPrice * item.quantity;

    updateItem(itemId, {
      cutMultiplier: undefined,
      weightMultiplier: undefined,
      customerMultiplier: undefined,
      extraCharges: undefined,
      manualAmount: undefined,
      amount: originalAmount,
    });

    closePanel();
  };

  // 取得面板對應的 item
  const panelItem = slidePanel ? items.find(i => i.id === slidePanel.itemId) : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main dark:text-slate-200">需求明細</h3>
        <span className="text-sm font-medium px-3 py-1 bg-background-light dark:bg-slate-900 rounded text-text-muted">
          {items.length} 個項目
        </span>
      </div>

      <div>
        <table className="w-full text-left text-base">
          <thead className="bg-background-light/50 dark:bg-slate-900/50 text-text-muted uppercase text-[11px] tracking-wider font-bold">
            <tr>
              <th className="px-4 py-3">型號</th>
              <th className="px-3 py-3 text-center">規格</th>
              <th className="px-3 py-3 text-center">切法</th>
              <th className="px-3 py-3 text-center">裁切種數</th>
              <th className="px-3 py-3 text-center">數量</th>
              <th className="px-3 py-3 text-right">進價</th>
              <th className="px-3 py-3 text-right">單價</th>
              <th className="px-3 py-3 text-right">金額</th>
              <th className="px-3 py-3">備註</th>
              <th className="px-3 py-3 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={36} className="opacity-50" />
                    <p className="text-base">目前無資料，請從上方新增項目</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isAdjusted = item.manualAmount !== undefined && item.manualAmount !== null;
                return (
                  <tr key={item.id} className="hover:bg-background-light/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-text-main dark:text-slate-200">{item.materialId}</p>
                      <p className="text-sm text-text-muted">{item.customerId}</p>
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-text-main dark:text-slate-300">
                      <span>{item.length}×{item.width}×{item.thickness}</span>
                      <span className="text-text-muted dark:text-slate-400 ml-0.5">{item.weight}kg</span>
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-text-main dark:text-slate-300">
                      {cuttingMethodLabels[item.cuttingMethod]}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-text-main dark:text-slate-300">
                      {item.numberOfCuttingLengths}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-text-main dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-text-main dark:text-slate-300">
                      ${item.costPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {loadingItemId === item.id ? (
                        <span className="text-text-muted text-sm">加載中...</span>
                      ) : item.unitPrice ? (
                        <span className="font-semibold text-text-main dark:text-slate-200">
                          ${item.unitPrice.toFixed(2)}
                        </span>
                      ) : (
                        <button
                          onClick={() => fetchUnitPrice(item)}
                          className="text-primary hover:text-primary-dark dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-semibold"
                        >
                          計算單價
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => openPanel(item)}
                        className="inline-flex items-center gap-1 group cursor-pointer"
                        title="點擊調整金額"
                      >
                        <span className={`font-semibold ${isAdjusted ? 'text-amber-600 dark:text-amber-400' : 'text-text-main dark:text-slate-200'}`}>
                          {item.amount ? `$${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </span>
                        <Calculator size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      {isAdjusted && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">已調整</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => updateItem(item.id, { note: e.target.value })}
                        placeholder="備註"
                        className="w-full min-w-[80px] bg-transparent border-0 border-b border-transparent hover:border-border-light focus:border-primary dark:hover:border-border-dark dark:focus:border-indigo-400 text-sm text-text-main dark:text-slate-300 px-0 py-1 focus:ring-0 placeholder:text-text-muted/40 transition-colors"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-text-muted hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/20"
                        title="刪除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 浮動小視窗 - 輕量遮罩 */}
      {slidePanel && (
        <div
          className={`fixed inset-0 bg-black/10 dark:bg-black/20 z-40 transition-opacity duration-300 ${isPanelVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closePanel}
        />
      )}

      {/* 浮動小視窗 */}
      {slidePanel && (
        <div
          className={`fixed top-1/2 right-6 -translate-y-1/2 w-[380px] max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-border-light dark:border-border-dark z-50 transform transition-all duration-300 ease-out overflow-hidden ${isPanelVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}
        >
          <SlideCalculatorPanel
            item={panelItem}
            initialValues={{
              cutMultiplier: slidePanel.cutMultiplier,
              weightMultiplier: slidePanel.weightMultiplier,
              customerMultiplier: slidePanel.customerMultiplier,
            }}
            onSubmit={(cut, weight, customer, extras) => handlePanelSubmit(slidePanel.itemId, cut, weight, customer, extras)}
            onReset={() => handleResetAmount(slidePanel.itemId)}
            onClose={closePanel}
          />
        </div>
      )}
    </div>
  );
};

// ===== 浮動計算小視窗組件 =====
interface SlideCalculatorPanelProps {
  item: QuoteItem | null | undefined;
  initialValues: {
    cutMultiplier: number;
    weightMultiplier: number;
    customerMultiplier: number;
  };
  onSubmit: (cutMultiplier: number, weightMultiplier: number, customerMultiplier: number, extraCharges: ExtraCharge[]) => void;
  onReset: () => void;
  onClose: () => void;
}

const SlideCalculatorPanel: React.FC<SlideCalculatorPanelProps> = ({ item, initialValues, onSubmit, onReset, onClose }) => {
  const [cutMultiplier, setCutMultiplier] = useState(initialValues.cutMultiplier);
  const [weightMultiplier, setWeightMultiplier] = useState(initialValues.weightMultiplier);
  const [customerMultiplier, setCustomerMultiplier] = useState(initialValues.customerMultiplier);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>(item?.extraCharges || []);

  // 所有輸入框的 ref，用於 Enter 跳轉
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 初始值變化時同步
  useEffect(() => {
    setCutMultiplier(initialValues.cutMultiplier);
    setWeightMultiplier(initialValues.weightMultiplier);
    setCustomerMultiplier(initialValues.customerMultiplier);
    setExtraCharges(item?.extraCharges || []);
  }, [initialValues.cutMultiplier, initialValues.weightMultiplier, initialValues.customerMultiplier, item?.extraCharges]);

  // Enter 鍵跳到下一個輸入框
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextInput = inputRefs.current[currentIndex + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  // 設定 ref（固定欄位 0-2，額外項目從 3 開始，每項佔 2 個 ref）
  const setRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  // 新增額外項目
  const addExtraCharge = () => {
    setExtraCharges(prev => [...prev, {
      id: crypto.randomUUID(),
      name: '',
      amount: 0,
    }]);
  };

  // 更新額外項目
  const updateExtraCharge = (id: string, field: 'name' | 'amount', value: string | number) => {
    setExtraCharges(prev => prev.map(ec =>
      ec.id === id ? { ...ec, [field]: value } : ec
    ));
  };

  // 移除額外項目
  const removeExtraCharge = (id: string) => {
    setExtraCharges(prev => prev.filter(ec => ec.id !== id));
  };

  if (!item) return null;

  const baseAmount = item.costPrice * cutMultiplier * weightMultiplier * customerMultiplier * item.quantity;
  const extraTotal = extraCharges.reduce((sum, ec) => sum + (ec.amount || 0), 0);
  const previewAmount = baseAmount + extraTotal;
  const originalAmount = item.unitPrice ? item.unitPrice * item.quantity : 0;
  const isAdjusted = item.manualAmount !== undefined && item.manualAmount !== null;

  return (
    <div className="flex flex-col max-h-[85vh]">
      {/* 標題 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-primary dark:text-indigo-400" />
          <h4 className="text-lg font-bold text-text-main dark:text-slate-200">調整金額</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* 項目資訊 */}
      <div className="px-5 py-3 bg-background-light/50 dark:bg-slate-900/30 border-b border-border-light dark:border-border-dark shrink-0">
        <p className="font-bold text-text-main dark:text-slate-200">{item.materialId}</p>
        <p className="text-sm text-text-muted mt-0.5">
          {item.length}×{item.width}×{item.thickness}mm ・ {item.quantity} 個 ・ 客戶 {item.customerId}
        </p>
      </div>

      {/* 內容區 */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* 乘數輸入 */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">乘數調整</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">切工</label>
              <input
                ref={setRef(0)}
                type="number"
                step="0.1"
                min="0"
                value={cutMultiplier}
                onChange={(e) => setCutMultiplier(Number(e.target.value) || 1)}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">重量</label>
              <input
                ref={setRef(1)}
                type="number"
                step="0.1"
                min="0"
                value={weightMultiplier}
                onChange={(e) => setWeightMultiplier(Number(e.target.value) || 1)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">客戶</label>
              <input
                ref={setRef(2)}
                type="number"
                step="0.1"
                min="0"
                value={customerMultiplier}
                onChange={(e) => setCustomerMultiplier(Number(e.target.value) || 1)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {/* 公式 */}
          <p className="text-xs text-text-muted bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2">
            ${item.costPrice.toFixed(2)} × {cutMultiplier} × {weightMultiplier} × {customerMultiplier} × {item.quantity} = <span className="font-semibold text-text-main dark:text-slate-200">${baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>

        {/* 額外加減項目 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">額外加減項</p>
            <button
              onClick={addExtraCharge}
              className="text-xs text-primary hover:text-primary-dark dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Plus size={14} />
              新增
            </button>
          </div>

          {extraCharges.length === 0 ? (
            <p className="text-xs text-text-muted/60 text-center py-2">尚無額外項目，可新增運費、折扣等</p>
          ) : (
            <div className="space-y-2">
              {extraCharges.map((ec, idx) => {
                const nameRefIdx = 3 + idx * 2;
                const amountRefIdx = 3 + idx * 2 + 1;
                return (
                  <div key={ec.id} className="flex items-center gap-2">
                    <input
                      ref={setRef(nameRefIdx)}
                      type="text"
                      value={ec.name}
                      onChange={(e) => updateExtraCharge(ec.id, 'name', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, nameRefIdx)}
                      placeholder="項目名稱"
                      className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
                    />
                    <input
                      ref={setRef(amountRefIdx)}
                      type="number"
                      value={ec.amount || ''}
                      onChange={(e) => updateExtraCharge(ec.id, 'amount', Number(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, amountRefIdx)}
                      placeholder="±金額"
                      className="w-24 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm text-right text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
                    />
                    <button
                      onClick={() => removeExtraCharge(ec.id)}
                      className="shrink-0 p-1.5 text-text-muted hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-500/20"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {extraTotal !== 0 && (
            <p className="text-xs text-text-muted bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2">
              額外合計：<span className={`font-semibold ${extraTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {extraTotal >= 0 ? '+' : ''}${extraTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </p>
          )}
        </div>

        {/* 預覽金額 */}
        <div className="bg-primary-light dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
          <p className="text-xs font-semibold text-text-muted mb-1">調整後金額</p>
          <p className="text-2xl font-black text-primary dark:text-indigo-400">
            ${previewAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {originalAmount > 0 && (
            <p className="text-xs text-text-muted mt-1.5">
              原始金額：${originalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="px-5 py-4 border-t border-border-light dark:border-border-dark space-y-2.5 shrink-0">
        {isAdjusted && originalAmount > 0 && (
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-amber-300 dark:border-amber-600 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-sm font-semibold"
          >
            <RotateCcw size={14} />
            還原原始金額
          </button>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border-light dark:border-border-dark rounded-lg text-text-main dark:text-slate-200 hover:bg-background-light dark:hover:bg-slate-700 transition-colors font-medium text-sm"
          >
            取消
          </button>
          <button
            onClick={() => onSubmit(cutMultiplier, weightMultiplier, customerMultiplier, extraCharges)}
            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors text-sm"
          >
            確認調整
          </button>
        </div>
      </div>
    </div>
  );
};
