import type { HabitWeekdayGoal } from './habit-weekday-goal.model';
import type { Weekday } from './weekday.model';

export interface UpdateHabitDto {
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
  optionalReminder: string;
  showOnToday?: boolean;
}
