// src/lib/utils.ts

/**
 * Format a date string (YYYY-MM-DD) to a readable label like "January 5, 2026"
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  });
}

/**
 * Format a month key (YYYY-MM) to a label like "January 2026"
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long' });
}

/**
 * Get today's date in YYYY-MM-DD format (local time, Manila)
 */
export function getTodayLocal(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

/**
 * Extract month key (YYYY-MM) from a date string
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/**
 * Check if a given date string is a weekday (Mon–Fri)
 */
export function isWeekday(dateStr: string): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  return day >= 1 && day <= 5;
}
