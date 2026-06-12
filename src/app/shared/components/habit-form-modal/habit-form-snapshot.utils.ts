import type { Weekday } from '../../../core/models/weekday.model';

export interface HabitFormSnapshot {
  scheduleDays: Weekday[];
  formValue: unknown;
}

export function captureHabitFormSnapshot(
  scheduleDays: Weekday[],
  formValue: unknown,
): HabitFormSnapshot {
  return {
    scheduleDays: [...scheduleDays],
    formValue: structuredClone(formValue),
  };
}

export function isHabitFormSnapshotDirty(
  baseline: HabitFormSnapshot,
  current: HabitFormSnapshot,
): boolean {
  return JSON.stringify(baseline) !== JSON.stringify(current);
}
