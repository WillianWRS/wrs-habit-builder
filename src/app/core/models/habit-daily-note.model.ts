export interface HabitDailyNote {
  id: string;
  habitId: string;
  /** "YYYY-MM-DD" na timezone local do usuário */
  dateKey: string;
  /** Nota livre do dia, limitada a 140 caracteres. */
  note: string;
  updatedAt: string;
}
