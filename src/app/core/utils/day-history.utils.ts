import type { DayHistorySnapshot, DayHistoryEntry } from '../models/day-history.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import { parseDateKey } from './date.utils';
import {
  resolveHabitDisplayMeta,
  resolveHabitDisplayReminder,
} from './habit-meta.utils';
import { isExpectedScheduleDay } from './habit-streak.utils';

const NO_REMINDER_SORT_KEY = '99:99';

export function formatHistoryDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getExpectedHabitsForDate(
  habits: Habit[],
  dateKey: string,
): Habit[] {
  return habits.filter(
    (habit) => !habit.archived && isExpectedScheduleDay(habit, dateKey),
  );
}

function buildDayHistoryEntry(
  habit: Habit,
  date: Date,
  completedHabitIds: Set<string>,
): DayHistoryEntry & { sortKey: string } {
  const reminder = resolveHabitDisplayReminder(habit, date).trim();
  const meta = resolveHabitDisplayMeta(habit, date).trim();

  return {
    habitId: habit.id,
    reminderDisplay: reminder || '--:--',
    name: habit.name,
    meta,
    status: completedHabitIds.has(habit.id) ? 'done' : 'not_done',
    sortKey: reminder || NO_REMINDER_SORT_KEY,
  };
}

export function buildDayHistory(
  dateKey: string,
  habits: Habit[],
  completions: HabitCompletion[],
): DayHistorySnapshot {
  const date = parseDateKey(dateKey);
  const expectedHabits = getExpectedHabitsForDate(habits, dateKey);
  const completedHabitIds = new Set(
    completions
      .filter((completion) => completion.completedOn === dateKey)
      .map((completion) => completion.habitId),
  );

  const entries = expectedHabits
    .map((habit) => buildDayHistoryEntry(habit, date, completedHabitIds))
    .sort((left, right) => left.sortKey.localeCompare(right.sortKey))
    .map(({ sortKey, ...entry }) => {
      void sortKey;
      return entry;
    });

  return {
    dateKey,
    dateLabel: formatHistoryDayLabel(date),
    entries,
    hasExpectedHabits: entries.length > 0,
  };
}
