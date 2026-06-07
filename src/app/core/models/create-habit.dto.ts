export interface CreateHabitDto {
  name: string;
  category: string;
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
  minimumAction: string;
  optionalReminder: string;
  showOnToday?: boolean;
}
