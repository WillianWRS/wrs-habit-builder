import type { HabitFreezeUsed } from '../models/habit-freeze-used.model';
import type { HabitCompletion } from '../models/habit-completion.model';
import type { Habit } from '../models/habit.model';
import type { Weekday } from '../models/weekday.model';
import { addDays, getWeekday, parseDateKey, toDateKey } from './date.utils';

export const FREEZE_CAP_FREE = 1;
export const FREEZE_CAP_PREMIUM = 2;

export type FreezeTier = 'free' | 'premium';

export interface FreezeBalance {
  available: number;
  cap: number;
}

export interface HabitStreakSnapshot {
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  isDayOne: boolean;
}

export function buildInitialScheduleDaySince(
  scheduleDays: Weekday[],
  dateKey: string,
): Partial<Record<Weekday, string>> {
  return Object.fromEntries(
    scheduleDays.map((weekday) => [weekday, dateKey]),
  ) as Partial<Record<Weekday, string>>;
}

export function mergeScheduleDaySince(
  existing: Partial<Record<Weekday, string>>,
  previousDays: Weekday[],
  newDays: Weekday[],
  todayKey: string,
): Partial<Record<Weekday, string>> {
  const merged = { ...existing };

  for (const weekday of newDays) {
    if (!previousDays.includes(weekday)) {
      merged[weekday] = todayKey;
    }
  }

  return merged;
}

export function isExpectedScheduleDay(habit: Habit, dateKey: string): boolean {
  const weekday = getWeekday(parseDateKey(dateKey));

  if (!habit.scheduleDays.includes(weekday)) {
    return false;
  }

  const activeSince = habit.scheduleDaySince[weekday];

  if (!activeSince) {
    return false;
  }

  return dateKey >= activeSince;
}

export function getHabitCreatedDateKey(habit: Habit): string {
  return toDateKey(new Date(habit.createdAt));
}

/** Início da semana local (domingo) para uma dateKey. */
export function getWeekStartKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return toDateKey(addDays(date, -date.getDay()));
}

export function getFreezeCap(tier: FreezeTier): number {
  return tier === 'premium' ? FREEZE_CAP_PREMIUM : FREEZE_CAP_FREE;
}

function getHabitCompletions(
  habitId: string,
  completions: HabitCompletion[],
): HabitCompletion[] {
  return completions.filter((completion) => completion.habitId === habitId);
}

function getCompletionDateKeys(
  habitId: string,
  completions: HabitCompletion[],
): Set<string> {
  return new Set(
    getHabitCompletions(habitId, completions).map(
      (completion) => completion.completedOn,
    ),
  );
}

function getFreezeDateKeys(
  habitId: string,
  freezeEvents: HabitFreezeUsed[],
): Set<string> {
  return new Set(
    freezeEvents
      .filter((event) => event.habitId === habitId)
      .map((event) => event.dateKey),
  );
}

function getHabitFreezeEvents(
  habitId: string,
  freezeEvents: HabitFreezeUsed[],
): HabitFreezeUsed[] {
  return freezeEvents.filter((event) => event.habitId === habitId);
}

export function getScheduledDaysWalk(
  habit: Habit,
  fromDateKey: string,
  endDateKey: string,
): string[] {
  const createdKey = getHabitCreatedDateKey(habit);
  const startKey = fromDateKey > createdKey ? fromDateKey : createdKey;

  if (startKey > endDateKey) {
    return [];
  }

  const result: string[] = [];
  let cursor = parseDateKey(startKey);
  const end = parseDateKey(endDateKey);

  while (cursor <= end) {
    const key = toDateKey(cursor);

    if (isExpectedScheduleDay(habit, key)) {
      result.push(key);
    }

    cursor = addDays(cursor, 1);
  }

  return result;
}

/** Último dia considerado na avaliação de streak (hoje neutro se agendado e pendente). */
export function getStreakEvaluationEndKey(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDate: Date,
): string {
  const todayKey = toDateKey(referenceDate);
  const completionDates = getCompletionDateKeys(habit.id, completions);
  const todayScheduled = isExpectedScheduleDay(habit, todayKey);
  const todayCompleted = completionDates.has(todayKey);

  if (todayScheduled && !todayCompleted) {
    return toDateKey(addDays(referenceDate, -1));
  }

  return todayKey;
}

export function computeTotalCompletions(
  habitId: string,
  completions: HabitCompletion[],
): number {
  return getHabitCompletions(habitId, completions).length;
}

function resolveDayStreakOutcome(
  dateKey: string,
  completionDates: Set<string>,
  freezeDates: Set<string>,
): 'done' | 'protected' | 'break' {
  if (completionDates.has(dateKey)) {
    return 'done';
  }

  if (freezeDates.has(dateKey)) {
    return 'protected';
  }

  return 'break';
}

export function computeCurrentStreak(
  habit: Habit,
  completions: HabitCompletion[],
  freezeEvents: HabitFreezeUsed[],
  referenceDate: Date = new Date(),
): number {
  const completionDates = getCompletionDateKeys(habit.id, completions);
  const freezeDates = getFreezeDateKeys(habit.id, freezeEvents);
  const endKey = getStreakEvaluationEndKey(habit, completions, referenceDate);
  const createdKey = getHabitCreatedDateKey(habit);

  if (endKey < createdKey) {
    return 0;
  }

  const scheduledDays = getScheduledDaysWalk(habit, createdKey, endKey).reverse();
  let streak = 0;

  for (const dateKey of scheduledDays) {
    const outcome = resolveDayStreakOutcome(dateKey, completionDates, freezeDates);

    if (outcome === 'done') {
      streak += 1;
      continue;
    }

    if (outcome === 'protected') {
      continue;
    }

    break;
  }

  return streak;
}

export function computeBestStreak(
  habit: Habit,
  completions: HabitCompletion[],
  freezeEvents: HabitFreezeUsed[],
  referenceDate: Date = new Date(),
): number {
  const completionDates = getCompletionDateKeys(habit.id, completions);
  const freezeDates = getFreezeDateKeys(habit.id, freezeEvents);
  const endKey = getStreakEvaluationEndKey(habit, completions, referenceDate);
  const createdKey = getHabitCreatedDateKey(habit);

  if (endKey < createdKey) {
    return 0;
  }

  const scheduledDays = getScheduledDaysWalk(habit, createdKey, endKey);
  let current = 0;
  let best = 0;

  for (const dateKey of scheduledDays) {
    const outcome = resolveDayStreakOutcome(dateKey, completionDates, freezeDates);

    if (outcome === 'done') {
      current += 1;
      best = Math.max(best, current);
      continue;
    }

    if (outcome === 'protected') {
      continue;
    }

    current = 0;
  }

  return best;
}

export function computeFreezeBalance(
  habit: Habit,
  freezeEvents: HabitFreezeUsed[],
  tier: FreezeTier,
  referenceDate: Date = new Date(),
): FreezeBalance {
  const cap = getFreezeCap(tier);
  const referenceKey = toDateKey(referenceDate);
  const createdKey = getHabitCreatedDateKey(habit);
  const habitFreezes = getHabitFreezeEvents(habit.id, freezeEvents);

  if (referenceKey < createdKey) {
    return { available: 0, cap };
  }

  let balance = 0;
  let weekStart = getWeekStartKey(createdKey);
  const endWeekStart = getWeekStartKey(referenceKey);

  while (weekStart <= endWeekStart) {
    balance = Math.min(balance + 1, cap);

    const weekEnd = toDateKey(addDays(parseDateKey(weekStart), 6));
    const usedThisWeek = habitFreezes.filter(
      (event) => event.dateKey >= weekStart && event.dateKey <= weekEnd,
    ).length;

    balance = Math.max(0, balance - usedThisWeek);
    weekStart = toDateKey(addDays(parseDateKey(weekStart), 7));
  }

  return { available: balance, cap };
}

function getFirstCompletionDateKey(
  habitId: string,
  completions: HabitCompletion[],
): string | null {
  const habitCompletions = getHabitCompletions(habitId, completions);

  if (habitCompletions.length === 0) {
    return null;
  }

  return habitCompletions
    .map((completion) => completion.completedOn)
    .sort()[0]!;
}

export function detectAutomaticFreezesNeeded(
  habit: Habit,
  completions: HabitCompletion[],
  freezeEvents: HabitFreezeUsed[],
  referenceDate: Date = new Date(),
  tier: FreezeTier = 'free',
): HabitFreezeUsed[] {
  const cap = getFreezeCap(tier);
  const completionDates = getCompletionDateKeys(habit.id, completions);
  const existingFreezes = getFreezeDateKeys(habit.id, freezeEvents);
  const endKey = getStreakEvaluationEndKey(habit, completions, referenceDate);
  const firstCompletionKey = getFirstCompletionDateKey(habit.id, completions);

  if (!firstCompletionKey || endKey < firstCompletionKey) {
    return [];
  }

  const scheduledDays = getScheduledDaysWalk(habit, firstCompletionKey, endKey);
  const newEvents: HabitFreezeUsed[] = [];
  const pendingFreezes = new Set<string>();
  let balance = 0;
  let currentWeekStart = '';

  for (const dateKey of scheduledDays) {
    const weekStart = getWeekStartKey(dateKey);

    if (weekStart !== currentWeekStart) {
      currentWeekStart = weekStart;
      balance = Math.min(balance + 1, cap);
    }

    if (completionDates.has(dateKey)) {
      continue;
    }

    if (existingFreezes.has(dateKey) || pendingFreezes.has(dateKey)) {
      balance = Math.max(0, balance - 1);
      continue;
    }

    if (balance > 0) {
      pendingFreezes.add(dateKey);
      newEvents.push({
        id: crypto.randomUUID(),
        habitId: habit.id,
        dateKey,
        usedAt: referenceDate.toISOString(),
      });
      balance -= 1;
    }
  }

  return newEvents;
}

/** Freeze do dia civil anterior — copy de reasseguramento só nesse dia. */
export function getFreezeForReassuranceDay(
  habitId: string,
  freezeEvents: HabitFreezeUsed[],
  referenceDate: Date = new Date(),
): HabitFreezeUsed | undefined {
  const previousDayKey = toDateKey(addDays(referenceDate, -1));

  return getHabitFreezeEvents(habitId, freezeEvents).find(
    (event) => event.dateKey === previousDayKey,
  );
}

export function formatFreezeReassurance(dateKey: string): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(
    parseDateKey(dateKey),
  );

  return `Protegido na ${weekday} — sequência intacta`;
}

export function computeHabitStreakSnapshot(
  habit: Habit,
  completions: HabitCompletion[],
  freezeEvents: HabitFreezeUsed[],
  referenceDate: Date = new Date(),
): HabitStreakSnapshot {
  const totalCompletions = computeTotalCompletions(habit.id, completions);

  return {
    currentStreak: computeCurrentStreak(habit, completions, freezeEvents, referenceDate),
    bestStreak: computeBestStreak(habit, completions, freezeEvents, referenceDate),
    totalCompletions,
    isDayOne: totalCompletions === 0,
  };
}
