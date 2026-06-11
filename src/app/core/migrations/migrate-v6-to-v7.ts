import type { AppStorage } from '../models/app-storage.model';

/** Introduz o array append-only de freezes consumidos (RN-08). */
export function migrateV6ToV7(data: AppStorage): AppStorage {
  return {
    ...data,
    version: 7,
    freezeUsed: data.freezeUsed ?? [],
  };
}
