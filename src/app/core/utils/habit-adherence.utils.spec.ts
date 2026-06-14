import { describe, expect, it } from 'vitest';
import type { HabitCompletion } from '../models/habit-completion.model';
import { ALL_WEEKDAYS } from '../models/habit.model';
import { createTestHabit } from '../testing/test-habit.factory';
import { buildInitialScheduleDaySince } from './habit-streak.utils';
import {
  computeHabitAdherence,
  computeHabitAdherenceHighlights,
  computeHabitAdherenceSnapshot,
  resolveAdherenceWindowLabel,
} from './habit-adherence.utils';

function completion(habitId: string, completedOn: string): HabitCompletion {
  return { id: crypto.randomUUID(), habitId, completedOn };
}

describe('habit-adherence.utils', () => {
  it('calcula adesão 7d em dias esperados', () => {
    const habit = createTestHabit();
    const completions = [
      completion(habit.id, '2026-06-04'),
      completion(habit.id, '2026-06-05'),
      completion(habit.id, '2026-06-06'),
      completion(habit.id, '2026-06-08'),
    ];

    const adherence = computeHabitAdherence(
      habit,
      completions,
      7,
      new Date(2026, 5, 10),
    );

    expect(adherence.expectedDays).toBe(7);
    expect(adherence.completedDays).toBe(4);
    expect(adherence.percentage).toBe(57);
    expect(adherence.windowLabel).toBe('7d');
  });

  it('não retroage faltas para weekday adicionado hoje', () => {
    const habit = createTestHabit({
      scheduleDays: [1, 3],
      scheduleDaySince: {
        1: '2026-01-01',
        3: '2026-06-10',
      },
    });
    const completions = [
      completion(habit.id, '2026-05-18'),
      completion(habit.id, '2026-05-25'),
      completion(habit.id, '2026-06-01'),
      completion(habit.id, '2026-06-08'),
      completion(habit.id, '2026-06-10'),
    ];

    const adherence = computeHabitAdherence(
      habit,
      completions,
      30,
      new Date(2026, 5, 10),
    );

    expect(adherence.expectedDays).toBe(5);
    expect(adherence.completedDays).toBe(5);
    expect(adherence.percentage).toBe(100);
  });

  it('retorna 0 quando não há dias esperados na janela', () => {
    const habit = createTestHabit({
      scheduleDays: [0],
      scheduleDaySince: { 0: '2026-12-01' },
    });

    const adherence = computeHabitAdherence(habit, [], 7, new Date(2026, 5, 10));

    expect(adherence.expectedDays).toBe(0);
    expect(adherence.completedDays).toBe(0);
    expect(adherence.percentage).toBe(0);
  });

  it('mantém rótulo 7d/30d mesmo para hábito recente', () => {
    const habit = createTestHabit({
      createdAt: '2026-06-08T12:00:00.000Z',
      scheduleDaySince: {
        0: '2026-06-08',
        1: '2026-06-08',
        2: '2026-06-08',
        3: '2026-06-08',
        4: '2026-06-08',
        5: '2026-06-08',
        6: '2026-06-08',
      },
    });

    const snapshot = computeHabitAdherenceSnapshot(
      habit,
      [completion(habit.id, '2026-06-09')],
      new Date(2026, 5, 10),
    );

    expect(snapshot.sevenDays.windowLabel).toBe('7d');
    expect(snapshot.thirtyDays.trackedDays).toBe(3);
    expect(snapshot.thirtyDays.windowLabel).toBe('30d');
    expect(resolveAdherenceWindowLabel(30)).toBe('30d');
  });

  it('destaca hábitos com maior e menor adesão em todo o período', () => {
    const strongHabit = createTestHabit({
      id: 'habit-strong',
      name: 'Leitura',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });
    const weakHabit = createTestHabit({
      id: 'habit-weak',
      name: 'Academia',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });

    const completions = [
      ...['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'].map(
        (dateKey) => completion(strongHabit.id, dateKey),
      ),
      ...['2026-06-06', '2026-06-07', '2026-06-08', '2026-06-09', '2026-06-10'].map(
        (dateKey) => completion(strongHabit.id, dateKey),
      ),
      completion(weakHabit.id, '2026-06-01'),
      completion(weakHabit.id, '2026-06-02'),
    ];

    const highlights = computeHabitAdherenceHighlights(
      [strongHabit, weakHabit],
      completions,
      new Date(2026, 5, 10),
    );

    expect(highlights.hasEnoughData).toBe(true);
    expect(highlights.topHabit.label).toBe('Leitura');
    expect(highlights.lowHabit.label).toBe('Academia');
    expect(highlights.topHabit.value).toContain('100%');
    expect(highlights.lowHabit.value).toContain('20%');
    expect(highlights.topHabit.tiedHabits).toEqual([]);
    expect(highlights.lowHabit.tiedHabits).toEqual([]);
  });

  it('lista demais hábitos empatados em maior e menor adesão', () => {
    const habitA = createTestHabit({
      id: 'habit-a',
      name: 'Leitura',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });
    const habitB = createTestHabit({
      id: 'habit-b',
      name: 'Meditação',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });
    const habitC = createTestHabit({
      id: 'habit-c',
      name: 'Academia',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });
    const habitD = createTestHabit({
      id: 'habit-d',
      name: 'Água',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });

    const fullPeriod = [
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
      '2026-06-06',
      '2026-06-07',
      '2026-06-08',
      '2026-06-09',
      '2026-06-10',
    ];

    const completions = [
      ...fullPeriod.flatMap((dateKey) => [
        completion(habitA.id, dateKey),
        completion(habitB.id, dateKey),
      ]),
      completion(habitC.id, '2026-06-01'),
      completion(habitD.id, '2026-06-01'),
    ];

    const highlights = computeHabitAdherenceHighlights(
      [habitA, habitB, habitC, habitD],
      completions,
      new Date(2026, 5, 10),
    );

    expect(highlights.topHabit.tiedHabits).toEqual([
      { name: 'Meditação', value: '10/10 (100%)' },
    ]);
    expect(highlights.lowHabit.tiedHabits).toEqual([
      { name: 'Água', value: '1/10 (10%)' },
    ]);
  });

  it('desempata maior adesão por streak e depois por hábito mais antigo', () => {
    const olderHabit = createTestHabit({
      id: 'habit-older',
      name: 'Leitura',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });
    const newerHabit = createTestHabit({
      id: 'habit-newer',
      name: 'Meditação',
      createdAt: '2026-06-05T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-05'),
    });

    const newerPeriod = [
      '2026-06-05',
      '2026-06-06',
      '2026-06-07',
      '2026-06-08',
      '2026-06-09',
      '2026-06-10',
    ];

    const highlightsByStreak = computeHabitAdherenceHighlights(
      [olderHabit, newerHabit],
      newerPeriod.map((dateKey) => completion(newerHabit.id, dateKey)),
      new Date(2026, 5, 10),
    );

    expect(highlightsByStreak.topHabit.label).toBe('Meditação');
    expect(highlightsByStreak.topHabit.tiedHabits).toEqual([]);

    const evenOlder = createTestHabit({
      id: 'habit-even-older',
      name: 'Antigo',
      createdAt: '2026-06-01T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-01'),
    });
    const evenNewer = createTestHabit({
      id: 'habit-even-newer',
      name: 'Recente',
      createdAt: '2026-06-08T12:00:00.000Z',
      scheduleDaySince: buildInitialScheduleDaySince([...ALL_WEEKDAYS], '2026-06-08'),
    });

    const highlightsByAge = computeHabitAdherenceHighlights(
      [evenNewer, evenOlder],
      [],
      new Date(2026, 5, 10),
    );

    expect(highlightsByAge.topHabit.label).toBe('Antigo');
    expect(highlightsByAge.topHabit.tiedHabits).toEqual([
      { name: 'Recente', value: '0/3 (0%)' },
    ]);
  });
});
