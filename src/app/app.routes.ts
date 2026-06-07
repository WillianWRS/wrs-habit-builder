import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/today/pages/today-page/today-page.component').then(
        (m) => m.TodayPageComponent,
      ),
  },
];
