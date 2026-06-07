import { HABIT_CATEGORY_LABELS } from '../models/habit-category.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type { HabitCardAccent, TodayHabitCard } from '../models/today-habit-card.model';
import { addDays, parseDateKey, toDateKey } from './date.utils';

function mapAccent(category: Habit['category']): HabitCardAccent {
  if (category === 'corpo') {
    return 'physical';
  }

  if (category === 'mindfulness') {
    return 'wellness';
  }

  return 'default';
}

function splitTriggerText(triggerText: string): {
  trigger1: string;
  trigger2: string;
  motivation1: string;
  motivation2: string;
} {
  const parts = triggerText
    .split(/[.!?]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    trigger1: parts[0] ?? triggerText,
    trigger2: parts[1] ?? parts[0] ?? triggerText,
    motivation1: parts[2] ?? 'Consistência em construção',
    motivation2: parts[3] ?? 'Um passo de cada vez',
  };
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
  const display = splitTriggerText(habit.triggerText);

  return {
    id: habit.id,
    name: habit.name,
    time: habit.optionalReminder ?? '--:--',
    category: HABIT_CATEGORY_LABELS[habit.category],
    trigger1: display.trigger1,
    trigger2: display.trigger2,
    motivation1: display.motivation1,
    motivation2: display.motivation2,
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
