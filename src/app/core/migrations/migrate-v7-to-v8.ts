import type { AppStorage } from '../models/app-storage.model';
import type { Habit } from '../models/habit.model';
import { normalizeHabit } from '../utils/habit-normalizer';
import { mapNumberedFieldsToSlots } from './numbered-habit-fields.utils';

/** Converte campos numerados + metaGeral/metasDinamicas para arrays e nomes em inglês. */
export function migrateV7ToV8(data: AppStorage): AppStorage {
  return {
    ...data,
    version: 8,
    habits: data.habits.map((habit) => migrateHabitV7ToV8(habit)),
  };
}

function migrateHabitV7ToV8(habit: Habit): Habit {
  const raw = habit as unknown as Record<string, unknown>;

  if (Array.isArray(raw['triggers']) && Array.isArray(raw['motivations'])) {
    return normalizeHabit(habit as unknown as Record<string, unknown>);
  }

  const { triggers, motivations } = mapNumberedFieldsToSlots(raw);
  const normalized = normalizeHabit({
    ...habit,
    generalGoal: String(raw['generalGoal'] ?? raw['metaGeral'] ?? ''),
    dynamicGoals: Boolean(raw['dynamicGoals'] ?? raw['metasDinamicas'] ?? false),
    triggers,
    motivations,
  });

  return normalized;
}
