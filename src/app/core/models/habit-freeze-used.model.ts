/** Evento append-only: freeze consumido automaticamente em dia agendado (RN-08). */
export interface HabitFreezeUsed {
  id: string;
  habitId: string;
  /** Dia agendado coberto (YYYY-MM-DD local). */
  dateKey: string;
  /** ISO 8601 — momento em que o freeze foi registrado. */
  usedAt: string;
}
