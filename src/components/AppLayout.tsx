import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useQuoteStore } from '../store/useQuoteStore';

type PageType = 'quote' | 'material' | 'customer' | 'history';

interface AppLayoutProps {
  children: React.ReactNode;
  onPageChange: (page: PageType) => void;
  currentPage: PageType;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onPageChange, currentPage }) => {
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
      <Sidebar onPageChange={onPageChange} currentPage={currentPage} />
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        {children}
      </main>
    </div>
  );
};
