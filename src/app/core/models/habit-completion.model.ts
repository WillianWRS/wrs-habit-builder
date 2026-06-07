export interface HabitCompletion {
  id: string;
  habitId: string;
  /** "YYYY-MM-DD" na timezone local do usuário */
  completedOn: string;
}
