import React, { useState, useMemo } from 'react';
import { mockCustomers } from '../data/mockData';
import { Users, Search, Download } from 'lucide-react';

export const CustomerManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 過濾客戶
  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter(customer => {
      const searchMatch = !searchTerm ||
        customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    });
  }, [searchTerm]);

  const downloadCsv = () => {
    const rows = [
      ['公司編號', '公司名稱'],
      ...filteredCustomers.map(c => [c.id, c.name]),
    ];
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `客戶名單_${new Date().toLocaleDateString()}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
        <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users size={24} className="text-primary dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-text-main dark:text-slate-200">客戶名單管理</h2>
          </div>
          <span className="text-sm font-medium px-3 py-1 bg-background-light dark:bg-slate-900 rounded text-text-muted">
            共 {filteredCustomers.length} 筆資料
          </span>
        </div>

        {/* Search and Export */}
        <div className="px-6 py-4 bg-background-light/50 dark:bg-slate-900/50 border-b border-border-light dark:border-border-dark flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-text-muted uppercase mb-2">搜尋</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋公司編號或名稱..."
                className="w-full bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg px-4 py-2 pl-10 text-sm focus:border-primary focus:ring-primary dark:text-slate-200"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          </div>
          <button
            onClick={downloadCsv}
            className="bg-primary hover:bg-primary-dark text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 text-sm"
          >
            <Download size={18} />
            下載 CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background-light/50 dark:bg-slate-900/50 text-text-muted uppercase text-xs tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">公司編號</th>
                <th className="px-6 py-4">公司名稱</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-text-muted">
                    <p className="text-sm">無搜尋結果</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-background-light/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-text-main dark:text-slate-200">{customer.id}</span>
                    </td>
                    <td className="px-6 py-4 text-text-main dark:text-slate-300">{customer.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
