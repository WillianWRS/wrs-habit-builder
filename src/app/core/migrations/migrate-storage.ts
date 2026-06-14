import {
  CURRENT_STORAGE_VERSION,
  type AppStorage,
} from '../models/app-storage.model';
import { migrateV5ToV6 } from './migrate-v5-to-v6';
import { migrateV6ToV7 } from './migrate-v6-to-v7';
import { migrateV7ToV8 } from './migrate-v7-to-v8';
import { migrateV8ToV9 } from './migrate-v8-to-v9';
import { migrateV9ToV10 } from './migrate-v9-to-v10';

/** Versão mínima suportada — não há backups conhecidos anteriores. */
export const OLDEST_SUPPORTED_STORAGE_VERSION = 5;

type MigrationStep = (data: AppStorage) => AppStorage;

const MIGRATION_STEPS: Partial<Record<number, MigrationStep>> = {
  5: migrateV5ToV6,
  6: migrateV6ToV7,
  7: migrateV7ToV8,
  8: migrateV8ToV9,
  9: migrateV9ToV10,
};

export interface MigrateStorageResult {
  data: AppStorage;
  /** Versão lida do payload bruto (antes da cadeia). */
  sourceVersion: number;
}

function createEmptyStorage(): AppStorage {
  return {
    version: CURRENT_STORAGE_VERSION,
    habits: [],
    completions: [],
    freezeUsed: [],
    habitNotes: [],
  };
}

function parseSourceVersion(raw: Record<string, unknown>): number {
  const version =
    typeof raw['version'] === 'number'
      ? raw['version']
      : OLDEST_SUPPORTED_STORAGE_VERSION;
  return Math.max(version, OLDEST_SUPPORTED_STORAGE_VERSION);
}

function parseStorageInput(raw: Record<string, unknown>, version: number): AppStorage {
  return {
    version,
    habits: (raw['habits'] as AppStorage['habits'] | undefined) ?? [],
    completions: (raw['completions'] as AppStorage['completions'] | undefined) ?? [],
    freezeUsed: (raw['freezeUsed'] as AppStorage['freezeUsed'] | undefined) ?? [],
    habitNotes: (raw['habitNotes'] as AppStorage['habitNotes'] | undefined) ?? [],
  };
}

/** Aplica migrações encadeadas até CURRENT_STORAGE_VERSION. Função pura, sem efeitos colaterais. */
export function migrateStorage(raw: unknown): MigrateStorageResult {
  if (!raw || typeof raw !== 'object') {
    return {
      data: createEmptyStorage(),
      sourceVersion: 0,
    };
  }

  const input = raw as Record<string, unknown>;
  const sourceVersion = parseSourceVersion(input);
  let data = parseStorageInput(input, sourceVersion);

  while (data.version < CURRENT_STORAGE_VERSION) {
    const step = MIGRATION_STEPS[data.version];

    if (!step) {
      console.warn(
        `[HabitStorage] unsupported schema version ${data.version}, starting empty`,
      );
      return {
        data: createEmptyStorage(),
        sourceVersion,
      };
    }

    data = step(data);
  }

  return { data, sourceVersion };
}
