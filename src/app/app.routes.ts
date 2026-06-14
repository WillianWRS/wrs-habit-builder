import { Routes } from '@angular/router';
import { habitFormCanDeactivateGuard } from './core/guards/habit-form-can-deactivate.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'today',
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/privacy/pages/privacy-page/privacy-page.component').then(
        (m) => m.PrivacyPageComponent,
      ),
  },
  {
    path: 'today',
    loadComponent: () =>
      import('./features/today/pages/today-page/today-page.component').then(
        (m) => m.TodayPageComponent,
      ),
  },
  {
    path: 'habits/new',
    loadComponent: () =>
      import('./features/habit-form/pages/habit-new-page/habit-new-page.component').then(
        (m) => m.HabitNewPageComponent,
      ),
    canDeactivate: [habitFormCanDeactivateGuard],
  },
  {
    path: 'habits/:id/edit',
    loadComponent: () =>
      import('./features/habit-form/pages/habit-edit-page/habit-edit-page.component').then(
        (m) => m.HabitEditPageComponent,
      ),
    canDeactivate: [habitFormCanDeactivateGuard],
  },
  {
    path: 'habits/:id',
    loadComponent: () =>
      import(
        './features/habit-detail/pages/habit-detail-page/habit-detail-page.component'
      ).then((m) => m.HabitDetailPageComponent),
  },
  {
    path: 'habits',
    loadComponent: () =>
      import('./features/habits/pages/habits-page/habits-page.component').then(
        (m) => m.HabitsPageComponent,
      ),
  },
  {
    path: 'progress',
    loadComponent: () =>
      import('./features/progress/pages/progress-page/progress-page.component').then(
        (m) => m.ProgressPageComponent,
      ),
  },
  {
    path: 'share-photo',
    loadComponent: () =>
      import(
        './features/share-photo/pages/share-photo-page/share-photo-page.component'
      ).then((m) => m.SharePhotoPageComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/pages/settings-page/settings-page.component').then(
        (m) => m.SettingsPageComponent,
      ),
  },
  {
    path: 'historico',
    redirectTo: 'progress',
  },
  {
    path: 'data',
    redirectTo: 'settings',
  },
  {
    path: '**',
    redirectTo: 'today',
  },
];
