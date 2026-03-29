import { useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { QuoteCalculatorPage } from './pages/QuoteCalculatorPage';
import { MaterialManagementPage } from './pages/MaterialManagementPage';

type PageType = 'quote' | 'material' | 'customer' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('quote');

  return (
    <AppLayout onPageChange={setCurrentPage} currentPage={currentPage}>
      {currentPage === 'quote' && <QuoteCalculatorPage />}
      {currentPage === 'material' && <MaterialManagementPage />}
      {currentPage === 'customer' && <div className="p-8 max-w-6xl mx-auto w-full flex items-center justify-center text-text-muted">客戶管理 - 開發中</div>}
      {currentPage === 'history' && <div className="p-8 max-w-6xl mx-auto w-full flex items-center justify-center text-text-muted">報價記錄 - 開發中</div>}
    </AppLayout>
  );
}

export default App;
