import type { HabitCategory } from './habit-category.model';
import type { Weekday } from './weekday.model';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  triggerText: string;
  minimumAction: string;
  scheduleDays: Weekday[];
  optionalReminder?: string;
  archived: boolean;
  createdAt: string;
  /** Indica se o hábito deve aparecer na tela Hoje (respeitando também scheduleDays). */
  showOnToday: boolean;
}
