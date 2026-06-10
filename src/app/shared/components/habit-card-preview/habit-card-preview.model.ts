import type { HabitWeekdayGoal } from '../../../core/models/habit-weekday-goal.model';
import type { Weekday } from '../../../core/models/weekday.model';

/** Estado do formulário consumido pela pré-visualização do card. */
export interface HabitCardPreviewFormState {
  name: string;
  category: string;
  scheduleDays: Weekday[];
  metasDinamicas: boolean;
  metaGeral: string;
  minimumAction: string;
  optionalReminder: string;
  weekdayGoals: HabitWeekdayGoal[];
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
}
