import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { HabitDailyNote } from '../models/habit-daily-note.model';
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
import {
  computeHabitStreakSnapshot,
  formatFreezeReassurance,
  getFreezeForReassuranceDay,
} from './habit-streak.utils';
import { buildMarqueeItems } from './habit-trigger-motivation.utils';

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
  freezeUsed: HabitFreezeUsed[] = [],
  habitNotes: HabitDailyNote[] = [],
  date: Date = new Date(),
): TodayHabitCard {
  const dateKey = toDateKey(date);
  const streak = computeHabitStreakSnapshot(habit, completions, freezeUsed, date);
  const recentFreeze = getFreezeForReassuranceDay(habit.id, freezeUsed, date);

  return {
    id: habit.id,
    name: habit.name,
    displayMeta: resolveHabitDisplayMeta(habit, date),
    scheduleDays: [...habit.scheduleDays],
    time: resolveHabitDisplayReminder(habit, date),
    category: habit.category,
    marqueeItems: buildMarqueeItems(habit),
    minimumAction: resolveHabitDisplayMinimumAction(habit, date),
    dayCount: streak.currentStreak,
    bestStreak: streak.bestStreak,
    totalCompletions: streak.totalCompletions,
    isDayOne: streak.isDayOne,
    freezeReassurance: recentFreeze
      ? formatFreezeReassurance(recentFreeze.dateKey)
      : null,
    dailyNote:
      habitNotes.find(
        (entry) => entry.habitId === habit.id && entry.dateKey === dateKey,
      )?.note ?? '',
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
  freezeUsed: HabitFreezeUsed[] = [],
  habitNotes: HabitDailyNote[] = [],
  date: Date = new Date(),
): HabitListCardView {
  return {
    ...mapHabitToTodayCard(habit, completions, freezeUsed, habitNotes, date),
    archived: habit.archived,
    showOnToday: habit.showOnToday,
  };
}
