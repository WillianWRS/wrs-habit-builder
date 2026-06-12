import type { Habit } from './habit.model';
import type { HabitCompletion } from './habit-completion.model';
import type { HabitFreezeUsed } from './habit-freeze-used.model';

/** Chave legada do localStorage (pré-IndexedDB). Não é mais lida nem gravada pelo app. */
export const LEGACY_LOCAL_STORAGE_KEY = 'wrs-habit-builder';
export const CURRENT_STORAGE_VERSION = 9;

export interface AppStorage {
  version: number;
  habits: Habit[];
  completions: HabitCompletion[];
  freezeUsed: HabitFreezeUsed[];
}
