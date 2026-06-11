import { describe, expect, it } from 'vitest';
import { ALL_WEEKDAYS } from '../models/habit.model';
import { buildInitialScheduleDaySince } from '../utils/habit-streak.utils';
import { migrateV6ToV7 } from './migrate-v6-to-v7';
import { migrateStorage } from './migrate-storage';
import { CURRENT_STORAGE_VERSION } from '../models/app-storage.model';

describe('migrateV6ToV7', () => {
  it('adiciona freezeUsed vazio quando ausente', () => {
    const input = {
      version: 6 as const,
      habits: [
        {
          id: 'habit-1',
          name: 'Teste',
          metaGeral: '',
          metasDinamicas: false,
          weekdayGoals: [],
          category: 'Saúde',
          trigger1: 'Gatilho',
          trigger2: '',
          trigger3: '',
          trigger1Visible: true,
          trigger2Visible: false,
          trigger3Visible: false,
          motivation1: 'Motivação',
          motivation2: 'Um passo de cada vez',
          motivation3: '',
          motivation1Visible: true,
          motivation2Visible: false,
          motivation3Visible: false,
          minimumAction: '1 passo',
          scheduleDays: [...ALL_WEEKDAYS],
          scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-01-01'),
          optionalReminder: '',
          archived: false,
          createdAt: '2026-01-01T12:00:00.000Z',
          showOnToday: true,
        },
      ],
      completions: [{ id: 'c1', habitId: 'habit-1', completedOn: '2026-06-01' }],
      freezeUsed: [],
    } as unknown as Parameters<typeof migrateV6ToV7>[0];

    const result = migrateV6ToV7(input);

    expect(result.version).toBe(7);
    expect(result.freezeUsed).toEqual([]);
    expect(result.completions).toEqual(input.completions);
    expect(result.habits).toHaveLength(1);
  });
});

describe('migrateStorage — a partir de v6', () => {
  it('aplica apenas migrateV6ToV7 quando payload já está na v6', () => {
    const v6Payload = {
      version: 6,
      habits: [],
      completions: [{ id: 'c1', habitId: 'h1', completedOn: '2026-06-01' }],
    };

    const { data, sourceVersion } = migrateStorage(v6Payload);

    expect(sourceVersion).toBe(6);
    expect(data.version).toBe(CURRENT_STORAGE_VERSION);
    expect(data.freezeUsed).toEqual([]);
    expect(data.completions).toEqual(v6Payload.completions);
  });
});
