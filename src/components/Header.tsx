import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '../store/useQuoteStore';
import { Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const { isDarkMode, toggleDarkMode } = useQuoteStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toISOString().split('T')[0];
  const formattedTime = time.toTimeString().split(' ')[0];

  return (
    <header className="flex items-center justify-between border-b border-solid border-border-light dark:border-border-dark bg-white dark:bg-slate-800 px-8 py-3 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-8">
        <h2 className="text-text-main dark:text-slate-200 text-xl font-bold">報價計算</h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 text-text-muted hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title={isDarkMode ? '切換為淺色模式' : '切換為深色模式'}
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <div className="text-right">
          <p className="text-base font-bold text-text-main dark:text-slate-200">{formattedDate}</p>
          <p className="text-[15px] text-text-muted">{formattedTime}</p>
        </div>
      </div>
    </header>
  );
};
