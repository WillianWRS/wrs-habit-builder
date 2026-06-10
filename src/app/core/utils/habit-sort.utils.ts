export type HabitSort =
  | 'time-asc'
  | 'days-asc'
  | 'days-desc'
  | 'name-asc'
  | 'name-desc';

export const HABIT_SORT_OPTIONS: ReadonlyArray<{
  id: HabitSort;
  label: string;
}> = [
  { id: 'time-asc', label: 'Horário · mais cedo primeiro' },
  { id: 'days-desc', label: 'Dias · maior primeiro' },
  { id: 'days-asc', label: 'Dias · menor primeiro' },
  { id: 'name-asc', label: 'Nome · A → Z' },
  { id: 'name-desc', label: 'Nome · Z → A' },
];

type HabitSortable = {
  dayCount: number;
  name: string;
  time: string;
};

/**
 * Compara horários no formato HH:mm.
 * Hábitos sem horário vão ao final; horários iguais ou ambos vazios retornam 0
 * (desempate por nome fica a cargo do chamador).
 */
function compareTimeAsc(a: string, b: string): number {
  const timeA = a.trim();
  const timeB = b.trim();

  if (!timeA && !timeB) {
    return 0;
  }

  if (!timeA) {
    return 1;
  }

  if (!timeB) {
    return -1;
  }

  return timeA.localeCompare(timeB);
}

function compareNameAsc(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

export function compareHabitsByPreference<T extends HabitSortable>(
  a: T,
  b: T,
  sort: HabitSort,
): number {
  switch (sort) {
    case 'time-asc': {
      const timeCmp = compareTimeAsc(a.time, b.time);

      if (timeCmp !== 0) {
        return timeCmp;
      }

      return compareNameAsc(a.name, b.name);
    }
    case 'days-asc':
      return a.dayCount - b.dayCount;
    case 'days-desc':
      return b.dayCount - a.dayCount;
    case 'name-asc':
      return compareNameAsc(a.name, b.name);
    case 'name-desc':
      return compareNameAsc(b.name, a.name);
  }
}

export function sortHabitsByPreference<T extends HabitSortable>(
  habits: T[],
  sort: HabitSort,
): T[] {
  return [...habits].sort((a, b) => compareHabitsByPreference(a, b, sort));
}
