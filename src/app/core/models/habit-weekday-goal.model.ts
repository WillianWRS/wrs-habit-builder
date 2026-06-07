import { ALL_WEEKDAYS } from './habit.model';
import type { Weekday } from './weekday.model';

export interface HabitWeekdayGoal {
  weekday: Weekday;
  meta: string;
  minimumAction: string;
  optionalReminder: string;
}

export function createDefaultWeekdayGoals(): HabitWeekdayGoal[] {
  return ALL_WEEKDAYS.map((weekday) => ({
    weekday,
    meta: '',
    minimumAction: '',
    optionalReminder: '',
  }));
}
