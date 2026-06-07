import { HABIT_CATEGORY_LABELS, type HabitCategory } from '../models/habit-category.model';
import { ALL_WEEKDAYS, type Habit } from '../models/habit.model';
import type { Weekday } from '../models/weekday.model';

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

export function normalizeHabit(raw: LegacyHabit): Habit {
  const scheduleDays =
    raw.scheduleDays && raw.scheduleDays.length > 0
      ? ([...raw.scheduleDays] as Weekday[])
      : ALL_WEEKDAYS;

  const trigger1 = raw.trigger1?.trim() || raw.triggerText?.trim() || '';
  const trigger2 = raw.trigger2?.trim() || trigger1;

  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name?.trim() ?? '',
    category: resolveCategory(raw.category),
    trigger1,
    trigger2,
    motivation1: raw.motivation1?.trim() || 'Consistência em construção',
    motivation2: raw.motivation2?.trim() || 'Um passo de cada vez',
    minimumAction: raw.minimumAction?.trim() ?? '',
    scheduleDays,
    optionalReminder: raw.optionalReminder?.trim() ?? '',
    archived: raw.archived ?? false,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    showOnToday: raw.showOnToday ?? true,
  };
}
