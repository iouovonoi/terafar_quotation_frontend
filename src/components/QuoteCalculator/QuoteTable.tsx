import React, { useState, useCallback, useMemo } from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { Trash2, Inbox, Calculator } from 'lucide-react';
import type { QuoteItem } from '../../types';

const cuttingMethodLabels: Record<'full' | 'half' | 'actual', string> = {
  full: '全支',
  half: '半切',
  actual: '切實',
};

interface CalculatorModal {
  itemId: string;
  cutMultiplier: number;
  weightMultiplier: number;
  customerMultiplier: number;
}

export const QuoteTable: React.FC = () => {
  const { items, removeItem, updateItem } = useQuoteStore();
  const [calculatorModal, setCalculatorModal] = useState<CalculatorModal | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

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
        切法: cuttingMethodLabels[item.cuttingMethod],
        型號: item.materialId,
        客戶: item.customerId,
      };

      console.log('Sending payload to ML API:', payload);

      const response = await fetch('http://127.0.0.1:1234/api/prediction/predict?model=main_no_cutting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const unitPrice = data.predicted_price || data.unitPrice || 0;
      const amount = unitPrice * item.quantity;

      // 更新 item 的 unitPrice 和 amount
      if (updateItem) {
        updateItem(item.id, {
          unitPrice,
          amount,
        });
      }
    } catch (error) {
      console.error('Failed to fetch unit price:', error);
      // 可選：顯示錯誤提示給用戶
    } finally {
      setLoadingItemId(null);
    }
  }, [updateItem]);

  // 處理計算機面窗提交
  const handleCalculatorSubmit = (itemId: string, cutMultiplier: number, weightMultiplier: number, customerMultiplier: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // 計算人工價格 = 進價成本 × 切工乘數 × 重量乘數 × 客戶乘數 × 數量
    const manualAmount = item.costPrice * cutMultiplier * weightMultiplier * customerMultiplier * item.quantity;

    if (updateItem) {
      updateItem(itemId, {
        cutMultiplier,
        weightMultiplier,
        customerMultiplier,
        manualAmount,
        amount: manualAmount, // 用人工計算的金額覆蓋
      });
    }

    setCalculatorModal(null);
  };

  // 計算總金額
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [items]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
      <div className="px-8 py-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main dark:text-slate-200">需求明細</h3>
        <span className="text-sm font-medium px-3 py-1 bg-background-light dark:bg-slate-900 rounded text-text-muted">
          {items.length} 個項目
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-base">
          <thead className="bg-background-light/50 dark:bg-slate-900/50 text-text-muted uppercase text-xs tracking-wider font-bold">
            <tr>
              <th className="px-8 py-5">型號</th>
              <th className="px-8 py-5 text-center">規格</th>
              <th className="px-8 py-5 text-center">切法</th>
              <th className="px-8 py-5 text-center">裁切幾種</th>
              <th className="px-8 py-5 text-center">數量</th>
              <th className="px-8 py-5 text-right">進價成本</th>
              <th className="px-8 py-5 text-right">單價</th>
              <th className="px-8 py-5 text-right">金額</th>
              <th className="px-8 py-5 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-8 py-16 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={36} className="opacity-50" />
                    <p className="text-base">目前無資料，請從上方新增項目</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-background-light/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-bold text-text-main dark:text-slate-200">{item.materialId}</p>
                    <p className="text-sm text-text-muted">{item.customerId}</p>
                  </td>
                  <td className="px-8 py-6 text-center text-sm text-text-main dark:text-slate-300">
                    <div className="flex flex-col gap-0.5">
                      <span>{item.length}×{item.width}×{item.thickness}mm</span>
                      <span className="text-xs text-text-muted dark:text-slate-400">{item.weight}kg</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">
                    {cuttingMethodLabels[item.cuttingMethod]}
                  </td>
                  <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">
                    {item.numberOfCuttingLengths}
                  </td>
                  <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">
                    {item.quantity}
                  </td>
                  <td className="px-8 py-6 text-right text-text-main dark:text-slate-300">
                    ${item.costPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
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
                  <td className="px-8 py-6 text-right">
                    <input
                      type="number"
                      value={item.amount || ''}
                      readOnly
                      className="w-24 bg-background-light dark:bg-slate-700/50 border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-right font-semibold text-text-main dark:text-slate-200"
                    />
                    <button
                      onClick={() => setCalculatorModal({
                        itemId: item.id,
                        cutMultiplier: item.cutMultiplier || 1,
                        weightMultiplier: item.weightMultiplier || 1,
                        customerMultiplier: item.customerMultiplier || 1,
                      })}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary dark:hover:text-indigo-400 transition-colors p-1"
                      title="調整金額"
                    >
                      <Calculator size={18} />
                    </button>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-text-muted hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/20"
                      title="刪除"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 計算機調整面窗 */}
      {calculatorModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-border-light dark:border-border-dark p-6 w-full max-w-md">
            <h4 className="text-lg font-bold text-text-main dark:text-slate-200 mb-4">調整計算乘數</h4>
            <CalculatorModal
              initialValues={{
                cutMultiplier: calculatorModal.cutMultiplier,
                weightMultiplier: calculatorModal.weightMultiplier,
                customerMultiplier: calculatorModal.customerMultiplier,
              }}
              onSubmit={(cut, weight, customer) => {
                handleCalculatorSubmit(calculatorModal.itemId, cut, weight, customer);
              }}
              onCancel={() => setCalculatorModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 計算機模態框組件
interface CalculatorModalProps {
  initialValues: {
    cutMultiplier: number;
    weightMultiplier: number;
    customerMultiplier: number;
  };
  onSubmit: (cutMultiplier: number, weightMultiplier: number, customerMultiplier: number) => void;
  onCancel: () => void;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [cutMultiplier, setCutMultiplier] = useState(initialValues.cutMultiplier);
  const [weightMultiplier, setWeightMultiplier] = useState(initialValues.weightMultiplier);
  const [customerMultiplier, setCustomerMultiplier] = useState(initialValues.customerMultiplier);

  const handleSubmit = () => {
    onSubmit(cutMultiplier, weightMultiplier, customerMultiplier);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text-muted uppercase mb-2">切工乘數</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={cutMultiplier}
          onChange={(e) => setCutMultiplier(Number(e.target.value) || 1)}
          className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-4 py-2 text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-muted uppercase mb-2">重量乘數</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={weightMultiplier}
          onChange={(e) => setWeightMultiplier(Number(e.target.value) || 1)}
          className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-4 py-2 text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-muted uppercase mb-2">客戶乘數</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={customerMultiplier}
          onChange={(e) => setCustomerMultiplier(Number(e.target.value) || 1)}
          className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-4 py-2 text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="bg-blue-50 dark:bg-slate-700/50 rounded-lg p-3 border border-blue-200 dark:border-slate-600">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <span className="font-semibold">計算公式：</span> 進價 × {cutMultiplier} × {weightMultiplier} × {customerMultiplier} × 數量
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-border-light dark:border-border-dark rounded-lg text-text-main dark:text-slate-200 hover:bg-background-light dark:hover:bg-slate-700 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
        >
          確認
        </button>
      </div>
    </div>
  );
};
