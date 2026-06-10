import type { MonthHeatmapCell } from '../models/day-history.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import { addDays, parseDateKey, toDateKey } from './date.utils';
import { getExpectedHabitsForDate } from './day-history.utils';

export function resolveHeatmapIntensity(
  completionCount: number,
  expectedCount: number,
): MonthHeatmapCell['intensity'] {
  if (expectedCount === 0 || completionCount <= 0) {
    return 0;
  }

  if (completionCount >= expectedCount) {
    return 3;
  }

  if (completionCount * 2 >= expectedCount) {
    return 2;
  }

  return 1;
}

export function countExpectedCompletionsForDate(
  habits: Habit[],
  completions: HabitCompletion[],
  dateKey: string,
): { completionCount: number; expectedCount: number } {
  const expectedHabits = getExpectedHabitsForDate(habits, dateKey);
  const expectedIds = new Set(expectedHabits.map((habit) => habit.id));
  const completionCount = completions.filter(
    (completion) =>
      completion.completedOn === dateKey && expectedIds.has(completion.habitId),
  ).length;

  return {
    completionCount,
    expectedCount: expectedHabits.length,
  };
}

function getMonthGridBounds(
  year: number,
  month: number,
): { gridStart: Date; gridEnd: Date } {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  const gridEnd = addDays(lastOfMonth, 6 - lastOfMonth.getDay());

  return { gridStart, gridEnd };
}

export function buildMonthHeatmapCells(
  year: number,
  month: number,
  habits: Habit[],
  completions: HabitCompletion[],
  todayKey: string,
): MonthHeatmapCell[] {
  const { gridStart, gridEnd } = getMonthGridBounds(year, month);
  const cells: MonthHeatmapCell[] = [];

  for (
    let cursor = new Date(gridStart);
    cursor <= gridEnd;
    cursor = addDays(cursor, 1)
  ) {
    const dateKey = toDateKey(cursor);
    const inCurrentMonth = cursor.getMonth() === month;
    const { completionCount, expectedCount } = countExpectedCompletionsForDate(
      habits,
      completions,
      dateKey,
    );
    const isFuture = dateKey > todayKey;
    const hasExpectedHabits = expectedCount > 0;

    cells.push({
      kind: inCurrentMonth ? 'day' : 'padding',
      dateKey,
      dayNumber: cursor.getDate(),
      inCurrentMonth,
      completionCount,
      expectedCount,
      intensity: resolveHeatmapIntensity(completionCount, expectedCount),
      isFuture,
      isClickable: inCurrentMonth && !isFuture,
      hasExpectedHabits,
    });
  }

  return cells;
}

export function formatMonthYearLabel(year: number, month: number): string {
  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

export function isSameMonthKey(
  year: number,
  month: number,
  dateKey: string,
): boolean {
  const date = parseDateKey(dateKey);

  return date.getFullYear() === year && date.getMonth() === month;
}
