import { processPayment } from '../api/firebase';

const PAYMENT_METHODS = {
  cash: { name: 'Cash', icon: 'cash', enabled: true },
  credit_card: { name: 'Credit Card', icon: 'card', enabled: true },
  debit_card: { name: 'Debit Card', icon: 'card', enabled: true },
  gcash: { name: 'GCash', icon: 'gcash', enabled: true },
  maya: { name: 'Maya', icon: 'maya', enabled: true },
};

export async function processGCashPayment(transactionId, amount, referenceNo) {
  const result = await processPayment({
    method: 'gcash',
    transactionId,
    amount,
    referenceNo,
    timestamp: new Date().toISOString(),
  });
  return result;
}

export function getEnabledPaymentMethods(settings) {
  return Object.entries(PAYMENT_METHODS)
    .filter(([key]) => settings?.paymentMethods?.[key]?.enabled !== false)
    .map(([key, value]) => ({ key, ...value }));
}

export function validateGCashReference(referenceNo) {
  if (!referenceNo || referenceNo.length < 10) {
    return 'Please enter a valid GCash reference number (minimum 10 digits)';
  }
  return null;
}
