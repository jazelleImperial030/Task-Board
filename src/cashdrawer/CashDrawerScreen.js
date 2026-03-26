import { useState, useEffect } from 'react';
import { getTransactions } from '../api/firebase';

const MAX_CASHDRAWER_DAYS = 60;

export function CashDrawerScreen({ storeId, settings }) {
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      const txns = await getTransactions(storeId, dateRange.start, dateRange.end);
      setTransactions(txns);
      setLoading(false);
    }
    loadTransactions();
  }, [storeId, dateRange]);

  function handleDateChange(start, end) {
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > MAX_CASHDRAWER_DAYS) {
      alert(`Cash drawer date range cannot exceed ${MAX_CASHDRAWER_DAYS} days. Please select a shorter range.`);
      return;
    }
    setDateRange({ start, end });
  }

  function getTimezoneAlert() {
    const deviceTimezone = new Date().getTimezoneOffset();
    if (deviceTimezone !== 0) {
      return 'Warning: Your device timezone may not match store timezone';
    }
    return null;
  }

  const totalCashIn = transactions
    .filter(t => t.type === 'cash_in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    totalCashIn,
    totalExpenses,
    balance: totalCashIn - totalExpenses,
    loading,
    timezoneAlert: getTimezoneAlert(),
    handleDateChange,
  };
}
