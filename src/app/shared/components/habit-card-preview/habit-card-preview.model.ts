import type { HabitWeekdayGoal } from '../../../core/models/habit-weekday-goal.model';
import type { MotivationItem, TriggerItem } from '../../../core/models/habit-slot.model';
import type { Weekday } from '../../../core/models/weekday.model';

/** Estado do formulário consumido pela pré-visualização do card. */
export interface HabitCardPreviewFormState {
  name: string;
  category: string;
  scheduleDays: Weekday[];
  dynamicGoals: boolean;
  generalGoal: string;
  minimumAction: string;
  optionalReminder: string;
  weekdayGoals: HabitWeekdayGoal[];
  triggers: TriggerItem[];
  motivations: MotivationItem[];
}
