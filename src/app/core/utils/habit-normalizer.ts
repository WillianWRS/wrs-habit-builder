import { HABIT_CATEGORY_LABELS, type HabitCategory } from '../models/habit-category.model';
import {
  createDefaultWeekdayGoals,
  type HabitWeekdayGoal,
} from '../models/habit-weekday-goal.model';
import { ALL_WEEKDAYS, type Habit } from '../models/habit.model';
import type { Weekday } from '../models/weekday.model';
import { toDateKey } from './date.utils';
import {
  mergeScheduleDaySince,
} from './habit-streak.utils';

type LegacyHabit = Partial<Habit> & {
  triggerText?: string;
  category?: string | HabitCategory;
};

function resolveCategory(category: LegacyHabit['category']): string {
  if (!category) {
    return '';
  }

  if (category in HABIT_CATEGORY_LABELS) {
    return HABIT_CATEGORY_LABELS[category as HabitCategory];
  }

  return String(category);
}

function normalizeWeekdayGoals(
  rawGoals: LegacyHabit['weekdayGoals'],
): HabitWeekdayGoal[] {
  const defaults = createDefaultWeekdayGoals();

  if (!rawGoals || rawGoals.length === 0) {
    return defaults;
  }

  return defaults.map((entry) => {
    const match = rawGoals.find((goal) => goal.weekday === entry.weekday);

    return {
      weekday: entry.weekday,
      meta: match?.meta?.trim() ?? '',
      minimumAction: match?.minimumAction?.trim() ?? '',
      optionalReminder: match?.optionalReminder?.trim() ?? '',
    };
  });
}

export function normalizeHabit(raw: LegacyHabit): Habit {
  const scheduleDays =
    raw.scheduleDays && raw.scheduleDays.length > 0
      ? ([...raw.scheduleDays] as Weekday[])
      : ALL_WEEKDAYS;

  const trigger1 = raw.trigger1?.trim() || raw.triggerText?.trim() || '';
  const trigger2 = raw.trigger2?.trim() || trigger1;
  const createdAt = raw.createdAt ?? new Date().toISOString();
  const createdDateKey = toDateKey(new Date(createdAt));
  const previousScheduleDays =
    raw.scheduleDays && raw.scheduleDays.length > 0
      ? ([...raw.scheduleDays] as Weekday[])
      : scheduleDays;
  let scheduleDaySince =
    raw.scheduleDaySince && Object.keys(raw.scheduleDaySince).length > 0
      ? { ...raw.scheduleDaySince }
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

  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name?.trim() ?? '',
    metaGeral: raw.metaGeral?.trim() ?? '',
    metasDinamicas: raw.metasDinamicas ?? false,
    weekdayGoals: normalizeWeekdayGoals(raw.weekdayGoals),
    category: resolveCategory(raw.category),
    trigger1,
    trigger2,
    motivation1: raw.motivation1?.trim() || 'Consistência em construção',
    motivation2: raw.motivation2?.trim() || 'Um passo de cada vez',
    minimumAction: raw.minimumAction?.trim() ?? '',
    scheduleDays,
    scheduleDaySince,
    optionalReminder: raw.optionalReminder?.trim() ?? '',
    archived: raw.archived ?? false,
    createdAt,
    showOnToday: raw.showOnToday ?? true,
  };
}
