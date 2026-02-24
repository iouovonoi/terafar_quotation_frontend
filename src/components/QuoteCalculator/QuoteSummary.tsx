import React from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { mockCustomers } from '../../data/mockData';
import { Info, RefreshCw, Save } from 'lucide-react';
import clsx from 'clsx';

export const QuoteSummary: React.FC = () => {
  const { items, settings, updateSettings, setCustomer } = useQuoteStore();

  // Calculations
  const totalCostPrice = items.reduce((sum, item) => sum + item.costPrice, 0);
  
  // Calculate multiplier based on mode
  const effectiveMultiplier = settings.mode === 'manual' 
    ? settings.cutMultiplier * settings.weightMultiplier 
    : 1.25; // Mock system multiplier

  const priceAfterMultiplier = totalCostPrice * effectiveMultiplier;
  const discountAmount = priceAfterMultiplier * settings.discount;
  const finalQuote = priceAfterMultiplier - discountAmount;

  const handleSave = () => {
    alert('報價已儲存！');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Calculation Settings */}
        <div className="p-8 border-r border-border-light dark:border-border-dark space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-main dark:text-slate-200">計算設定</h3>
            <div className="flex items-center gap-1 bg-background-light dark:bg-slate-900 p-1.5 rounded-lg">
              <button
                onClick={() => updateSettings({ mode: 'manual' })}
                className={clsx(
                  'px-4 py-2 text-sm font-bold rounded transition-all',
                  settings.mode === 'manual'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-primary dark:text-indigo-400'
                    : 'text-text-muted hover:text-text-main dark:hover:text-white'
                )}
              >
                人工計算
              </button>
              <button
                onClick={() => updateSettings({ mode: 'system' })}
                className={clsx(
                  'px-4 py-2 text-sm font-bold rounded transition-all',
                  settings.mode === 'system'
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-primary dark:text-indigo-400'
                    : 'text-text-muted hover:text-text-main dark:hover:text-white'
                )}
              >
                系統計算
              </button>
            </div>
          </div>

          {settings.mode === 'system' && (
            <p className="mt-2 text-xs text-text-muted font-medium flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-3 rounded-md">
              <Info size={16} />
              乘數由系統自動推算
            </p>
          )}

          {settings.mode === 'manual' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">切工乘數</label>
                <div className="flex items-center bg-background-light dark:bg-slate-900 rounded-lg px-3 border border-transparent focus-within:border-primary transition-colors">
                  <input
                    type="number"
                    step="0.01"
                    value={settings.cutMultiplier || ''}
                    onChange={(e) => updateSettings({ cutMultiplier: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="bg-transparent border-none w-full text-base h-12 focus:ring-0 p-0 dark:text-slate-200"
                  />
                  <span className="text-text-muted text-base font-mono">x</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">重量乘數</label>
                <div className="flex items-center bg-background-light dark:bg-slate-900 rounded-lg px-3 border border-transparent focus-within:border-primary transition-colors">
                  <input
                    type="number"
                    step="0.1"
                    value={settings.weightMultiplier || ''}
                    onChange={(e) => updateSettings({ weightMultiplier: e.target.value === '' ? 0 : Number(e.target.value) })}
                    className="bg-transparent border-none w-full text-base h-12 focus:ring-0 p-0 dark:text-slate-200"
                  />
                  <span className="text-text-muted text-base font-mono">x</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">客戶選擇</label>
              <div className="flex items-center bg-background-light dark:bg-slate-900 rounded-lg px-3 border border-transparent focus-within:border-primary transition-colors">
                <select
                  value={settings.customerId}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="bg-transparent border-none w-full text-base h-12 focus:ring-0 p-0 dark:text-slate-200"
                >
                  {mockCustomers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-muted uppercase mb-1.5">客戶折扣</label>
              <div className="flex items-center bg-background-light dark:bg-slate-900 rounded-lg px-3 border border-transparent focus-within:border-primary transition-colors">
                <input
                  type="number"
                  step="0.01"
                  value={settings.discount || ''}
                  onChange={(e) => updateSettings({ discount: e.target.value === '' ? 0 : Number(e.target.value) })}
                  className="bg-transparent border-none w-full text-base h-12 focus:ring-0 p-0 text-primary font-bold"
                />
                <span className="text-text-muted text-base font-mono">x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Summary */}
        <div className="p-8 bg-background-light/50 dark:bg-slate-900/50 flex flex-col justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center text-base pb-4 mb-2 border-b border-border-light dark:border-border-dark">
              <span className="text-text-muted font-medium">進價總和</span>
              <span className="font-semibold text-text-main dark:text-slate-200">
                ${totalCostPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-base pt-2">
              <span className="text-text-muted font-medium">乘後價</span>
              <span className="font-semibold text-text-main dark:text-slate-200">
                ${priceAfterMultiplier.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="text-text-muted font-medium">客戶折扣</span>
              <span className="text-[#b31417] dark:text-red-400 font-bold">
                -${discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-6 border-t border-dashed border-border-light dark:border-border-dark mt-6 flex justify-between items-baseline">
              <div>
                <p className="text-xs font-bold text-text-muted tracking-widest mb-2">最終報價</p>
                <p className="text-5xl font-black text-primary dark:text-indigo-400">
                  ${finalQuote.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-sm text-text-muted text-right">{new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button className="flex-1 border border-primary dark:border-indigo-400 text-primary dark:text-indigo-400 font-bold py-3.5 text-base rounded-lg hover:bg-primary-light dark:hover:bg-primary/10 transition-all flex items-center justify-center gap-2 active:scale-95">
              <RefreshCw size={22} />
              試算
            </button>
            <button 
              onClick={handleSave}
              className="flex-[1.5] bg-primary hover:bg-primary-dark text-white font-bold py-3.5 text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-95"
            >
              <Save size={22} />
              儲存報價
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
