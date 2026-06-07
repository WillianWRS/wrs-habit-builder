export type HabitCardAccent = 'default' | 'physical' | 'wellness';

/** View model consumido pelo card na tela Hoje. */
export interface TodayHabitCard {
  id: string;
  name: string;
  time: string;
  category: string;
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
  minimumAction: string;
  dayCount: number;
  completed: boolean;
  accent: HabitCardAccent;
  previousDayCompleted: boolean;
}
