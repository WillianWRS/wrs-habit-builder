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
  {
    path: 'data',
    loadComponent: () =>
      import(
        './features/data/pages/data-management-page/data-management-page.component'
      ).then((m) => m.DataManagementPageComponent),
  },
  {
    path: 'historico',
    loadComponent: () =>
      import(
        './features/historico/pages/historico-page/historico-page.component'
      ).then((m) => m.HistoricoPageComponent),
  },
];
