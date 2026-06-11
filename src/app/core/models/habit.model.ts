import type { HabitWeekdayGoal } from './habit-weekday-goal.model';
import type { MotivationItem, TriggerItem } from './habit-slot.model';
import type { Weekday } from './weekday.model';

export const ALL_WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Data local (YYYY-MM-DD) em que cada dia da semana passou a contar no hábito. */
export type ScheduleDaySince = Partial<Record<Weekday, string>>;

export interface Habit {
  id: string;
  name: string;
  generalGoal: string;
  dynamicGoals: boolean;
  weekdayGoals: HabitWeekdayGoal[];
  category: string;
  triggers: TriggerItem[];
  motivations: MotivationItem[];
  minimumAction: string;
  scheduleDays: Weekday[];
  scheduleDaySince: ScheduleDaySince;
  optionalReminder: string;
  archived: boolean;
  createdAt: string;
  showOnToday: boolean;
}
