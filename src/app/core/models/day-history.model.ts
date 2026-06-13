export type DayHistoryEntryStatus = 'done' | 'not_done' | 'protected';

export interface DayHistoryEntry {
  habitId: string;
  reminderDisplay: string;
  name: string;
  meta: string;
  status: DayHistoryEntryStatus;
}

export interface DayHistorySnapshot {
  dateKey: string;
  dateLabel: string;
  entries: DayHistoryEntry[];
  hasExpectedHabits: boolean;
}

export type MonthHeatmapCellKind = 'padding' | 'day';
export type MonthHeatmapCellStatus =
  | 'done'
  | 'missed'
  | 'skipped'
  | 'protected'
  | 'future';

export interface MonthHeatmapCell {
  kind: MonthHeatmapCellKind;
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  completionCount: number;
  expectedCount: number;
  /** Intensidade visual: 0 = sem destaque, 1 = baixa, 2 = média, 3 = todos concluídos. */
  intensity: 0 | 1 | 2 | 3;
  /** Status opcional usado no heatmap individual por hábito. */
  status?: MonthHeatmapCellStatus;
  isFuture: boolean;
  isClickable: boolean;
  hasExpectedHabits: boolean;
}
