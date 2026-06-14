import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type { Weekday } from '../models/weekday.model';
import { addDays, toDateKey } from './date.utils';

export interface WeeklySummaryItem {
  label: string;
  value: string;
}

export interface WeeklySummaryResult {
  hasEnoughData: boolean;
  bestDay: WeeklySummaryItem;
  worstDay: WeeklySummaryItem;
  topHabit: WeeklySummaryItem;
  lowHabit: WeeklySummaryItem;
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function computeWeeklySummary(
  habits: Habit[],
  completions: HabitCompletion[],
  referenceDate: Date,
): WeeklySummaryResult {
  const activeHabits = habits.filter((habit) => !habit.archived);
  const dailyStats = new Map<string, { expected: number; completed: number; weekday: number }>();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = addDays(referenceDate, -offset);
    const dateKey = toDateKey(date);
    dailyStats.set(dateKey, {
      expected: 0,
      completed: 0,
      weekday: date.getDay(),
    });
  }

  const completionSet = new Set(
    completions.map((entry) => `${entry.habitId}|${entry.completedOn}`),
  );

  const habitStats = new Map<string, { name: string; expected: number; completed: number }>();

  for (const habit of activeHabits) {
    habitStats.set(habit.id, { name: habit.name, expected: 0, completed: 0 });

    for (const [dateKey, daily] of dailyStats.entries()) {
      const date = new Date(`${dateKey}T12:00:00`);
      const weekday = date.getDay();

      if (!habit.scheduleDays.includes(weekday as Weekday)) {
        continue;
      }

      daily.expected += 1;
      const habitStat = habitStats.get(habit.id)!;
      habitStat.expected += 1;

      if (completionSet.has(`${habit.id}|${dateKey}`)) {
        daily.completed += 1;
        habitStat.completed += 1;
      }
    }
  }

  const hasEnoughData = Array.from(dailyStats.values()).some((day) => day.expected > 0);
  if (!hasEnoughData || habitStats.size === 0) {
    return {
      hasEnoughData: false,
      bestDay: { label: '-', value: '-' },
      worstDay: { label: '-', value: '-' },
      topHabit: { label: '-', value: '-' },
      lowHabit: { label: '-', value: '-' },
    };
  }

  const bestDay = pickByRate(Array.from(dailyStats.values()), true);
  const worstDay = pickByRate(Array.from(dailyStats.values()), false);
  const topHabit = pickByRate(Array.from(habitStats.values()), true);
  const lowHabit = pickByRate(Array.from(habitStats.values()), false);

  return {
    hasEnoughData,
    bestDay: {
      label: WEEKDAY_LABELS[bestDay.weekday] ?? '-',
      value: `${bestDay.completed}/${bestDay.expected} (${bestDay.rate}%)`,
    },
    worstDay: {
      label: WEEKDAY_LABELS[worstDay.weekday] ?? '-',
      value: `${worstDay.completed}/${worstDay.expected} (${worstDay.rate}%)`,
    },
    topHabit: {
      label: topHabit.name,
      value: `${topHabit.completed}/${topHabit.expected} (${topHabit.rate}%)`,
    },
    lowHabit: {
      label: lowHabit.name,
      value: `${lowHabit.completed}/${lowHabit.expected} (${lowHabit.rate}%)`,
    },
  };
}

interface RatedEntry {
  expected: number;
  completed: number;
  rate: number;
}

function pickByRate<T extends { expected: number; completed: number }>(
  entries: T[],
  highest: boolean,
): T & RatedEntry {
  const rated = entries
    .filter((entry) => entry.expected > 0)
    .map((entry) => ({
      ...entry,
      rate: Math.round((entry.completed / entry.expected) * 100),
    }));

  const fallback = rated[0] ?? ({ expected: 0, completed: 0, rate: 0 } as T & RatedEntry);
  if (rated.length === 0) {
    return fallback;
  }

  return rated.reduce((best, current) => {
    if (highest) {
      return current.rate > best.rate ? current : best;
    }
    return current.rate < best.rate ? current : best;
  });
}
