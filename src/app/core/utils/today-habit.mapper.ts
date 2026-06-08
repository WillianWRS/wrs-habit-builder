import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type {
  HabitCardAccent,
  HabitListCardView,
  TodayHabitCard,
} from '../models/today-habit-card.model';
import { toDateKey } from './date.utils';
import {
  resolveHabitDisplayMeta,
  resolveHabitDisplayMinimumAction,
  resolveHabitDisplayReminder,
} from './habit-meta.utils';
import { computeHabitStreakMetrics } from './habit-streak.utils';

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

export function mapHabitToTodayCard(
  habit: Habit,
  completions: HabitCompletion[],
  date: Date = new Date(),
): TodayHabitCard {
  const dateKey = toDateKey(date);
  const streak = computeHabitStreakMetrics(habit, completions, date);

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
    dayCount: streak.dayCount,
    missCount: streak.missCount,
    isDayOne: streak.isDayOne,
    completed: completions.some(
      (completion) =>
        completion.habitId === habit.id && completion.completedOn === dateKey,
    ),
    accent: mapAccent(habit.category),
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
