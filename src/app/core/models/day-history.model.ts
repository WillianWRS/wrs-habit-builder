export type DayHistoryEntryStatus = 'done' | 'not_done';

export interface DayHistoryEntry {
  habitId: string;
  reminderDisplay: string;
  title: string;
  status: DayHistoryEntryStatus;
}

export interface DayHistorySnapshot {
  dateKey: string;
  dateLabel: string;
  entries: DayHistoryEntry[];
  hasExpectedHabits: boolean;
}

export type MonthHeatmapCellKind = 'padding' | 'day';

export interface MonthHeatmapCell {
  kind: MonthHeatmapCellKind;
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  completionCount: number;
  expectedCount: number;
  /** Intensidade visual do círculo: 0 = sem círculo, 1–4 escalonado, 5 = 5+ conclusões. */
  intensity: 0 | 1 | 2 | 3 | 4 | 5;
  isFuture: boolean;
  isClickable: boolean;
  hasExpectedHabits: boolean;
}
