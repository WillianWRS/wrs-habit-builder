import { describe, expect, it } from 'vitest';
import type { Habit } from '../models/habit.model';
import { findHabitByLooseName } from './find-habit-by-loose-name.utils';

function createHabit(name: string): Habit {
  return {
    id: name,
    name,
    metaGeral: '',
    metasDinamicas: false,
    weekdayGoals: [],
    category: 'corpo',
    trigger1: '',
    trigger2: '',
    trigger3: '',
    trigger1Visible: false,
    trigger2Visible: false,
    trigger3Visible: false,
    motivation1: '',
    motivation2: '',
    motivation3: '',
    motivation1Visible: false,
    motivation2Visible: false,
    motivation3Visible: false,
    minimumAction: '',
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    scheduleDaySince: {},
    optionalReminder: '',
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    showOnToday: true,
  };
}

describe('findHabitByLooseName', () => {
  const habits = [
    createHabit('Caminhada matinal'),
    createHabit('Muay Thai'),
    createHabit('Estudar inglês'),
    createHabit('Leitura diária'),
    createHabit('Treino de musculação'),
  ];

  it('resolve nomes informados pelo usuário', () => {
    expect(findHabitByLooseName(habits, 'caminhada')?.name).toBe(
      'Caminhada matinal',
    );
    expect(findHabitByLooseName(habits, 'muay thai')?.name).toBe('Muay Thai');
    expect(findHabitByLooseName(habits, 'ingles')?.name).toBe(
      'Estudar inglês',
    );
    expect(findHabitByLooseName(habits, 'leitura')?.name).toBe(
      'Leitura diária',
    );
    expect(findHabitByLooseName(habits, 'musculação')?.name).toBe(
      'Treino de musculação',
    );
  });
});
