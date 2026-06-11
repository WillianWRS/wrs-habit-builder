import type { MarqueeItem } from '../utils/habit-trigger-motivation.utils';
import type { Weekday } from './weekday.model';

export type HabitCardAccent = 'default' | 'physical' | 'wellness';

/** View model consumido pelo card na tela Hoje. */
export interface TodayHabitCard {
  id: string;
  name: string;
  displayMeta: string;
  scheduleDays: Weekday[];
  time: string;
  category: string;
  marqueeItems: MarqueeItem[];
  minimumAction: string;
  /** Sequência atual (dias agendados consecutivos). */
  dayCount: number;
  bestStreak: number;
  totalCompletions: number;
  isDayOne: boolean;
  /** Copy de reasseguramento quando freeze foi consumido na semana corrente. */
  freezeReassurance: string | null;
  completed: boolean;
  accent: HabitCardAccent;
}

/** View model consumido na listagem de hábitos. */
export interface HabitListCardView extends TodayHabitCard {
  archived: boolean;
  showOnToday: boolean;
}
