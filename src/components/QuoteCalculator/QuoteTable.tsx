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
  const [newlyAddedItemId, setNewlyAddedItemId] = useState<string | null>(null);
  const previousItemsLengthRef = useRef(0);

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
        '長(mm)': item.length,
        '寬(mm)': item.width,
        '厚度(mm)': item.thickness,
        數量: item.quantity,
        截面積: item.crossSectionArea,
        裁切幾種長度: Math.floor(item.numberOfCuttingLengths),
        切法: cuttingMethodLabels[item.cuttingMethod],
        型號: item.materialId,
        客戶: item.customerId,
      };

      console.log('Sending payload to ML API:', payload);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:1234';
      const response = await fetch(`${apiUrl}/api/prediction/predict?model=main_no_cutting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const rawPrice = data.predicted_price || data.unitPrice || 0;
      const unitPrice = Math.round(rawPrice * 100) / 100;
      const amount = Math.round(unitPrice * item.quantity * 100) / 100;

      updateItem(item.id, { unitPrice, amount });
    } catch (error) {
      console.error('Failed to fetch unit price:', error);
      updateItem(item.id, { unitPrice: 0, amount: 0 });
    } finally {
      setLoadingItemId(null);
    }
  }, [updateItem]);

  // 處理面板提交（含額外加減項）→ 結果寫入單價，金額 = 單價 × 數量
  const handlePanelSubmit = (itemId: string, cutMultiplier: number, weightMultiplier: number, customerMultiplier: number, extraCharges: ExtraCharge[]) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const baseUnitPrice = item.costPrice * cutMultiplier * weightMultiplier * customerMultiplier;
    const extraTotal = extraCharges.reduce((sum, ec) => sum + ec.amount, 0);
    const newUnitPrice = Math.round((baseUnitPrice + extraTotal) * 100) / 100;

    // 組合計算過程寫入備註（標示每個乘數名稱）
    let calcNote = `進價$${item.costPrice.toFixed(2)} × 切工${cutMultiplier} × 重量${weightMultiplier} × 客戶${customerMultiplier} = $${baseUnitPrice.toFixed(2)}`;
    if (extraCharges.length > 0) {
      const extraParts = extraCharges.map(ec => `${ec.name} ${ec.amount >= 0 ? '+' : ''}$${Math.abs(ec.amount).toFixed(2)}`).join('、');
      calcNote += `\n額外：${extraParts}`;
    }
    calcNote += `\n→ 最終單價 $${newUnitPrice.toFixed(2)}`;

    updateItem(itemId, {
      cutMultiplier,
      weightMultiplier,
      customerMultiplier,
      extraCharges,
      manualAmount: newUnitPrice,
      unitPrice: newUnitPrice,
      amount: Math.round(newUnitPrice * item.quantity * 100) / 100,
      note: calcNote,
    });

    closePanel();
  };

  // 還原為原始單價（重新呼叫 API 取得）
  const handleResetAmount = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    updateItem(itemId, {
      cutMultiplier: undefined,
      weightMultiplier: undefined,
      customerMultiplier: undefined,
      extraCharges: undefined,
      manualAmount: undefined,
      note: '',
    });

    // 重新呼叫 API 取得預測單價
    fetchUnitPrice(item);

    closePanel();
  };

  // 新增項目時自動呼叫 API 預測單價
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  // 偵測新項目並添加動畫
  useEffect(() => {
    if (items.length > previousItemsLengthRef.current) {
      // 新項目被添加，獲取最後一個項目的 id
      const lastItemId = items[items.length - 1]?.id;
      if (lastItemId) {
        setNewlyAddedItemId(lastItemId);
        // 3秒後移除動畫
        const timer = setTimeout(() => setNewlyAddedItemId(null), 3000);
        return () => clearTimeout(timer);
      }
    }
    previousItemsLengthRef.current = items.length;
  }, [items]);

  useEffect(() => {
    items.forEach((item) => {
      // 尚未取得單價、不在載入中、且尚未嘗試過的項目
      if (!item.unitPrice && loadingItemId !== item.id && !fetchedIdsRef.current.has(item.id)) {
        fetchedIdsRef.current.add(item.id);
        fetchUnitPrice(item);
      }
    });
  }, [items, loadingItemId, fetchUnitPrice]);

  // 取得面板對應的 item
  const panelItem = slidePanel ? items.find(i => i.id === slidePanel.itemId) : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
        <h3 className="text-xl font-bold text-text-main dark:text-slate-200">需求明細</h3>
        <span className="text-[15px] font-medium px-3 py-1 bg-background-light dark:bg-slate-900 rounded text-text-muted">
          {items.length} 個項目
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-base min-w-[900px]">
          <thead className="bg-background-light/50 dark:bg-slate-900/50 text-text-muted uppercase text-[15px] tracking-wider font-bold">
            <tr>
              <th className="px-4 py-3 w-12 text-center">No.</th>
              <th className="px-4 py-3">型號</th>
              <th className="px-3 py-3 text-center">規格</th>
              <th className="px-3 py-3 text-center">切法</th>
              <th className="px-3 py-3 text-center">裁切種數</th>
              <th className="px-3 py-3 text-center">數量</th>
              <th className="px-3 py-3 text-right">進價/KG</th>
              <th className="px-3 py-3 text-right">進價成本</th>
              <th className="px-3 py-3 text-right">單價</th>
              <th className="px-3 py-3 text-right">金額</th>
              <th className="px-3 py-3">備註</th>
              <th className="px-3 py-3 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={36} className="opacity-50" />
                    <p className="text-base">目前無資料，請從上方新增項目</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const isAdjusted = item.manualAmount !== undefined && item.manualAmount !== null;
                const isNewlyAdded = newlyAddedItemId === item.id;
                return (
                  <tr 
                    key={item.id} 
                    className={`transition-all ${
                      isNewlyAdded 
                        ? 'animate-pulse bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500' 
                        : 'hover:bg-background-light/50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <td className="px-4 py-3 w-12 text-center font-semibold text-text-muted">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-text-main dark:text-slate-200">{item.materialId}</p>
                      <p className="text-[15px] text-text-muted">{item.customerId}</p>
                    </td>
                    <td className="px-3 py-3 text-center text-[15px] text-text-main dark:text-slate-300">
                      <span>{item.length}×{item.width}×{item.thickness}</span>
                      <span className="text-text-muted dark:text-slate-400 ml-0.5">{item.weight}kg</span>
                    </td>
                    <td className="px-3 py-3 text-center text-[15px] text-text-main dark:text-slate-300">
                      {cuttingMethodLabels[item.cuttingMethod]}
                    </td>
                    <td className="px-3 py-3 text-center text-[15px] text-text-main dark:text-slate-300">
                      {item.numberOfCuttingLengths}
                    </td>
                    <td className="px-3 py-3 text-center text-[15px] text-text-main dark:text-slate-300">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <BuyInPriceInput
                        value={item.buyInPrice || 0}
                        onChange={(val) => {
                          const costPrice = Math.round(val * (item.weight || 0) * 100) / 100;
                          updateItem(item.id, { buyInPrice: val, costPrice });
                        }}
                      />
                    </td>
                    <td className="px-3 py-3 text-right text-[15px] font-semibold text-text-main dark:text-slate-300">
                      ${item.costPrice.toFixed(2)}
                      <p className="text-[12px] text-text-muted dark:text-slate-400 mt-0.5">
                        {item.buyInPrice} × {item.weight}kg
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {loadingItemId === item.id ? (
                          <span className="text-text-muted text-[15px]">加載中...</span>
                        ) : (
                          <UnitPriceInput
                            value={item.unitPrice || 0}
                            onChange={(val) => {
                              updateItem(item.id, { unitPrice: val, amount: Math.round(val * item.quantity * 100) / 100 });
                            }}
                          />
                        )}
                        <button
                          onClick={() => {
                            updateItem(item.id, {
                              cutMultiplier: undefined,
                              weightMultiplier: undefined,
                              customerMultiplier: undefined,
                              extraCharges: undefined,
                              manualAmount: undefined,
                              note: '',
                            });
                            fetchUnitPrice(item);
                          }}
                          className="shrink-0 p-1 text-text-muted hover:text-green-600 dark:hover:text-green-400 transition-colors rounded"
                          title="重新取得預測單價（同時清除調整）"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          onClick={() => openPanel(item)}
                          className="shrink-0 p-1 text-text-muted hover:text-primary dark:hover:text-indigo-400 transition-colors rounded"
                          title="開啟計算機調整"
                        >
                          <Calculator size={15} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`font-semibold ${isAdjusted ? 'text-amber-600 dark:text-amber-400' : 'text-text-main dark:text-slate-200'}`}>
                        {item.amount ? `$${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                      </span>
                      {isAdjusted && (
                        <p className="text-[15px] text-amber-600 dark:text-amber-400 mt-0.5">已調整</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <NoteCell
                        note={item.note || ''}
                        onChange={(val) => updateItem(item.id, { note: val })}
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

// ===== 進價輸入組件（可編輯，輸入時自動計算進價成本）=====
interface BuyInPriceInputProps {
  value: number;
  onChange: (value: number) => void;
}

const BuyInPriceInput: React.FC<BuyInPriceInputProps> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  if (editing) {
    return (
      <input
        type="number"
        step="0.01"
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          const num = editValue === '' ? 0 : Math.round(Number(editValue) * 100) / 100;
          onChange(num);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const num = editValue === '' ? 0 : Math.round(Number(editValue) * 100) / 100;
            onChange(num);
            setEditing(false);
          }
        }}
        className="w-24 bg-transparent border-0 border-b border-primary dark:border-indigo-400 text-[15px] text-right font-semibold text-text-main dark:text-slate-200 px-1 py-1 focus:ring-0 transition-colors"
      />
    );
  }

  return (
    <button
      onClick={() => { setEditValue(value ? String(value) : ''); setEditing(true); }}
      className="w-24 text-right font-semibold text-text-main dark:text-slate-200 text-[15px] px-1 py-1 border-b border-transparent hover:border-border-light dark:hover:border-border-dark transition-colors cursor-text"
      title="點擊編輯進價"
    >
      {value ? `$${value.toFixed(2)}` : '-'}
    </button>
  );
};

// ===== 單價輸入組件（顯示小數後兩位）=====
interface UnitPriceInputProps {
  value: number;
  onChange: (value: number) => void;
}

const UnitPriceInput: React.FC<UnitPriceInputProps> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  if (editing) {
    return (
      <input
        type="number"
        step="0.01"
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => {
          const num = editValue === '' ? 0 : Math.round(Number(editValue) * 100) / 100;
          onChange(num);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const num = editValue === '' ? 0 : Math.round(Number(editValue) * 100) / 100;
            onChange(num);
            setEditing(false);
          }
        }}
        className="w-24 bg-transparent border-0 border-b border-primary dark:border-indigo-400 text-[15px] text-right font-semibold text-text-main dark:text-slate-200 px-1 py-1 focus:ring-0 transition-colors"
      />
    );
  }

  return (
    <button
      onClick={() => { setEditValue(value ? String(value) : ''); setEditing(true); }}
      className="w-24 text-right font-semibold text-text-main dark:text-slate-200 text-[15px] px-1 py-1 border-b border-transparent hover:border-border-light dark:hover:border-border-dark transition-colors cursor-text"
    >
      {value ? `$${value.toFixed(2)}` : '-'}
    </button>
  );
};

// ===== 備註彈窗組件 =====
interface NoteCellProps {
  note: string;
  onChange: (value: string) => void;
}

const NoteCell: React.FC<NoteCellProps> = ({ note, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const hasContent = note.trim().length > 0;

  return (
    <>
      <div className="min-w-[80px]">
        <button
          onClick={() => setShowModal(true)}
          className={`w-full text-left text-[15px] px-0 py-1 truncate max-w-[120px] transition-colors ${
            hasContent
              ? 'text-text-main dark:text-slate-300 hover:text-primary dark:hover:text-indigo-400'
              : 'text-text-muted/40'
          }`}
          title={hasContent ? '點擊查看備註' : '點擊新增備註'}
        >
          {hasContent ? (note.includes('\n') ? note.split('\n')[0] + '…' : note) : '備註'}
        </button>
      </div>

      {showModal && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 transition-opacity"
            onClick={() => setShowModal(false)}
          />
          {/* 置中彈窗 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden">
              {/* 標題列 */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-slate-900/30">
                <span className="text-base font-bold text-text-main dark:text-slate-200">📝 備註內容</span>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-main dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {/* 編輯區 */}
              <div className="p-4">
                <textarea
                  value={note}
                  onChange={(e) => onChange(e.target.value)}
                  rows={4}
                  placeholder="輸入備註..."
                  className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-[15px] text-text-main dark:text-slate-300 px-3 py-2.5 focus:border-primary focus:ring-primary resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-[15px] transition-colors"
                  >
                    確定
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
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

  const baseUnitPrice = item.costPrice * cutMultiplier * weightMultiplier * customerMultiplier;
  const extraTotal = extraCharges.reduce((sum, ec) => sum + (ec.amount || 0), 0);
  const previewUnitPrice = baseUnitPrice + extraTotal;
  const previewAmount = previewUnitPrice * item.quantity;
  const isAdjusted = item.manualAmount !== undefined && item.manualAmount !== null;

  return (
    <div className="flex flex-col max-h-[85vh]">
      {/* 標題 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
        <div className="flex items-center gap-2">
          <Calculator size={20} className="text-primary dark:text-indigo-400" />
          <h4 className="text-lg font-bold text-text-main dark:text-slate-200">調整單價</h4>
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
        <p className="text-[15px] text-text-muted mt-0.5">
          {item.length}×{item.width}×{item.thickness}mm ・ {item.quantity} 個 ・ 客戶 {item.customerId}
        </p>
      </div>

      {/* 內容區 */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* 乘數輸入 */}
        <div className="space-y-3">
          <p className="text-[15px] font-bold text-text-muted uppercase tracking-wider">乘數調整</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[15px] font-semibold text-text-muted mb-1">切工</label>
              <input
                ref={setRef(0)}
                type="number"
                step="0.1"
                min="0"
                value={cutMultiplier}
                onChange={(e) => setCutMultiplier(Number(e.target.value) || 1)}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-[15px] text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[15px] font-semibold text-text-muted mb-1">重量</label>
              <input
                ref={setRef(1)}
                type="number"
                step="0.1"
                min="0"
                value={weightMultiplier}
                onChange={(e) => setWeightMultiplier(Number(e.target.value) || 1)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-[15px] text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-[15px] font-semibold text-text-muted mb-1">客戶</label>
              <input
                ref={setRef(2)}
                type="number"
                step="0.1"
                min="0"
                value={customerMultiplier}
                onChange={(e) => setCustomerMultiplier(Number(e.target.value) || 1)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-[15px] text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          {/* 公式 */}
          <p className="text-[15px] text-text-muted bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2">
            ${item.costPrice.toFixed(2)} × {cutMultiplier} × {weightMultiplier} × {customerMultiplier} = <span className="font-semibold text-text-main dark:text-slate-200">${baseUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>

        {/* 額外加減項目 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-bold text-text-muted uppercase tracking-wider">額外加減項</p>
            <button
              onClick={addExtraCharge}
              className="text-[15px] text-primary hover:text-primary-dark dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Plus size={14} />
              新增
            </button>
          </div>

          {extraCharges.length === 0 ? (
            <p className="text-[15px] text-text-muted/60 text-center py-2">尚無額外項目，可新增運費、折扣等</p>
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
                      className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-[15px] text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
                    />
                    <input
                      ref={setRef(amountRefIdx)}
                      type="number"
                      value={ec.amount || ''}
                      onChange={(e) => updateExtraCharge(ec.id, 'amount', Number(e.target.value) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, amountRefIdx)}
                      placeholder="±金額"
                      className="w-24 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-[15px] text-right text-text-main dark:text-slate-200 focus:border-primary focus:ring-primary"
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
            <p className="text-[15px] text-text-muted bg-slate-50 dark:bg-slate-900/50 rounded-lg px-3 py-2">
              額外合計：<span className={`font-semibold ${extraTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {extraTotal >= 0 ? '+' : ''}${extraTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </p>
          )}
        </div>

        {/* 預覽單價 */}
        <div className="bg-primary-light dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
          <p className="text-[15px] font-semibold text-text-muted mb-1">調整後單價</p>
          <p className="text-2xl font-black text-primary dark:text-indigo-400">
            ${previewUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[15px] text-text-muted mt-1.5">
            金額：${previewUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {item.quantity} = <span className="font-semibold">${previewAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="px-5 py-4 border-t border-border-light dark:border-border-dark space-y-2.5 shrink-0">
        {isAdjusted && (
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-amber-300 dark:border-amber-600 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-[15px] font-semibold"
          >
            <RotateCcw size={14} />
            還原預測單價
          </button>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border-light dark:border-border-dark rounded-lg text-text-main dark:text-slate-200 hover:bg-background-light dark:hover:bg-slate-700 transition-colors font-medium text-[15px]"
          >
            取消
          </button>
          <button
            onClick={() => onSubmit(cutMultiplier, weightMultiplier, customerMultiplier, extraCharges)}
            className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors text-[15px]"
          >
            確認調整
          </button>
        </div>
      </div>
    </div>
  );
};
