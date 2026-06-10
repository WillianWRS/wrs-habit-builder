import { describe, expect, it } from 'vitest';
import {
  formatTodayHeaderLabel,
  getMsUntilNextMidnight,
  toDateKey,
} from './date.utils';

describe('getMsUntilNextMidnight', () => {
  it('retorna milissegundos até 00:00 do dia seguinte', () => {
    const from = new Date(2026, 5, 10, 15, 30, 0);
    const ms = getMsUntilNextMidnight(from);

    expect(ms).toBe(8 * 60 * 60 * 1000 + 30 * 60 * 1000);
  });
});

describe('formatTodayHeaderLabel', () => {
  const date = new Date(2026, 5, 10);

  it('usa weekday e mês longos no desktop', () => {
    const label = formatTodayHeaderLabel(date, false);

    expect(label).toContain('quarta-feira');
    expect(label).toContain('junho');
  });

  it('usa weekday e mês abreviados no mobile', () => {
    const label = formatTodayHeaderLabel(date, true);

    expect(label).toMatch(/qua\.?/i);
    expect(label).toMatch(/jun\.?/i);
    expect(label).not.toContain('quarta-feira');
    expect(label).not.toContain('junho');
  });
});

describe('toDateKey', () => {
  it('formata data local como YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 5, 10))).toBe('2026-06-10');
  });
});
