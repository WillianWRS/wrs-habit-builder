import type { HabitWeekdayGoal } from './habit-weekday-goal.model';
import type { Weekday } from './weekday.model';

/** Definição completa de um hábito no pool demonstrativo. */
export interface DemoHabitPoolEntry {
  name: string;
  category: string;
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
  metaGeral: string;
  metasDinamicas: boolean;
  weekdayGoals: HabitWeekdayGoal[];
  minimumAction: string;
  optionalReminder: string;
  scheduleDays: Weekday[];
}
