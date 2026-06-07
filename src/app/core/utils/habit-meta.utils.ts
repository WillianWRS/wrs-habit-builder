import type { Habit } from '../models/habit.model';
import type { HabitWeekdayGoal } from '../models/habit-weekday-goal.model';
import { getWeekday } from './date.utils';

type HabitDisplaySource = Pick<
  Habit,
  | 'metasDinamicas'
  | 'metaGeral'
  | 'minimumAction'
  | 'optionalReminder'
  | 'weekdayGoals'
>;

function resolveWeekdayGoal(
  weekdayGoals: HabitWeekdayGoal[],
  date: Date,
): HabitWeekdayGoal | undefined {
  const weekday = getWeekday(date);
  return weekdayGoals.find((entry) => entry.weekday === weekday);
}

export function resolveHabitDisplayMeta(
  habit: HabitDisplaySource,
  date: Date = new Date(),
): string {
  if (habit.metasDinamicas) {
    return resolveWeekdayGoal(habit.weekdayGoals, date)?.meta.trim() ?? '';
  }

  return habit.metaGeral.trim();
}

export function resolveHabitDisplayMinimumAction(
  habit: HabitDisplaySource,
  date: Date = new Date(),
): string {
  if (habit.metasDinamicas) {
    return (
      resolveWeekdayGoal(habit.weekdayGoals, date)?.minimumAction.trim() ?? ''
    );
  }

  return habit.minimumAction.trim();
}

export function resolveHabitDisplayReminder(
  habit: HabitDisplaySource,
  date: Date = new Date(),
): string {
  if (habit.metasDinamicas) {
    return (
      resolveWeekdayGoal(habit.weekdayGoals, date)?.optionalReminder.trim() ??
      ''
    );
  }

  return habit.optionalReminder.trim();
}

export function formatHabitCardTitle(name: string, meta: string): string {
  const trimmedMeta = meta.trim();

  return trimmedMeta ? `${name} - ${trimmedMeta}` : name;
}
