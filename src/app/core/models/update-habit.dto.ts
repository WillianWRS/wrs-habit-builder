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
  trigger3: string;
  trigger1Visible: boolean;
  trigger2Visible: boolean;
  trigger3Visible: boolean;
  motivation1: string;
  motivation2: string;
  motivation3: string;
  motivation1Visible: boolean;
  motivation2Visible: boolean;
  motivation3Visible: boolean;
  minimumAction: string;
  scheduleDays: Weekday[];
  optionalReminder: string;
  showOnToday?: boolean;
}
