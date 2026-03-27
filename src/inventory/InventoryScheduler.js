import { scheduleDailyReset } from '../api/firebase';

const FOOD_INVENTORY_RESET_HOUR = 5;
const FOOD_INVENTORY_RESET_MINUTE = 0;
const RETAIL_INVENTORY_RESET_HOUR = 5;
const RETAIL_INVENTORY_RESET_MINUTE = 30;

export async function scheduleInventoryReset(storeId, inventoryType) {
  const resetHour = inventoryType === 'food'
    ? FOOD_INVENTORY_RESET_HOUR
    : RETAIL_INVENTORY_RESET_HOUR;
  const resetMinute = inventoryType === 'food'
    ? FOOD_INVENTORY_RESET_MINUTE
    : RETAIL_INVENTORY_RESET_MINUTE;

  await scheduleDailyReset(storeId, {
    hour: resetHour,
    minute: resetMinute,
    timezone: 'Asia/Manila',
  });

  return { resetHour, resetMinute };
}

export function getNextResetTime(inventoryType) {
  const now = new Date();
  const resetHour = inventoryType === 'food'
    ? FOOD_INVENTORY_RESET_HOUR
    : RETAIL_INVENTORY_RESET_HOUR;
  
  const next = new Date(now);
  next.setHours(resetHour, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

// Send push notification to merchant when item stock falls below reorder level
export async function checkLowStock(storeId, items) {
  const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);
  if (lowStockItems.length > 0) {
    const itemNames = lowStockItems.map(i => i.name).join(', ');
    await sendPushNotification(storeId, {
      title: 'Low Stock Alert',
      body: 'The following items are running low: ' + itemNames + '. Please restock soon.',
      type: 'low_stock',
    });
  }
  return lowStockItems;
}
