import { formatCurrency, formatDate, formatTransactionId } from '../utils/formatters';

describe('formatCurrency', () => {
  test('formats PHP currency', () => {
    expect(formatCurrency(1000)).toBe('PHP 1,000.00');
  });
  test('formats with custom symbol', () => {
    expect(formatCurrency(500, 'USD')).toBe('USD 500.00');
  });
  test('handles zero', () => {
    expect(formatCurrency(0)).toBe('PHP 0.00');
  });
});

describe('formatDate', () => {
  test('formats date correctly', () => {
    expect(formatDate('2026-03-26')).toBe('2026-03-26');
  });
});

describe('formatTransactionId', () => {
  test('pads transaction ID', () => {
    expect(formatTransactionId(123)).toBe('TXN-00000123');
  });
});
