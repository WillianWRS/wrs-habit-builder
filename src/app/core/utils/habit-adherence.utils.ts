import type { HabitCompletion } from '../models/habit-completion.model';
import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import type { Habit } from '../models/habit.model';
import { addDays, parseDateKey, toDateKey } from './date.utils';
import {
  computeCurrentStreak,
  getHabitCreatedDateKey,
  isExpectedScheduleDay,
} from './habit-streak.utils';
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

interface HabitAdherenceCounts {
  trackedDays: number;
  expectedDays: number;
  completedDays: number;
  percentage: number;
}

function computeHabitAdherenceBetween(
  habit: Habit,
  completions: HabitCompletion[],
  startKey: string,
  endKey: string,
): HabitAdherenceCounts {
  if (startKey > endKey) {
    return {
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
  let cursor = parseDateKey(startKey);
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
    trackedDays,
    expectedDays,
    completedDays,
    percentage:
      expectedDays > 0 ? Math.round((completedDays / expectedDays) * 100) : 0,
  };
}

export interface HabitAdherenceTiedHabit {
  name: string;
  value: string;
}

export interface HabitAdherenceHighlightItem {
  label: string;
  value: string;
  /** Demais hábitos empatados na mesma adesão (exclui o nome exibido em `label`). */
  tiedHabits: HabitAdherenceTiedHabit[];
}

export interface HabitAdherenceHighlights {
  hasEnoughData: boolean;
  topHabit: HabitAdherenceHighlightItem;
  lowHabit: HabitAdherenceHighlightItem;
}

export function computeHabitAdherenceHighlights(
  habits: Habit[],
  completions: HabitCompletion[],
  referenceDate: Date = new Date(),
  freezeEvents: HabitFreezeUsed[] = [],
): HabitAdherenceHighlights {
  const empty: HabitAdherenceHighlights = {
    hasEnoughData: false,
    topHabit: { label: '-', value: '-', tiedHabits: [] },
    lowHabit: { label: '-', value: '-', tiedHabits: [] },
  };

  const activeHabits = habits.filter((habit) => !habit.archived);

  if (activeHabits.length === 0) {
    return empty;
  }

  const endKey = toDateKey(referenceDate);
  const rated = activeHabits
    .map((habit) => {
      const startKey = getHabitCreatedDateKey(habit);
      const stats = computeHabitAdherenceBetween(habit, completions, startKey, endKey);

      if (stats.expectedDays === 0) {
        return null;
      }

      return {
        name: habit.name,
        createdAtKey: startKey,
        currentStreak: computeCurrentStreak(
          habit,
          completions,
          freezeEvents,
          referenceDate,
        ),
        ...stats,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (rated.length === 0) {
    return empty;
  }

  const topHabit = pickTopAdherenceHabit(rated);
  const lowHabit = rated.reduce((worst, current) =>
    current.percentage < worst.percentage ? current : worst,
  );

  const formatValue = (entry: (typeof rated)[number]) =>
    `${entry.completedDays}/${entry.expectedDays} (${entry.percentage}%)`;

  const buildHighlightItem = (
    preferred: (typeof rated)[number],
    targetPercentage: number,
  ): HabitAdherenceHighlightItem => {
    const tiedHabits = rated
      .filter((entry) => entry.percentage === targetPercentage && entry.name !== preferred.name)
      .map((entry) => ({
        name: entry.name,
        value: formatValue(entry),
      }));

    return {
      label: preferred.name,
      value: formatValue(preferred),
      tiedHabits,
    };
  };

  return {
    hasEnoughData: true,
    topHabit: buildHighlightItem(topHabit, topHabit.percentage),
    lowHabit: buildHighlightItem(lowHabit, lowHabit.percentage),
  };
}

type RatedHabitHighlight = {
  name: string;
  createdAtKey: string;
  currentStreak: number;
  trackedDays: number;
  expectedDays: number;
  completedDays: number;
  percentage: number;
};

function pickTopAdherenceHabit(rated: RatedHabitHighlight[]): RatedHabitHighlight {
  const maxPercentage = Math.max(...rated.map((entry) => entry.percentage));
  const candidates = rated.filter((entry) => entry.percentage === maxPercentage);

  return candidates.reduce((best, current) => {
    if (current.currentStreak > best.currentStreak) {
      return current;
    }

    if (current.currentStreak < best.currentStreak) {
      return best;
    }

    if (current.createdAtKey < best.createdAtKey) {
      return current;
    }

    return best;
  });
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

  const stats = computeHabitAdherenceBetween(
    habit,
    completions,
    effectiveStartKey,
    endKey,
  );

  return {
    windowDays,
    windowLabel: resolveAdherenceWindowLabel(windowDays),
    ...stats,
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
