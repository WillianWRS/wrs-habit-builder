import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/today/pages/today-page/today-page.component').then(
        (m) => m.TodayPageComponent,
      ),
  },
  {
    path: 'habits',
    loadComponent: () =>
      import('./features/habits/pages/habits-page/habits-page.component').then(
        (m) => m.HabitsPageComponent,
      ),
  },
];
