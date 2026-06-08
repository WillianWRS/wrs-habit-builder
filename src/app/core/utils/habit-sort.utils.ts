export type HabitSort =
  | 'days-asc'
  | 'days-desc'
  | 'name-asc'
  | 'name-desc';

export const HABIT_SORT_OPTIONS: ReadonlyArray<{
  id: HabitSort;
  label: string;
}> = [
  { id: 'days-desc', label: 'Dias · maior primeiro' },
  { id: 'days-asc', label: 'Dias · menor primeiro' },
  { id: 'name-asc', label: 'Nome · A → Z' },
  { id: 'name-desc', label: 'Nome · Z → A' },
];

export function compareHabitsByPreference<
  T extends { dayCount: number; name: string },
>(a: T, b: T, sort: HabitSort): number {
  switch (sort) {
    case 'days-asc':
      return a.dayCount - b.dayCount;
    case 'days-desc':
      return b.dayCount - a.dayCount;
    case 'name-asc':
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    case 'name-desc':
      return b.name.localeCompare(a.name, 'pt-BR', { sensitivity: 'base' });
  }
}

export function sortHabitsByPreference<
  T extends { dayCount: number; name: string },
>(habits: T[], sort: HabitSort): T[] {
  return [...habits].sort((a, b) => compareHabitsByPreference(a, b, sort));
}
