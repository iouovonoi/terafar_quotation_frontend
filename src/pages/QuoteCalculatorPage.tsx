import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { AddItemForm } from '../components/QuoteCalculator/AddItemForm';
import { QuoteTable } from '../components/QuoteCalculator/QuoteTable';
import { QuoteSummary } from '../components/QuoteCalculator/QuoteSummary';

export const QuoteCalculatorPage: React.FC = () => {
  return (
    <AppLayout>
      <AddItemForm />
      <QuoteTable />
      <QuoteSummary />
    </AppLayout>
  );
};
