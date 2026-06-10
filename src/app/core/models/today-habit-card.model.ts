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
  dayCount: number;
  missCount: number;
  isDayOne: boolean;
  completed: boolean;
  accent: HabitCardAccent;
}

/** View model consumido na listagem de hábitos. */
export interface HabitListCardView extends TodayHabitCard {
  archived: boolean;
  showOnToday: boolean;
}
