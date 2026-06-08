import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type { Weekday } from '../models/weekday.model';
import { addDays, getWeekday, parseDateKey, toDateKey } from './date.utils';

export const STREAK_MISS_TOLERANCE = 7;

export interface HabitStreakMetrics {
  dayCount: number;
  missCount: number;
  isDayOne: boolean;
  shouldReset: boolean;
}

export function buildInitialScheduleDaySince(
  scheduleDays: Weekday[],
  dateKey: string,
): Partial<Record<Weekday, string>> {
  return Object.fromEntries(
    scheduleDays.map((weekday) => [weekday, dateKey]),
  ) as Partial<Record<Weekday, string>>;
}

export function mergeScheduleDaySince(
  existing: Partial<Record<Weekday, string>>,
  previousDays: Weekday[],
  newDays: Weekday[],
  todayKey: string,
): Partial<Record<Weekday, string>> {
  const merged = { ...existing };

  for (const weekday of newDays) {
    if (!previousDays.includes(weekday)) {
      merged[weekday] = todayKey;
    }
  }

  return merged;
}

function getHabitCompletions(
  habitId: string,
  completions: HabitCompletion[],
): HabitCompletion[] {
  return completions.filter((completion) => completion.habitId === habitId);
}

function getCompletionDateKeys(
  habitId: string,
  completions: HabitCompletion[],
): Set<string> {
  return new Set(
    getHabitCompletions(habitId, completions).map(
      (completion) => completion.completedOn,
    ),
  );
}

function getLastCompletionDateKey(
  habitId: string,
  completions: HabitCompletion[],
): string | null {
  const habitCompletions = getHabitCompletions(habitId, completions);

  if (habitCompletions.length === 0) {
    return null;
  }

  return habitCompletions
    .map((completion) => completion.completedOn)
    .sort()
    .at(-1)!;
}

export function isExpectedScheduleDay(habit: Habit, dateKey: string): boolean {
  const weekday = getWeekday(parseDateKey(dateKey));

  if (!habit.scheduleDays.includes(weekday)) {
    return false;
  }

  const activeSince = habit.scheduleDaySince[weekday];

  if (!activeSince) {
    return false;
  }

  return dateKey >= activeSince;
}

function* iterateDateKeysBefore(
  startExclusive: string,
  endExclusive: string,
): Generator<string> {
  let cursor = addDays(parseDateKey(startExclusive), 1);
  const end = parseDateKey(endExclusive);

  while (cursor < end) {
    yield toDateKey(cursor);
    cursor = addDays(cursor, 1);
  }
}

export function countMissedExpectedDays(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDate: Date = new Date(),
): number {
  const habitCompletions = getHabitCompletions(habit.id, completions);

  if (habitCompletions.length === 0) {
    return 0;
  }

  const todayKey = toDateKey(referenceDate);
  const lastCompletionKey = getLastCompletionDateKey(habit.id, completions);

  if (!lastCompletionKey || lastCompletionKey >= todayKey) {
    return 0;
  }

  const completionDates = getCompletionDateKeys(habit.id, completions);
  let misses = 0;

  for (const dateKey of iterateDateKeysBefore(lastCompletionKey, todayKey)) {
    if (!isExpectedScheduleDay(habit, dateKey)) {
      continue;
    }

    if (!completionDates.has(dateKey)) {
      misses += 1;
    }
  }

  return misses;
}

export function computeHabitStreakMetrics(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDate: Date = new Date(),
): HabitStreakMetrics {
  const habitCompletions = getHabitCompletions(habit.id, completions);
  const dayCount = habitCompletions.length;
  const isDayOne = dayCount === 0;
  const missCount = countMissedExpectedDays(habit, completions, referenceDate);

  return {
    dayCount,
    missCount,
    isDayOne,
    shouldReset: !isDayOne && missCount >= STREAK_MISS_TOLERANCE,
  };
}

export function getHabitIdsToReset(
  habits: Habit[],
  completions: HabitCompletion[],
  referenceDate: Date = new Date(),
): string[] {
  return habits
    .filter((habit) =>
      computeHabitStreakMetrics(habit, completions, referenceDate).shouldReset,
    )
    .map((habit) => habit.id);
}
