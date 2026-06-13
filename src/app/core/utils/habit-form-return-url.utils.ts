export type HabitFormReturnUrl = '/today' | '/habits';

export const HABIT_NEW_ROUTE = ['/habits', 'new'] as const;

export interface HabitNewLink {
  route: typeof HABIT_NEW_ROUTE;
  queryParams: { returnUrl: HabitFormReturnUrl };
}

export function sanitizeHabitFormReturnUrl(value: string | null | undefined): HabitFormReturnUrl {
  if (value === '/habits') {
    return '/habits';
  }

  return '/today';
}

/** Para `routerLink` — não embutir query na string (Angular não resolve corretamente). */
export function buildHabitNewLink(returnUrl: HabitFormReturnUrl): HabitNewLink {
  return {
    route: HABIT_NEW_ROUTE,
    queryParams: { returnUrl },
  };
}

/** Para navegação programática (`navigateByUrl`). */
export function buildHabitNewUrl(returnUrl: HabitFormReturnUrl): string {
  return `/habits/new?returnUrl=${encodeURIComponent(returnUrl)}`;
}
