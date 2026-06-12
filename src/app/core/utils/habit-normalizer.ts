import { HABIT_CATEGORY_LABELS, type HabitCategory } from '../models/habit-category.model';
import {
  createDefaultWeekdayGoals,
  type HabitWeekdayGoal,
} from '../models/habit-weekday-goal.model';
import { ALL_WEEKDAYS, type Habit } from '../models/habit.model';
import { padSlots } from '../models/habit-slot.model';
import type { Weekday } from '../models/weekday.model';
import { toDateKey } from './date.utils';
import { mergeScheduleDaySince } from './habit-streak.utils';
import { resolveTriggerMotivationFields } from './habit-trigger-motivation.utils';

type LegacyHabitPayload = Record<string, unknown>;

function resolveCategory(category: unknown): string {
  if (!category) {
    return '';
  }

  if (typeof category === 'string' && category in HABIT_CATEGORY_LABELS) {
    return HABIT_CATEGORY_LABELS[category as HabitCategory];
  }

  return String(category);
}

/** Aceita `time` (v9+) e `optionalReminder` (legado) em imports JSON. */
export function resolveRawTime(raw: Record<string, unknown>): string {
  return String(raw['time'] ?? raw['optionalReminder'] ?? '').trim();
}

function normalizeWeekdayGoals(rawGoals: unknown): HabitWeekdayGoal[] {
  const defaults = createDefaultWeekdayGoals();

  if (!Array.isArray(rawGoals) || rawGoals.length === 0) {
    return defaults;
  }

  return defaults.map((entry) => {
    const match = (rawGoals as Record<string, unknown>[]).find(
      (goal) => goal['weekday'] === entry.weekday,
    );

    return {
      weekday: entry.weekday,
      meta: String(match?.['meta'] ?? '').trim(),
      minimumAction: String(match?.['minimumAction'] ?? '').trim(),
      time: match ? resolveRawTime(match) : '',
    };
  });
}

function resolveSlots(raw: LegacyHabitPayload): {
  triggers: Habit['triggers'];
  motivations: Habit['motivations'];
} {
  if (Array.isArray(raw['triggers']) && Array.isArray(raw['motivations'])) {
    return {
      triggers: padSlots(raw['triggers'] as Habit['triggers']),
      motivations: padSlots(raw['motivations'] as Habit['motivations']),
    };
  }

  throw new Error('[normalizeHabit] expected triggers/motivations arrays');
}

/** Normaliza hábito no schema atual (v9) — arrays triggers/motivations. */
export function normalizeHabit(raw: LegacyHabitPayload): Habit {
  const scheduleDays =
    Array.isArray(raw['scheduleDays']) && raw['scheduleDays'].length > 0
      ? ([...raw['scheduleDays']] as Weekday[])
      : ALL_WEEKDAYS;

  const createdAt =
    typeof raw['createdAt'] === 'string' ? raw['createdAt'] : new Date().toISOString();
  const createdDateKey = toDateKey(new Date(createdAt));
  const previousScheduleDays =
    Array.isArray(raw['scheduleDays']) && raw['scheduleDays'].length > 0
      ? ([...raw['scheduleDays']] as Weekday[])
      : scheduleDays;
  let scheduleDaySince =
    raw['scheduleDaySince'] && typeof raw['scheduleDaySince'] === 'object'
      ? { ...(raw['scheduleDaySince'] as Habit['scheduleDaySince']) }
      : {};
  scheduleDaySince = mergeScheduleDaySince(
    scheduleDaySince,
    previousScheduleDays,
    scheduleDays,
    createdDateKey,
  );

  for (const weekday of scheduleDays) {
    if (!scheduleDaySince[weekday]) {
      scheduleDaySince[weekday] = createdDateKey;
    }
  }

  const { triggers, motivations } = resolveSlots(raw);

  return {
    id: typeof raw['id'] === 'string' ? raw['id'] : crypto.randomUUID(),
    name: String(raw['name'] ?? '').trim(),
    generalGoal: String(raw['generalGoal'] ?? raw['metaGeral'] ?? '').trim(),
    dynamicGoals: Boolean(raw['dynamicGoals'] ?? raw['metasDinamicas'] ?? false),
    weekdayGoals: normalizeWeekdayGoals(raw['weekdayGoals']),
    category: resolveCategory(raw['category']),
    triggers,
    motivations,
    minimumAction: String(raw['minimumAction'] ?? '').trim(),
    scheduleDays,
    scheduleDaySince,
    time: resolveRawTime(raw),
    archived: Boolean(raw['archived'] ?? false),
    createdAt,
    showOnToday: raw['showOnToday'] !== false,
  };
}

/**
 * Normaliza hábito legado (v5) para schema v6/v7 com campos numerados.
 * Usado apenas em migrateV5ToV6.
 */
export function normalizeLegacyNumberedHabit(raw: LegacyHabitPayload): LegacyHabitPayload {
  const scheduleDays =
    Array.isArray(raw['scheduleDays']) && raw['scheduleDays'].length > 0
      ? ([...raw['scheduleDays']] as Weekday[])
      : ALL_WEEKDAYS;

  const createdAt =
    typeof raw['createdAt'] === 'string' ? raw['createdAt'] : new Date().toISOString();
  const createdDateKey = toDateKey(new Date(createdAt));
  const previousScheduleDays =
    Array.isArray(raw['scheduleDays']) && raw['scheduleDays'].length > 0
      ? ([...raw['scheduleDays']] as Weekday[])
      : scheduleDays;
  let scheduleDaySince =
    raw['scheduleDaySince'] && typeof raw['scheduleDaySince'] === 'object'
      ? { ...(raw['scheduleDaySince'] as Habit['scheduleDaySince']) }
      : {};
  scheduleDaySince = mergeScheduleDaySince(
    scheduleDaySince,
    previousScheduleDays,
    scheduleDays,
    createdDateKey,
  );

  for (const weekday of scheduleDays) {
    if (!scheduleDaySince[weekday]) {
      scheduleDaySince[weekday] = createdDateKey;
    }
  }

  const triggerMotivation = resolveTriggerMotivationFields(
    raw as Parameters<typeof resolveTriggerMotivationFields>[0],
  );

  return {
    id: typeof raw['id'] === 'string' ? raw['id'] : crypto.randomUUID(),
    name: String(raw['name'] ?? '').trim(),
    metaGeral: String(raw['metaGeral'] ?? '').trim(),
    metasDinamicas: Boolean(raw['metasDinamicas'] ?? false),
    weekdayGoals: normalizeWeekdayGoals(raw['weekdayGoals']),
    category: resolveCategory(raw['category']),
    ...triggerMotivation,
    minimumAction: String(raw['minimumAction'] ?? '').trim(),
    scheduleDays,
    scheduleDaySince,
    optionalReminder: resolveRawTime(raw),
    archived: Boolean(raw['archived'] ?? false),
    createdAt,
    showOnToday: raw['showOnToday'] !== false,
  };
}
