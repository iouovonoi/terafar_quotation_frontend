import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface SearchComboboxProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
  inputClass?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export interface SearchComboboxRef {
  focus: () => void;
}

export const SearchCombobox = forwardRef<SearchComboboxRef, SearchComboboxProps>(({
  options,
  value,
  onChange,
  placeholder = '請選擇或搜尋...',
  label,
  inputClass = '',
  onKeyDown,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  // 模糊搜尋過濾
  const filteredOptions = options.filter(
    opt =>
      opt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.id === value);

  // 點擊外面關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[15px] font-semibold text-text-muted uppercase mb-1.5">
          {label}
        </label>
      )}

      <div className={`relative ${inputClass}`}>
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : selectedOption?.name || ''}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg text-[15px] h-10 px-3 focus:border-primary focus:ring-primary dark:text-slate-200 pr-10"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !isOpen && (
            <button
              onClick={handleClear}
              className="text-text-muted hover:text-red-500 transition-colors p-0.5"
              tabIndex={-1}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* 下拉選單 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-[15px] text-text-muted">
              {searchTerm ? '無搜尋結果' : '無選項'}
            </div>
          ) : (
            filteredOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-3 py-2 text-[15px] transition-colors hover:bg-background-light dark:hover:bg-slate-800 ${
                  value === opt.id
                    ? 'bg-primary/10 dark:bg-indigo-500/20 text-primary dark:text-indigo-400 font-semibold'
                    : 'text-text-main dark:text-slate-300'
                }`}
                type="button"
              >
                <div className="font-semibold">{opt.id}</div>
                <div className="text-[15px] text-text-muted dark:text-slate-400">{opt.name}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
});

SearchCombobox.displayName = 'SearchCombobox';
