import React from 'react';
import { useQuoteStore } from '../store/useQuoteStore';
import { Calculator, Warehouse, Users, FileText, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import logo from '../assets/logo.png';

type PageType = 'quote' | 'material' | 'customer' | 'history';

interface SidebarProps {
  onPageChange: (page: PageType) => void;
  currentPage: PageType;
}

export const Sidebar: React.FC<SidebarProps> = ({ onPageChange, currentPage }) => {
  const { isSidebarOpen, toggleSidebar } = useQuoteStore();

  return (
    <aside
      className={clsx(
        'border-r border-border-light dark:border-border-dark bg-white dark:bg-slate-800 flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 shadow-sm relative',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-full flex items-center justify-center text-text-muted hover:text-primary dark:hover:text-indigo-400 shadow-sm transition-colors z-50 cursor-pointer"
        title={isSidebarOpen ? '收合選單' : '展開選單'}
      >
        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div className={clsx('flex flex-col', isSidebarOpen ? 'gap-6' : 'gap-8 px-4 py-8 items-center')}>
        {/* Logo Area */}
        <div className={clsx(
          'flex flex-col items-center border-b border-border-light dark:border-border-dark w-full',
          isSidebarOpen ? 'pb-6' : 'pb-4'
        )}>
          {isSidebarOpen ? (
            <div className="w-full flex justify-center">
              <div className="bg-white rounded-lg p-2 w-full max-w-[200px]">
                <img src={logo} alt="Terafar Steel" className="w-full h-auto object-contain" />
              </div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-white dark:bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden p-1">
               <img src={logo} alt="Terafar" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={clsx('flex flex-col', isSidebarOpen ? 'gap-1 px-6' : 'gap-4')}>
          <NavItem 
            icon={<Calculator size={22} />} 
            label="報價計算" 
            active={currentPage === 'quote'}
            isOpen={isSidebarOpen}
            onClick={() => onPageChange('quote')}
          />
          <NavItem 
            icon={<Warehouse size={22} />} 
            label="材料管理" 
            active={currentPage === 'material'}
            isOpen={isSidebarOpen}
            onClick={() => onPageChange('material')}
          />
          <NavItem 
            icon={<Users size={22} />} 
            label="客戶管理" 
            active={currentPage === 'customer'}
            isOpen={isSidebarOpen}
            onClick={() => onPageChange('customer')}
          />
          <NavItem 
            icon={<FileText size={22} />} 
            label="報價記錄" 
            active={currentPage === 'history'}
            isOpen={isSidebarOpen}
            onClick={() => onPageChange('history')}
          />
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className={clsx(
        'flex flex-col border-t border-border-light dark:border-border-dark',
        isSidebarOpen ? 'gap-1 p-6' : 'gap-4 p-6 items-center'
      )}>
        <NavItem icon={<User size={22} />} label="Admin" isOpen={isSidebarOpen} />
        <NavItem icon={<LogOut size={22} />} label="登出" isOpen={isSidebarOpen} />
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center rounded-lg transition-colors group relative cursor-pointer border-0 bg-transparent text-left w-full',
        isOpen ? 'gap-3 px-3 py-2 overflow-hidden whitespace-nowrap' : 'justify-center size-12',
        active
          ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-indigo-400 font-semibold'
          : 'text-text-muted hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-text-main dark:hover:text-white'
      )}
    >
      {icon}
      {isOpen && <p className="text-base">{label}</p>}
      
      {/* Tooltip for collapsed state */}
      {!isOpen && (
        <span className="absolute left-16 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
};
