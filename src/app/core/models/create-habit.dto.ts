import type { MotivationItem, TriggerItem } from './habit-slot.model';
import type { HabitWeekdayGoal } from './habit-weekday-goal.model';
import type { Weekday } from './weekday.model';

export interface CreateHabitDto {
  name: string;
  generalGoal: string;
  dynamicGoals: boolean;
  weekdayGoals: HabitWeekdayGoal[];
  category: string;
  triggers: TriggerItem[];
  motivations: MotivationItem[];
  minimumAction: string;
  scheduleDays: Weekday[];
  time: string;
  showOnToday?: boolean;
}
