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

/** Milissegundos até 00:00:00 do dia seguinte na timezone local. */
export function getMsUntilNextMidnight(from: Date = new Date()): number {
  const nextMidnight = new Date(from);
  nextMidnight.setHours(0, 0, 0, 0);
  nextMidnight.setDate(nextMidnight.getDate() + 1);

  return nextMidnight.getTime() - from.getTime();
}

/** Label do cabeçalho "Hoje · …" — compacto em mobile (≤768px). */
export function formatTodayHeaderLabel(date: Date, compact: boolean): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: compact ? 'short' : 'long',
    day: 'numeric',
    month: compact ? 'short' : 'long',
  }).format(date);
}
