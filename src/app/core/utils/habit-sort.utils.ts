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

export function sortHabitsByPreference<
  T extends { dayCount: number; name: string },
>(habits: T[], sort: HabitSort): T[] {
  const sorted = [...habits];

  switch (sort) {
    case 'days-asc':
      return sorted.sort((a, b) => a.dayCount - b.dayCount);
    case 'days-desc':
      return sorted.sort((a, b) => b.dayCount - a.dayCount);
    case 'name-asc':
      return sorted.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      );
    case 'name-desc':
      return sorted.sort((a, b) =>
        b.name.localeCompare(a.name, 'pt-BR', { sensitivity: 'base' }),
      );
  }
}
