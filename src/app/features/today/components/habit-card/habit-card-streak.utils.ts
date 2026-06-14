/** Níveis 0–4 conforme dias de sequência: 0 · 7 · 21 · 30 · 66+ */
export type StreakTier = 0 | 1 | 2 | 3 | 4;

export const STREAK_TIER_THRESHOLDS = [0, 7, 21, 30, 66] as const;

export function getStreakTier(dayCount: number): StreakTier {
  if (dayCount >= STREAK_TIER_THRESHOLDS[4]) return 4;
  if (dayCount >= STREAK_TIER_THRESHOLDS[3]) return 3;
  if (dayCount >= STREAK_TIER_THRESHOLDS[2]) return 2;
  if (dayCount >= STREAK_TIER_THRESHOLDS[1]) return 1;
  return 0;
}

export const STREAK_TIER_TITLES: Record<StreakTier, string> = {
  0: 'Começando',
  1: 'Bom',
  2: 'Ótimo',
  3: 'Excelente',
  4: 'Perfeito',
};

export const DAY_ONE_TITLE = 'Dia um';

/** Duração do fade ao trocar o título de sequência no marco (ms). */
export const STREAK_TITLE_SWAP_FADE_MS = 1000;

/** Duração da celebração ao cruzar um marco de sequência (ms). */
export const MILESTONE_CELEBRATION_MS = 2000;

export function didAdvanceStreakTier(
  previousDayCount: number,
  nextDayCount: number,
): boolean {
  return getStreakTier(nextDayCount) > getStreakTier(previousDayCount);
}

export function getStreakTierTitle(tier: StreakTier): string {
  return STREAK_TIER_TITLES[tier];
}
