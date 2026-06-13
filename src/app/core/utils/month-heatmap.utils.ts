import type { MonthHeatmapCell } from '../models/day-history.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import type { Habit } from '../models/habit.model';
import { addDays, parseDateKey, toDateKey } from './date.utils';
import { getExpectedHabitsForDate } from './day-history.utils';
import { isExpectedScheduleDay } from './habit-streak.utils';

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

const MONTH_GRID_WEEKS = 6;
const MONTH_GRID_DAYS = MONTH_GRID_WEEKS * 7;

function getMonthGridBounds(
  year: number,
  month: number,
): { gridStart: Date; gridEnd: Date } {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  const gridEnd = addDays(gridStart, MONTH_GRID_DAYS - 1);

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

export function buildHabitMonthHeatmapCells(
  year: number,
  month: number,
  habit: Habit,
  completions: HabitCompletion[],
  freezeUsed: HabitFreezeUsed[],
  todayKey: string,
): MonthHeatmapCell[] {
  const { gridStart, gridEnd } = getMonthGridBounds(year, month);
  const cells: MonthHeatmapCell[] = [];
  const habitCompletionKeys = new Set(
    completions
      .filter((completion) => completion.habitId === habit.id)
      .map((completion) => completion.completedOn),
  );
  const habitFreezeKeys = new Set(
    freezeUsed
      .filter((event) => event.habitId === habit.id)
      .map((event) => event.dateKey),
  );

  for (
    let cursor = new Date(gridStart);
    cursor <= gridEnd;
    cursor = addDays(cursor, 1)
  ) {
    const dateKey = toDateKey(cursor);
    const inCurrentMonth = cursor.getMonth() === month;
    const isFuture = dateKey > todayKey;
    const expected = isExpectedScheduleDay(habit, dateKey);
    const completed = expected && habitCompletionKeys.has(dateKey);
    const protectedByFreeze =
      expected && !completed && habitFreezeKeys.has(dateKey);

    const status = isFuture
      ? 'future'
      : completed
        ? 'done'
        : protectedByFreeze
          ? 'protected'
          : expected
            ? 'missed'
            : 'skipped';

    cells.push({
      kind: inCurrentMonth ? 'day' : 'padding',
      dateKey,
      dayNumber: cursor.getDate(),
      inCurrentMonth,
      completionCount: completed ? 1 : 0,
      expectedCount: expected ? 1 : 0,
      intensity: completed ? 3 : protectedByFreeze ? 1 : 0,
      status,
      isFuture,
      isClickable: inCurrentMonth && !isFuture,
      hasExpectedHabits: expected,
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
