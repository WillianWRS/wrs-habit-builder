import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

function routePaths(routeList: typeof routes): string[] {
  return routeList
    .filter((route) => route.path !== undefined && route.path !== '**')
    .map((route) => route.path as string);
}

describe('app.routes', () => {
  it('registra rotas principais do app', () => {
    const paths = routePaths(routes);

    expect(paths).toContain('today');
    expect(paths).toContain('habits');
    expect(paths).toContain('habits/new');
    expect(paths).toContain('habits/:id/edit');
    expect(paths).toContain('habits/:id');
    expect(paths).toContain('progress');
    expect(paths).toContain('settings');
  });

  it('coloca rotas de formulário antes da lista habits', () => {
    const paths = routePaths(routes);
    const newIndex = paths.indexOf('habits/new');
    const editIndex = paths.indexOf('habits/:id/edit');
    const detailIndex = paths.indexOf('habits/:id');
    const listIndex = paths.indexOf('habits');

    expect(newIndex).toBeGreaterThan(-1);
    expect(editIndex).toBeGreaterThan(newIndex);
    expect(detailIndex).toBeGreaterThan(editIndex);
    expect(listIndex).toBeGreaterThan(detailIndex);
  });

  it('aplica canDeactivate nas páginas de formulário', () => {
    const newRoute = routes.find((route) => route.path === 'habits/new');
    const editRoute = routes.find((route) => route.path === 'habits/:id/edit');

    expect(newRoute?.canDeactivate?.length).toBeGreaterThan(0);
    expect(editRoute?.canDeactivate?.length).toBeGreaterThan(0);
  });

  it('redireciona rotas legadas', () => {
    const historico = routes.find((route) => route.path === 'historico');
    const data = routes.find((route) => route.path === 'data');
    const root = routes.find(
      (route) => route.path === '' && route.pathMatch === 'full',
    );

    expect(historico?.redirectTo).toBe('progress');
    expect(data?.redirectTo).toBe('settings');
    expect(root?.redirectTo).toBe('today');
  });
});
