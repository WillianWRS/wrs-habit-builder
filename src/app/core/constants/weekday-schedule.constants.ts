import type { Weekday } from '../models/weekday.model';

export interface WeekdayScheduleItem {
  weekday: Weekday;
  label: string;
  fullLabel: string;
}

export const WEEKDAY_SCHEDULE_ITEMS: ReadonlyArray<WeekdayScheduleItem> = [
  { weekday: 0, label: 'D', fullLabel: 'Domingo' },
  { weekday: 1, label: 'S', fullLabel: 'Segunda' },
  { weekday: 2, label: 'T', fullLabel: 'Terça' },
  { weekday: 3, label: 'Q', fullLabel: 'Quarta' },
  { weekday: 4, label: 'Q', fullLabel: 'Quinta' },
  { weekday: 5, label: 'S', fullLabel: 'Sexta' },
  { weekday: 6, label: 'S', fullLabel: 'Sábado' },
];
