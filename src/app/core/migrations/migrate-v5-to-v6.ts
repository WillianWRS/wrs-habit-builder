import type { AppStorage } from '../models/app-storage.model';
import { normalizeLegacyNumberedHabit } from '../utils/habit-normalizer';

/** Normaliza trigger/motivation (3 slots + visibilidade) em hábitos legados. */
export function migrateV5ToV6(data: AppStorage): AppStorage {
  return {
    ...data,
    version: 6,
    habits: data.habits.map((habit) =>
      normalizeLegacyNumberedHabit(habit as unknown as Record<string, unknown>),
    ) as unknown as AppStorage['habits'],
  };
}
