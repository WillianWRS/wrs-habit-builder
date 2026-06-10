import type { CompletionRestorePatch } from '../data/completion-restore.patch';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import { findHabitByLooseName } from './find-habit-by-loose-name.utils';

export interface CompletionRestoreResult {
  completions: HabitCompletion[];
  addedCount: number;
  unmatchedHabits: string[];
}

export function completionRestorePatchNeedsApplication(
  habits: Habit[],
  completions: HabitCompletion[],
  patch: CompletionRestorePatch,
): boolean {
  for (const day of patch.days) {
    for (const habitName of day.habitNames) {
      const habit = findHabitByLooseName(habits, habitName);

      if (!habit) {
        continue;
      }

      const alreadyExists = completions.some(
        (completion) =>
          completion.habitId === habit.id &&
          completion.completedOn === day.dateKey,
      );

      if (!alreadyExists) {
        return true;
      }
    }
  }

  return false;
}

export function applyCompletionRestorePatch(
  habits: Habit[],
  completions: HabitCompletion[],
  patch: CompletionRestorePatch,
): CompletionRestoreResult {
  const nextCompletions = [...completions];
  const unmatchedHabits = new Set<string>();
  let addedCount = 0;

  for (const day of patch.days) {
    for (const habitName of day.habitNames) {
      const habit = findHabitByLooseName(habits, habitName);

      if (!habit) {
        unmatchedHabits.add(habitName);
        continue;
      }

      const alreadyExists = nextCompletions.some(
        (completion) =>
          completion.habitId === habit.id &&
          completion.completedOn === day.dateKey,
      );

      if (alreadyExists) {
        continue;
      }

      nextCompletions.push({
        id: crypto.randomUUID(),
        habitId: habit.id,
        completedOn: day.dateKey,
      });
      addedCount += 1;
    }
  }

  return {
    completions: nextCompletions,
    addedCount,
    unmatchedHabits: [...unmatchedHabits],
  };
}
