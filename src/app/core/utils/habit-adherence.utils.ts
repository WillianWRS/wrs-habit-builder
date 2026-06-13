import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import { addDays, parseDateKey, toDateKey } from './date.utils';
import { getHabitCreatedDateKey, isExpectedScheduleDay } from './habit-streak.utils';

export interface HabitAdherenceWindow {
  windowDays: 7 | 30;
  windowLabel: string;
  trackedDays: number;
  expectedDays: number;
  completedDays: number;
  percentage: number;
}

export interface HabitAdherenceSnapshot {
  sevenDays: HabitAdherenceWindow;
  thirtyDays: HabitAdherenceWindow;
}

export function resolveAdherenceWindowLabel(requestedWindowDays: 7 | 30): string {
  return `${requestedWindowDays}d`;
}

export function computeHabitAdherence(
  habit: Habit,
  completions: HabitCompletion[],
  windowDays: 7 | 30,
  referenceDate: Date = new Date(),
): HabitAdherenceWindow {
  const endKey = toDateKey(referenceDate);
  const requestedStartKey = toDateKey(addDays(referenceDate, -(windowDays - 1)));
  const createdAtKey = getHabitCreatedDateKey(habit);
  const effectiveStartKey =
    requestedStartKey > createdAtKey ? requestedStartKey : createdAtKey;

  if (effectiveStartKey > endKey) {
    return {
      windowDays,
      windowLabel: resolveAdherenceWindowLabel(windowDays),
      trackedDays: 0,
      expectedDays: 0,
      completedDays: 0,
      percentage: 0,
    };
  }

  const completionDateKeys = new Set(
    completions
      .filter((completion) => completion.habitId === habit.id)
      .map((completion) => completion.completedOn),
  );

  let expectedDays = 0;
  let completedDays = 0;
  let trackedDays = 0;
  let cursor = parseDateKey(effectiveStartKey);
  const endDate = parseDateKey(endKey);

  while (cursor <= endDate) {
    const dateKey = toDateKey(cursor);
    trackedDays += 1;

    if (isExpectedScheduleDay(habit, dateKey)) {
      expectedDays += 1;

      if (completionDateKeys.has(dateKey)) {
        completedDays += 1;
      }
    }

    cursor = addDays(cursor, 1);
  }

  return {
    windowDays,
    windowLabel: resolveAdherenceWindowLabel(windowDays),
    trackedDays,
    expectedDays,
    completedDays,
    percentage:
      expectedDays > 0 ? Math.round((completedDays / expectedDays) * 100) : 0,
  };
}

export function computeHabitAdherenceSnapshot(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDate: Date = new Date(),
): HabitAdherenceSnapshot {
  return {
    sevenDays: computeHabitAdherence(habit, completions, 7, referenceDate),
    thirtyDays: computeHabitAdherence(habit, completions, 30, referenceDate),
  };
}
