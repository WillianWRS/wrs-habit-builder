import type { AppStorage } from '../models/app-storage.model';

/** Introduz notas diárias por hábito/data (S6-03). */
export function migrateV9ToV10(data: AppStorage): AppStorage {
  return {
    ...data,
    version: 10,
    habitNotes: data.habitNotes ?? [],
  };
}
