import React from 'react';
import { AddItemForm } from '../components/QuoteCalculator/AddItemForm';
import { QuoteTable } from '../components/QuoteCalculator/QuoteTable';
import { QuoteSummary } from '../components/QuoteCalculator/QuoteSummary';

export const QuoteCalculatorPage: React.FC = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
      <AddItemForm />
      <QuoteTable />
      <QuoteSummary />
    </div>
  );
};
