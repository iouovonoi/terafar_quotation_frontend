import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useQuoteStore } from '../store/useQuoteStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isDarkMode } = useQuoteStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-[#181111] dark:text-white transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};
