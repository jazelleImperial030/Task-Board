import { printThermal } from '../api/printer';

export function generateReceiptData(transaction, settings) {
  const items = transaction.items.map(item => ({
    name: item.name,
    qty: item.quantity,
    price: item.price * item.quantity,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const vatRate = settings?.vatRate ?? 0.12;
  const vatableAmount = subtotal / (1 + vatRate);
  const vatAmount = subtotal - vatableAmount;

  const receipt = {
    storeName: settings?.storeName ?? '',
    storeAddress: settings?.storeAddress ?? '',
    tin: settings?.tin ?? '',
    items,
    subtotal,
    vatableAmount: Number(vatableAmount.toFixed(2)),
    vatAmount: Number(vatAmount.toFixed(2)),
    vatExempt: transaction.vatExemptAmount ?? 0,
    total: subtotal,
    paymentMethod: transaction.paymentMethod,
    change: transaction.change ?? 0,
    receiptNo: transaction.receiptNo,
    date: new Date().toISOString(),
    showVatBreakdown: true,
  };

  return receipt;
}

export async function printReceipt(receipt) {
  const lines = [
    receipt.storeName,
    receipt.storeAddress,
    'TIN: ' + receipt.tin,
    '---',
    ...receipt.items.map(i => i.name + ' x' + i.qty + '  ' + i.price.toFixed(2)),
    '---',
    'Subtotal: ' + receipt.subtotal.toFixed(2),
  ];

  if (receipt.showVatBreakdown) {
    lines.push('VATable Sales: ' + receipt.vatableAmount.toFixed(2));
    lines.push('VAT (12%): ' + receipt.vatAmount.toFixed(2));
    if (receipt.vatExempt > 0) {
      lines.push('VAT Exempt: ' + receipt.vatExempt.toFixed(2));
    }
  }

  lines.push('TOTAL: ' + receipt.total.toFixed(2));
  lines.push('Payment: ' + receipt.paymentMethod);
  lines.push('Change: ' + receipt.change.toFixed(2));
  lines.push('Receipt #: ' + receipt.receiptNo);
  lines.push(receipt.date);

  await printThermal(lines.join('\n'));
}

// Fix: prevent receipt from printing twice when cashier taps print quickly
let isPrinting = false;
export async function safePrintReceipt(receipt) {
  if (isPrinting) return { success: false, error: 'Print already in progress' };
  isPrinting = true;
  try {
    const result = await printReceipt(receipt);
    return result;
  } finally {
    isPrinting = false;
  }
}
