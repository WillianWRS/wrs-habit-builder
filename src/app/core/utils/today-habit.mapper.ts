import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type { HabitCardAccent, TodayHabitCard } from '../models/today-habit-card.model';
import { addDays, parseDateKey, toDateKey } from './date.utils';

function mapAccent(category: string): HabitCardAccent {
  const normalized = category.toLowerCase();

  if (normalized.includes('corpo') || normalized.includes('treino')) {
    return 'physical';
  }

  if (normalized.includes('mind') || normalized.includes('medita')) {
    return 'wellness';
  }

  return 'default';
}

function countStreakDays(
  habitId: string,
  completions: HabitCompletion[],
  referenceDate: Date,
): number {
  const completionSet = new Set(
    completions
      .filter((completion) => completion.habitId === habitId)
      .map((completion) => completion.completedOn),
  );

  let streak = 0;
  let cursor = new Date(referenceDate);

  while (completionSet.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function mapHabitToTodayCard(
  habit: Habit,
  completions: HabitCompletion[],
  date: Date = new Date(),
): TodayHabitCard {
  const dateKey = toDateKey(date);
  const previousDateKey = toDateKey(addDays(date, -1));

  return {
    id: habit.id,
    name: habit.name,
    time: habit.optionalReminder,
    category: habit.category,
    trigger1: habit.trigger1,
    trigger2: habit.trigger2,
    motivation1: habit.motivation1,
    motivation2: habit.motivation2,
    minimumAction: habit.minimumAction,
    dayCount: countStreakDays(habit.id, completions, parseDateKey(dateKey)),
    completed: completions.some(
      (completion) =>
        completion.habitId === habit.id && completion.completedOn === dateKey,
    ),
    accent: mapAccent(habit.category),
    previousDayCompleted: completions.some(
      (completion) =>
        completion.habitId === habit.id &&
        completion.completedOn === previousDateKey,
    ),
  };
}
