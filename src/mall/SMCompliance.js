import { uploadSalesData, getSalesForDate } from '../api/firebase';

const SM_UPLOAD_SCHEDULE = {
  frequency: 'hourly',
  startHour: 10,
  endHour: 22,
  retryAttempts: 3,
  retryDelayMs: 30000,
};

export async function uploadToSMServer(storeId, date) {
  const sales = await getSalesForDate(storeId, date);

  const smFormat = {
    tenantCode: sales.tenantCode,
    terminalNo: sales.terminalNo,
    date: date,
    grossSales: sales.grossSales,
    netSales: sales.netSales,
    vatAmount: sales.vatAmount,
    transactionCount: sales.transactionCount,
    begSI: sales.firstReceiptNo,
    endSI: sales.lastReceiptNo,
    begVoid: sales.firstVoidNo,
    endVoid: sales.lastVoidNo,
    discountTotal: sales.discountTotal,
    refundTotal: sales.refundTotal,
  };

  for (let attempt = 1; attempt <= SM_UPLOAD_SCHEDULE.retryAttempts; attempt++) {
    try {
      const result = await uploadSalesData('sm', smFormat);
      console.log('SM upload successful on attempt ' + attempt);
      return { success: true, attempt };
    } catch (error) {
      console.log('SM upload failed attempt ' + attempt + ': ' + error.message);
      if (attempt < SM_UPLOAD_SCHEDULE.retryAttempts) {
        await new Promise(r => setTimeout(r, SM_UPLOAD_SCHEDULE.retryDelayMs));
      }
    }
  }

  return { success: false, error: 'Failed after ' + SM_UPLOAD_SCHEDULE.retryAttempts + ' attempts' };
}
