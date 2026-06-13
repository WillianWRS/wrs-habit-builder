import type { CanDeactivateFn } from '@angular/router';
import type { HabitFormPageHost } from '../../features/habit-form/pages/habit-form-page-host';

export const habitFormCanDeactivateGuard: CanDeactivateFn<HabitFormPageHost> = (
  component,
) => component.confirmLeave();
