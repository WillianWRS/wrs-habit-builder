import type { HabitWeekdayGoal } from './habit-weekday-goal.model';
import type { Weekday } from './weekday.model';

export const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Data local (YYYY-MM-DD) em que cada dia da semana passou a contar no hábito. */
export type ScheduleDaySince = Partial<Record<Weekday, string>>;

export interface Habit {
  id: string;
  name: string;
  metaGeral: string;
  metasDinamicas: boolean;
  weekdayGoals: HabitWeekdayGoal[];
  category: string;
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
  minimumAction: string;
  scheduleDays: Weekday[];
  scheduleDaySince: ScheduleDaySince;
  optionalReminder: string;
  archived: boolean;
  createdAt: string;
  showOnToday: boolean;
}
