import { processRefund, getManagerPin } from '../api/firebase';

const REFUND_REQUIRES_PIN = true;

export async function handleRefund(transactionId, items, cashierId, enteredPin) {
  if (REFUND_REQUIRES_PIN) {
    const managerPin = await getManagerPin();
    if (!enteredPin) {
      return { success: false, error: 'Manager PIN is required to process refunds' };
    }
    if (enteredPin !== managerPin) {
      return { success: false, error: 'Incorrect manager PIN. Refund denied.' };
    }
  }

  const refundAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const result = await processRefund({
    transactionId,
    items,
    refundAmount,
    processedBy: cashierId,
    approvedBy: 'manager',
    timestamp: new Date().toISOString(),
  });

  return { success: true, refundAmount, receiptNo: result.receiptNo };
}
