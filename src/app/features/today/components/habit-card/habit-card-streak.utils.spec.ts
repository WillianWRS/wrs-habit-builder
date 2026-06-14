import {
  didAdvanceStreakTier,
  getStreakTier,
  getStreakTierTitle,
  STREAK_TIER_THRESHOLDS,
} from './habit-card-streak.utils';

describe('habit-card-streak.utils', () => {
  describe('getStreakTier', () => {
    it.each([
      [0, 0],
      [6, 0],
      [7, 1],
      [20, 1],
      [21, 2],
      [29, 2],
      [30, 3],
      [65, 3],
      [66, 4],
      [120, 4],
    ] as const)('maps %i days to tier %i', (dayCount, expectedTier) => {
      expect(getStreakTier(dayCount)).toBe(expectedTier);
    });

    it('uses thresholds 0 · 7 · 21 · 30 · 66+', () => {
      expect(STREAK_TIER_THRESHOLDS).toEqual([0, 7, 21, 30, 66]);
    });
  });

  describe('getStreakTierTitle', () => {
    it('returns tier labels in order', () => {
      expect(getStreakTierTitle(0)).toBe('Começando');
      expect(getStreakTierTitle(1)).toBe('Bom');
      expect(getStreakTierTitle(2)).toBe('Ótimo');
      expect(getStreakTierTitle(3)).toBe('Excelente');
      expect(getStreakTierTitle(4)).toBe('Perfeito');
    });
  });

  describe('didAdvanceStreakTier', () => {
    it('detects crossing milestone thresholds on mark', () => {
      expect(didAdvanceStreakTier(6, 7)).toBe(true);
      expect(didAdvanceStreakTier(20, 21)).toBe(true);
      expect(didAdvanceStreakTier(29, 30)).toBe(true);
      expect(didAdvanceStreakTier(65, 66)).toBe(true);
    });

    it('returns false when tier is unchanged', () => {
      expect(didAdvanceStreakTier(0, 1)).toBe(false);
      expect(didAdvanceStreakTier(7, 8)).toBe(false);
      expect(didAdvanceStreakTier(21, 22)).toBe(false);
    });
  });
});
