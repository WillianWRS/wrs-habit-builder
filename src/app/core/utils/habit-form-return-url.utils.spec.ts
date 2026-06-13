import { describe, expect, it } from 'vitest';
import {
  buildHabitNewLink,
  buildHabitNewUrl,
  sanitizeHabitFormReturnUrl,
} from './habit-form-return-url.utils';

describe('habit-form-return-url.utils', () => {
  describe('sanitizeHabitFormReturnUrl', () => {
    it('retorna /habits quando returnUrl é /habits', () => {
      expect(sanitizeHabitFormReturnUrl('/habits')).toBe('/habits');
    });

    it('retorna /today quando returnUrl é /today', () => {
      expect(sanitizeHabitFormReturnUrl('/today')).toBe('/today');
    });

    it('retorna /today para valores ausentes ou inválidos', () => {
      expect(sanitizeHabitFormReturnUrl(null)).toBe('/today');
      expect(sanitizeHabitFormReturnUrl(undefined)).toBe('/today');
      expect(sanitizeHabitFormReturnUrl('/evil')).toBe('/today');
      expect(sanitizeHabitFormReturnUrl('https://example.com')).toBe('/today');
    });
  });

  describe('buildHabitNewLink', () => {
    it('monta rota e queryParams para routerLink', () => {
      expect(buildHabitNewLink('/today')).toEqual({
        route: ['/habits', 'new'],
        queryParams: { returnUrl: '/today' },
      });
      expect(buildHabitNewLink('/habits')).toEqual({
        route: ['/habits', 'new'],
        queryParams: { returnUrl: '/habits' },
      });
    });
  });

  describe('buildHabitNewUrl', () => {
    it('monta URL com query returnUrl codificada', () => {
      expect(buildHabitNewUrl('/today')).toBe(
        '/habits/new?returnUrl=%2Ftoday',
      );
      expect(buildHabitNewUrl('/habits')).toBe(
        '/habits/new?returnUrl=%2Fhabits',
      );
    });
  });
});
