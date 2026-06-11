/** Níveis 0–4 conforme dias de sequência: 0 · 15 · 35 · 50 · 66+ */
export type StreakTier = 0 | 1 | 2 | 3 | 4;

const STREAK_TIER_THRESHOLDS = [0, 15, 35, 50, 66] as const;

export function getStreakTier(dayCount: number): StreakTier {
  if (dayCount >= STREAK_TIER_THRESHOLDS[4]) return 4;
  if (dayCount >= STREAK_TIER_THRESHOLDS[3]) return 3;
  if (dayCount >= STREAK_TIER_THRESHOLDS[2]) return 2;
  if (dayCount >= STREAK_TIER_THRESHOLDS[1]) return 1;
  return 0;
}

export const STREAK_TIER_MESSAGES: Record<
  StreakTier,
  { title: string; subtitle: string }
> = {
  0: { title: 'Sequência iniciada', subtitle: 'É só o começo' },
  1: { title: 'Sequência boa', subtitle: 'Podemos mais' },
  2: { title: 'Sequência ótima', subtitle: 'Vamos pra cima' },
  3: { title: 'Sequência excelente', subtitle: 'Não desista agora' },
  4: { title: 'Sequência perfeita', subtitle: 'Manteremos o topo' },
};

export const DAY_ONE_MESSAGE = {
  title: 'Dia um',
  subtitle: 'Marque hoje para começar a sequência',
} as const;
