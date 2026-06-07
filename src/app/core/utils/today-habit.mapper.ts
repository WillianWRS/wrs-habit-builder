import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type {
  HabitCardAccent,
  HabitListCardView,
  TodayHabitCard,
} from '../models/today-habit-card.model';
import { addDays, parseDateKey, toDateKey } from './date.utils';
import {
  resolveHabitDisplayMeta,
  resolveHabitDisplayMinimumAction,
  resolveHabitDisplayReminder,
} from './habit-meta.utils';

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
    displayMeta: resolveHabitDisplayMeta(habit, date),
    scheduleDays: [...habit.scheduleDays],
    time: resolveHabitDisplayReminder(habit, date),
    category: habit.category,
    trigger1: habit.trigger1,
    trigger2: habit.trigger2,
    motivation1: habit.motivation1,
    motivation2: habit.motivation2,
    minimumAction: resolveHabitDisplayMinimumAction(habit, date),
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

export function mapHabitToListCard(
  habit: Habit,
  completions: HabitCompletion[],
  date: Date = new Date(),
): HabitListCardView {
  return {
    ...mapHabitToTodayCard(habit, completions, date),
    archived: habit.archived,
    showOnToday: habit.showOnToday,
  };
}
