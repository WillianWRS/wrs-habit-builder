import type { AppStorage } from '../models/app-storage.model';
import { buildInitialCategories } from '../utils/habit-categories.utils';

/** Introduz lista persistida de categorias para o formulário de hábitos. */
export function migrateV10ToV11(data: AppStorage): AppStorage {
  const habitCategories = data.habits.map((habit) => habit.category);

  return {
    ...data,
    version: 11,
    categories: buildInitialCategories(habitCategories, data.categories),
  };
}
