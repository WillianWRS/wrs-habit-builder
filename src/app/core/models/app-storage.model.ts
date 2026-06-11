import type { Habit } from './habit.model';
import type { HabitCompletion } from './habit-completion.model';
import type { HabitFreezeUsed } from './habit-freeze-used.model';

export const STORAGE_KEY = 'wrs-habit-builder';
export const CURRENT_STORAGE_VERSION = 7;

export interface AppStorage {
  version: number;
  habits: Habit[];
  completions: HabitCompletion[];
  freezeUsed: HabitFreezeUsed[];
}
