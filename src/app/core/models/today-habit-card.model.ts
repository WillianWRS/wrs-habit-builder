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
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
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
