import type { DayHistorySnapshot, DayHistoryEntry } from '../models/day-history.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { HabitDailyNote } from '../models/habit-daily-note.model';
import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
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
  dateKey: string,
  completedHabitIds: Set<string>,
  protectedHabitIds: Set<string>,
  habitNotes: HabitDailyNote[],
): DayHistoryEntry & { sortKey: string } {
  const reminder = resolveHabitDisplayReminder(habit, date).trim();
  const meta = resolveHabitDisplayMeta(habit, date).trim();

  let status: DayHistoryEntry['status'] = 'not_done';

  if (completedHabitIds.has(habit.id)) {
    status = 'done';
  } else if (protectedHabitIds.has(habit.id)) {
    status = 'protected';
  }

  const dailyNote =
    habitNotes.find(
      (entry) => entry.habitId === habit.id && entry.dateKey === dateKey,
    )?.note.trim() ?? '';

  return {
    habitId: habit.id,
    reminderDisplay: reminder || '--:--',
    name: habit.name,
    meta,
    status,
    dailyNote,
    sortKey: reminder || NO_REMINDER_SORT_KEY,
  };
}

export function buildDayHistory(
  dateKey: string,
  habits: Habit[],
  completions: HabitCompletion[],
  freezeUsed: HabitFreezeUsed[] = [],
  habitNotes: HabitDailyNote[] = [],
): DayHistorySnapshot {
  const date = parseDateKey(dateKey);
  const expectedHabits = getExpectedHabitsForDate(habits, dateKey);
  const completedHabitIds = new Set(
    completions
      .filter((completion) => completion.completedOn === dateKey)
      .map((completion) => completion.habitId),
  );
  const protectedHabitIds = new Set(
    freezeUsed
      .filter((event) => event.dateKey === dateKey)
      .map((event) => event.habitId),
  );

  const entries = expectedHabits
    .map((habit) =>
      buildDayHistoryEntry(
        habit,
        date,
        dateKey,
        completedHabitIds,
        protectedHabitIds,
        habitNotes,
      ),
    )
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
