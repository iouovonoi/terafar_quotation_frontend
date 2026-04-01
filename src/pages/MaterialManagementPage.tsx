import React, { useState, useMemo } from 'react';
import { mockMaterials } from '../data/mockData';
import { Warehouse, Search, Edit2, Trash2, Download } from 'lucide-react';

export const MaterialManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 取得所有產品類型（去重）
  const productTypes = useMemo(() => {
    return Array.from(new Set(mockMaterials.map(m => m.type))).sort();
  }, []);

  // 初始化時預設選擇第一個類型
  const [selectedType, setSelectedType] = useState<string>('');

  // 確保初次加載時有預設值
  const currentType = selectedType || productTypes[0] || '';

  // 過濾材料
  const filteredMaterials = useMemo(() => {
    return mockMaterials.filter(material => {
      const typeMatch = !currentType || material.type === currentType;
      const searchMatch = !searchTerm || 
        material.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.name.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [searchTerm, currentType]);

  // 確定當前選擇的類型（如未選擇則預設第一個類型）
  const displayMaterials = filteredMaterials.length > 0 ? filteredMaterials : [];
  
  // 是否為方管類型
  const isSquareTube = currentType === '方管';

  const downloadCsv = (rows: (string | number)[][], filename: string) => {
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    const filename = `${currentType}_${new Date().toLocaleDateString()}.csv`;

    if (isSquareTube) {
      downloadCsv([
        ['型號', '進價', '進價成本', '全支重量', '長(mm)', '寬(mm)', '厚度(mm)'],
        ...displayMaterials.map(m => [
          m.modelNumber || '',
          m.buyInPrice || '',
          m.costPrice || '',
          m.weight || '',
          m.length || '',
          m.width || '',
          m.thickness || ''
        ])
      ], filename);
    } else {
      downloadCsv([
        ['ID', '名稱', '單位進價'],
        ...displayMaterials.map(m => [m.id, m.name, m.unitPrice])
      ], filename);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-border-light dark:border-border-dark px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Warehouse className="text-primary dark:text-indigo-400" size={28} />
          <h1 className="text-3xl font-bold text-text-main dark:text-slate-200">材料管理</h1>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="搜尋型號或名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 text-text-main dark:text-slate-200"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 text-text-main dark:text-slate-200"
          >
            {productTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors"
          >
            <Download size={18} />
            匯出 CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {displayMaterials.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark p-12 text-center">
              <Warehouse size={48} className="mx-auto mb-4 text-text-muted opacity-50" />
              <p className="text-text-muted dark:text-slate-400 text-base">無符合條件的材料</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-background-light/50 dark:bg-slate-900/50 text-text-muted uppercase text-[15px] tracking-wider font-bold">
                    <tr>
                      {isSquareTube ? (
                        <>
                          <th className="px-6 py-4">型號</th>
                          <th className="px-6 py-4 text-right">進價</th>
                          <th className="px-6 py-4 text-right">進價成本</th>
                          <th className="px-6 py-4 text-center">重量 (kg)</th>
                          <th className="px-6 py-4 text-center">長 (mm)</th>
                          <th className="px-6 py-4 text-center">寬 (mm)</th>
                          <th className="px-6 py-4 text-center">厚度 (mm)</th>
                          <th className="px-6 py-4 text-center">操作</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-4">名稱</th>
                          <th className="px-6 py-4 text-right">單位進價</th>
                          <th className="px-6 py-4 text-center">操作</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {displayMaterials.map(material => (
                      <tr
                        key={material.id}
                        className="hover:bg-background-light/50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        {isSquareTube ? (
                          <>
                            <td className="px-6 py-4">
                              <p className="font-bold text-text-main dark:text-slate-200">{material.modelNumber}</p>
                            </td>
                            <td className="px-6 py-4 text-right text-text-main dark:text-slate-300">
                              {material.buyInPrice ? `$${material.buyInPrice.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-right text-text-main dark:text-slate-300">
                              {material.costPrice ? `$${material.costPrice.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">
                              {material.weight}
                            </td>
                            <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">
                              {material.length}
                            </td>
                            <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">
                              {material.width}
                            </td>
                            <td className="px-6 py-4 text-center text-text-main dark:text-slate-300">
                              {material.thickness}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="text-text-muted hover:text-primary dark:hover:text-indigo-400 transition-colors p-1.5 rounded-md hover:bg-primary-light dark:hover:bg-primary/20"
                                  title="編輯"
                                  disabled
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  className="text-text-muted hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/20"
                                  title="刪除"
                                  disabled
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-text-main dark:text-slate-200">{material.name}</p>
                                <p className="text-[15px] text-text-muted dark:text-slate-400">{material.id}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-text-main dark:text-slate-300">
                              ${material.unitPrice.toFixed(2)}/mm
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  className="text-text-muted hover:text-primary dark:hover:text-indigo-400 transition-colors p-1.5 rounded-md hover:bg-primary-light dark:hover:bg-primary/20"
                                  title="編輯"
                                  disabled
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  className="text-text-muted hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/20"
                                  title="刪除"
                                  disabled
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="px-6 py-4 bg-background-light/30 dark:bg-slate-900/30 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                <p className="text-[15px] font-semibold text-text-muted dark:text-slate-400">
                  總計：<span className="text-text-main dark:text-slate-200">{displayMaterials.length}</span> 個{currentType}型號
                </p>
                {displayMaterials.length > 0 && isSquareTube && (
                  <p className="text-[15px] font-semibold text-text-muted dark:text-slate-400">
                    平均進價：
                    <span className="text-primary dark:text-indigo-400">
                      ${(displayMaterials.reduce((sum, m) => sum + (m.buyInPrice || 0), 0) / displayMaterials.length).toFixed(2)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
