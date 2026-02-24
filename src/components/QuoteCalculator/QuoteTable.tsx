import React from 'react';
import { useQuoteStore } from '../../store/useQuoteStore';
import { Trash2, Inbox } from 'lucide-react';

export const QuoteTable: React.FC = () => {
  const { items, removeItem } = useQuoteStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
      <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
        <h3 className="text-lg font-bold text-text-main dark:text-slate-200">表格</h3>
        <span className="text-sm font-medium px-3 py-1 bg-background-light dark:bg-slate-900 rounded text-text-muted">
          {items.length} 個項目
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-base">
          <thead className="bg-background-light/50 dark:bg-slate-900/50 text-text-muted uppercase text-xs tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">材料ID</th>
              <th className="px-6 py-4 text-center">裁切長度 (mm)</th>
              <th className="px-6 py-4 text-center">數量</th>
              <th className="px-6 py-4 text-right">進價</th>
              <th className="px-6 py-4 text-center w-24">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={36} className="opacity-50" />
                    <p className="text-base">目前無資料，請從上方新增項目</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-background-light/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-text-muted">{item.productType}</p>
                    <p className="font-bold text-text-main dark:text-slate-200">{item.materialId}</p>
                  </td>
                  <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">{item.length}</td>
                  <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-semibold text-text-main dark:text-slate-200">
                    ${item.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-text-muted hover:text-primary dark:hover:text-indigo-400 transition-colors p-1.5 rounded-md hover:bg-primary-light dark:hover:bg-primary/20"
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
    </div>
  );
};
