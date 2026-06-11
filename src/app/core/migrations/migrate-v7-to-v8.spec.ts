import { describe, expect, it } from 'vitest';
import { CURRENT_STORAGE_VERSION } from '../models/app-storage.model';
import storageV7 from './fixtures/storage-v7.json';
import { migrateV7ToV8 } from './migrate-v7-to-v8';
import { migrateStorage } from './migrate-storage';

describe('migrateV7ToV8', () => {
  it('converte campos numerados para arrays e renomeia metas', () => {
    const input = {
      version: 7 as const,
      habits: storageV7.habits,
      completions: storageV7.completions,
      freezeUsed: storageV7.freezeUsed,
    } as unknown as Parameters<typeof migrateV7ToV8>[0];

    const result = migrateV7ToV8(input);
    const habit = result.habits[0]!;

    expect(result.version).toBe(8);
    expect(result.completions).toEqual(storageV7.completions);
    expect(result.freezeUsed).toEqual([]);
    expect(habit.generalGoal).toBe('30 minutos por dia');
    expect(habit.dynamicGoals).toBe(false);
    expect(habit.triggers).toEqual([
      { text: 'Após o café', visible: true },
      { text: 'Antes de dormir', visible: true },
      { text: '', visible: false },
    ]);
    expect(habit.motivations).toEqual([
      { text: 'Aprender', visible: true },
      { text: 'Relaxar', visible: true },
      { text: '', visible: false },
    ]);
    expect('trigger1' in habit).toBe(false);
    expect('metaGeral' in habit).toBe(false);
  });
});

describe('migrateStorage — cadeia completa a partir de v7', () => {
  it('migra fixture v7 até CURRENT_STORAGE_VERSION', () => {
    const { data, sourceVersion } = migrateStorage(storageV7);

    expect(sourceVersion).toBe(7);
    expect(data.version).toBe(CURRENT_STORAGE_VERSION);
    expect(data.completions).toEqual(storageV7.completions);
    expect(data.habits[0]?.generalGoal).toBe('30 minutos por dia');
    expect(data.habits[0]?.triggers[0]?.text).toBe('Após o café');
  });
});
