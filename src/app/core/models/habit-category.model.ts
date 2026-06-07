export type HabitCategory =
  | 'saude'
  | 'estudo'
  | 'corpo'
  | 'mindfulness'
  | 'outro';

export const HABIT_CATEGORY_LABELS: Record<HabitCategory, string> = {
  saude: 'Saúde',
  estudo: 'Estudo',
  corpo: 'Corpo',
  mindfulness: 'Mindfulness',
  outro: 'Outro',
};
