import type { Weekday } from '../models/weekday.model';

/** "YYYY-MM-DD" na timezone local */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);

  return new Date(y, m - 1, d);
}

export function addDays(date: Date, delta: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);

  return next;
}

export function getWeekday(date: Date = new Date()): Weekday {
  return date.getDay() as Weekday;
}
