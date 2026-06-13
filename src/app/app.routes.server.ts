import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'today',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'habits',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'habits/new',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'privacy',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'habits/:id/edit',
    renderMode: RenderMode.Client,
  },
  {
    path: 'habits/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'progress',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'settings',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'historico',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'data',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
