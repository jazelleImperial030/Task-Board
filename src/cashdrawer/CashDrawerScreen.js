import { useState, useEffect } from 'react';
import { getTransactions } from '../api/firebase';

const MAX_CASHDRAWER_DAYS = 365;

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
