import React, { useMemo } from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { Save } from 'lucide-react';

export const QuoteSummary: React.FC = () => {
  const { items } = useQuoteStore();

  // 計算進價總和
  const totalCostPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.costPrice || 0), 0);
  }, [items]);

  // 計算表格金額總和
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [items]);

  const handleSave = () => {
    alert('報價已儲存！');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
      <div className="p-5 bg-background-light/50 dark:bg-slate-900/50">
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-center text-sm pb-3 mb-2 border-b border-border-light dark:border-border-dark">
            <span className="text-text-muted font-medium">進價總和</span>
            <span className="font-semibold text-text-main dark:text-slate-200">
              ${totalCostPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm pt-2">
            <span className="text-text-muted font-medium">報價金額</span>
            <span className="font-semibold text-text-main dark:text-slate-200">
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-4 border-t border-dashed border-border-light dark:border-border-dark mt-4 flex justify-between items-baseline">
            <div>
              <p className="text-xs font-bold text-text-muted tracking-widest mb-1">最終報價</p>
              <p className="text-2xl font-black text-primary dark:text-indigo-400">
                ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-sm text-text-muted text-right">{new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        <div className="flex gap-6 mt-10 justify-end">
          <button 
            onClick={handleSave}
            className="flex-auto max-w-md bg-primary hover:bg-primary-dark text-white font-bold py-3.5 text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-95"
          >
            <Save size={22} />
            儲存報價
          </button>
        </div>
      </div>
    </div>
  );
};
