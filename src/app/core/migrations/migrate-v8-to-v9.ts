import type { AppStorage } from '../models/app-storage.model';
import type { Habit } from '../models/habit.model';
import type { HabitWeekdayGoal } from '../models/habit-weekday-goal.model';
import { resolveRawTime } from '../utils/habit-normalizer';

/** Renomeia optionalReminder → time nos hábitos e weekdayGoals persistidos. */
export function migrateV8ToV9(data: AppStorage): AppStorage {
  return {
    ...data,
    version: 9,
    habits: data.habits.map((habit) => migrateHabitV8ToV9(habit)),
  };
}

function migrateWeekdayGoalV8ToV9(goal: HabitWeekdayGoal): HabitWeekdayGoal {
  const raw = goal as unknown as Record<string, unknown>;

  return {
    weekday: goal.weekday,
    meta: goal.meta,
    minimumAction: goal.minimumAction,
    time: resolveRawTime(raw),
  };
}

function migrateHabitV8ToV9(habit: Habit): Habit {
  const raw = habit as unknown as Record<string, unknown>;

  return {
    id: habit.id,
    name: habit.name,
    generalGoal: habit.generalGoal,
    dynamicGoals: habit.dynamicGoals,
    weekdayGoals: habit.weekdayGoals.map(migrateWeekdayGoalV8ToV9),
    category: habit.category,
    triggers: habit.triggers,
    motivations: habit.motivations,
    minimumAction: habit.minimumAction,
    scheduleDays: habit.scheduleDays,
    scheduleDaySince: habit.scheduleDaySince,
    time: resolveRawTime(raw),
    archived: habit.archived,
    createdAt: habit.createdAt,
    showOnToday: habit.showOnToday,
  };
}
