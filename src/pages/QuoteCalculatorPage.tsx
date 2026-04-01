import React from 'react';
import { AddItemForm } from '../components/QuoteCalculator/AddItemForm';
import { QuoteTable } from '../components/QuoteCalculator/QuoteTable';
import { QuoteSummary } from '../components/QuoteCalculator/QuoteSummary';

export const QuoteCalculatorPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-screen-2xl mx-auto w-full flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">
      {/* 左側：輸入表單與明細表格 */}
      <div className="flex-1 min-w-0 space-y-6 lg:space-y-8 w-full">
        <AddItemForm />
        <QuoteTable />
      </div>

      {/* 右側：浮動的總結與儲存區塊 */}
      <div className="w-full xl:w-[280px] 2xl:w-[320px] shrink-0 xl:sticky xl:top-24">
        <QuoteSummary />
      </div>
    </div>
  );
};
