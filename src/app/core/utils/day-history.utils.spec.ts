import { describe, expect, it } from 'vitest';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import { createTestHabit } from '../testing/test-habit.factory';
import { buildDayHistory } from './day-history.utils';

function createHabit(overrides: Parameters<typeof createTestHabit>[0] = {}) {
  return createTestHabit({
    name: 'Caminhar',
    generalGoal: '4KM',
    category: 'corpo',
    minimumAction: '1 km',
    time: '07:00',
    triggers: [
      { text: '', visible: false },
      { text: '', visible: false },
      { text: '', visible: false },
    ],
    motivations: [
      { text: '', visible: false },
      { text: '', visible: false },
      { text: '', visible: false },
    ],
    ...overrides,
  });
}

describe('buildDayHistory', () => {
  it('monta entradas ordenadas por horário com --:-- por último', () => {
    const habits = [
      createHabit({
        id: 'no-reminder',
        name: 'Meditar',
        generalGoal: '10 min',
        time: '',
      }),
      createHabit({
        id: 'early',
        name: 'Caminhar',
        generalGoal: '4KM',
        time: '07:00',
      }),
      createHabit({
        id: 'late',
        name: 'Ler',
        generalGoal: '20 pág',
        time: '21:30',
      }),
    ];
    const completions: HabitCompletion[] = [
      {
        id: 'c1',
        habitId: 'early',
        completedOn: '2026-06-10',
      },
    ];

    const snapshot = buildDayHistory('2026-06-10', habits, completions);

    expect(snapshot.entries.map((entry) => entry.habitId)).toEqual([
      'early',
      'late',
      'no-reminder',
    ]);
    expect(snapshot.entries[0]).toMatchObject({
      reminderDisplay: '07:00',
      name: 'Caminhar',
      meta: '4KM',
      status: 'done',
    });
    expect(snapshot.entries[2]).toMatchObject({
      reminderDisplay: '--:--',
      name: 'Meditar',
      meta: '10 min',
      status: 'not_done',
    });
  });

  it('ignora hábitos arquivados e fora do schedule', () => {
    const habits = [
      createHabit({ id: 'active' }),
      createHabit({ id: 'archived', archived: true }),
      createHabit({
        id: 'weekend-only',
        scheduleDays: [0, 6],
        scheduleDaySince: { 0: '2026-01-01', 6: '2026-01-01' },
      }),
    ];

    const snapshot = buildDayHistory('2026-06-10', habits, []);

    expect(snapshot.entries).toHaveLength(1);
    expect(snapshot.entries[0]?.habitId).toBe('active');
  });

  it('marca hábito esperado não concluído com freeze como protegido', () => {
    const habits = [createHabit({ id: 'walk' })];
    const freezeUsed: HabitFreezeUsed[] = [
      {
        id: 'f1',
        habitId: 'walk',
        dateKey: '2026-06-10',
        usedAt: '2026-06-11T08:00:00.000Z',
      },
    ];

    const snapshot = buildDayHistory('2026-06-10', habits, [], freezeUsed);

    expect(snapshot.entries[0]).toMatchObject({
      habitId: 'walk',
      status: 'protected',
    });
  });

  it('prioriza feito sobre protegido quando há conclusão no mesmo dia', () => {
    const habits = [createHabit({ id: 'walk' })];
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'walk', completedOn: '2026-06-10' },
    ];
    const freezeUsed: HabitFreezeUsed[] = [
      {
        id: 'f1',
        habitId: 'walk',
        dateKey: '2026-06-10',
        usedAt: '2026-06-11T08:00:00.000Z',
      },
    ];

    const snapshot = buildDayHistory('2026-06-10', habits, completions, freezeUsed);

    expect(snapshot.entries[0]?.status).toBe('done');
  });

  it('inclui nota diária do hábito no dia selecionado', () => {
    const habits = [createHabit({ id: 'walk' })];

    const snapshot = buildDayHistory('2026-06-10', habits, [], [], [
      {
        id: 'n1',
        habitId: 'walk',
        dateKey: '2026-06-10',
        note: '  Corri no parque  ',
        updatedAt: '2026-06-10T12:00:00.000Z',
      },
    ]);

    expect(snapshot.entries[0]?.dailyNote).toBe('Corri no parque');
  });
});
