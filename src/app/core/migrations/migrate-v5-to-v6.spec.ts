import { describe, expect, it } from 'vitest';
import { CURRENT_STORAGE_VERSION } from '../models/app-storage.model';
import { resolveTriggerMotivationFields } from '../utils/habit-trigger-motivation.utils';
import storageV5 from './fixtures/storage-v5.json';
import { migrateV5ToV6 } from './migrate-v5-to-v6';
import { migrateStorage } from './migrate-storage';

describe('migrateV5ToV6', () => {
  it('normaliza trigger/motivation numerados e preserva completions', () => {
    const input = {
      version: 5 as const,
      habits: storageV5.habits,
      completions: storageV5.completions,
      freezeUsed: [],
    } as unknown as Parameters<typeof migrateV5ToV6>[0];

    const result = migrateV5ToV6(input);
    const habit = result.habits[0] as unknown as Record<string, unknown>;

    expect(result.version).toBe(6);
    expect(result.completions).toEqual(storageV5.completions);
    expect(result.habits).toHaveLength(2);

    const fields = resolveTriggerMotivationFields(habit);
    expect(fields.trigger3).toBe('');
    expect(fields.trigger3Visible).toBe(false);

    const exercise = result.habits[1] as unknown as Record<string, unknown>;
    expect(resolveTriggerMotivationFields(exercise).trigger1).toBe('Ao acordar');
  });
});

describe('migrateStorage — cadeia completa a partir de v5', () => {
  it('migra fixture v5 até CURRENT_STORAGE_VERSION', () => {
    const { data, sourceVersion } = migrateStorage(storageV5);

    expect(sourceVersion).toBe(5);
    expect(data.version).toBe(CURRENT_STORAGE_VERSION);
    expect(data.completions).toEqual(storageV5.completions);
    expect(data.habits).toHaveLength(2);
    expect(data.habits[0]?.triggers[0]?.text).toBe('Após o café');
    expect(data.habits[0]?.generalGoal).toBe('30 minutos por dia');
  });
});
