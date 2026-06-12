import { describe, expect, it } from 'vitest';
import { CURRENT_STORAGE_VERSION } from '../models/app-storage.model';
import storageV8 from './fixtures/storage-v8.json';
import { migrateV8ToV9 } from './migrate-v8-to-v9';
import { migrateStorage } from './migrate-storage';
import { normalizeHabit } from '../utils/habit-normalizer';

describe('migrateV8ToV9', () => {
  it('renomeia optionalReminder para time no hábito e nos weekdayGoals', () => {
    const input = {
      version: 8 as const,
      habits: storageV8.habits,
      completions: storageV8.completions,
      freezeUsed: storageV8.freezeUsed,
    } as unknown as Parameters<typeof migrateV8ToV9>[0];

    const result = migrateV8ToV9(input);
    const habit = result.habits[0]!;

    expect(result.version).toBe(9);
    expect(result.completions).toEqual(storageV8.completions);
    expect(habit.time).toBe('08:00');
    expect('optionalReminder' in habit).toBe(false);
    expect(habit.weekdayGoals[1]?.time).toBe('07:30');
    expect('optionalReminder' in (habit.weekdayGoals[1] ?? {})).toBe(false);
  });
});

describe('migrateStorage — cadeia completa a partir de v8', () => {
  it('migra fixture v8 até CURRENT_STORAGE_VERSION', () => {
    const { data, sourceVersion } = migrateStorage(storageV8);

    expect(sourceVersion).toBe(8);
    expect(data.version).toBe(CURRENT_STORAGE_VERSION);
    expect(data.habits[0]?.time).toBe('08:00');
    expect(data.habits[0]?.weekdayGoals[1]?.time).toBe('07:30');
  });
});

describe('normalizeHabit — fallback optionalReminder em import JSON', () => {
  it('aceita chave legada optionalReminder quando time está ausente', () => {
    const habit = normalizeHabit({
      id: 'legacy-import',
      name: 'Teste',
      category: 'outro',
      triggers: [{ text: 'Gatilho', visible: true }],
      motivations: [{ text: 'Motivação', visible: true }],
      minimumAction: 'Ação',
      scheduleDays: [1],
      optionalReminder: '09:15',
      weekdayGoals: [
        {
          weekday: 1,
          meta: '',
          minimumAction: '',
          optionalReminder: '10:45',
        },
      ],
    });

    expect(habit.time).toBe('09:15');
    expect(habit.weekdayGoals[1]?.time).toBe('10:45');
  });

  it('prefere time quando ambas as chaves existem', () => {
    const habit = normalizeHabit({
      id: 'mixed-import',
      name: 'Teste',
      category: 'outro',
      triggers: [{ text: 'Gatilho', visible: true }],
      motivations: [{ text: 'Motivação', visible: true }],
      minimumAction: 'Ação',
      scheduleDays: [1],
      time: '11:00',
      optionalReminder: '09:15',
    });

    expect(habit.time).toBe('11:00');
  });
});
