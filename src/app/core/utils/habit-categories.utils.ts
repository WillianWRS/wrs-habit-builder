import { DEFAULT_HABIT_CATEGORIES } from '../constants/habit-categories.constants';

export function normalizeCategoryName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function findCategoryMatch(
  categories: readonly string[],
  value: string,
): string | undefined {
  const normalized = normalizeCategoryName(value).toLowerCase();

  if (!normalized) {
    return undefined;
  }

  return categories.find(
    (category) => category.toLowerCase() === normalized,
  );
}

/** Mescla categorias preservando ordem e evitando duplicatas (case-insensitive). */
export function mergeUniqueCategories(
  ...lists: readonly (readonly string[])[]
): string[] {
  const merged: string[] = [];

  for (const list of lists) {
    for (const entry of list) {
      const normalized = normalizeCategoryName(entry);

      if (!normalized) {
        continue;
      }

      if (findCategoryMatch(merged, normalized)) {
        continue;
      }

      merged.push(normalized);
    }
  }

  return merged;
}

export function buildInitialCategories(
  habitCategories: readonly string[],
  storedCategories?: readonly string[],
): string[] {
  return mergeUniqueCategories(
    DEFAULT_HABIT_CATEGORIES,
    storedCategories ?? [],
    habitCategories,
  );
}
