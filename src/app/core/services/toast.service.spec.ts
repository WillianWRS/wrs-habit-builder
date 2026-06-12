import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOAST_EXIT_ANIMATION_MS, ToastService } from './toast.service';

function finishToastExit(): void {
  vi.advanceTimersByTime(TOAST_EXIT_ANIMATION_MS);
}

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('adiciona toast de sucesso e remove ao dispensar', () => {
    service.showSuccess('Hábito criado');

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]?.message).toBe('Hábito criado');
    expect(service.toasts()[0]?.type).toBe('success');

    service.dismiss(service.toasts()[0]!.id, 'close');

    expect(service.toasts()[0]?.exiting).toBe(true);
    finishToastExit();
    expect(service.toasts()).toHaveLength(0);
  });

  it('chama onUndo ao dispensar com motivo undo', () => {
    const onUndo = vi.fn();
    const onCommit = vi.fn();

    service.showUndo('Hábito arquivado', onUndo, { onCommit });
    const id = service.toasts()[0]!.id;

    service.dismiss(id, 'undo');

    expect(onUndo).toHaveBeenCalledOnce();
    expect(onCommit).not.toHaveBeenCalled();
    finishToastExit();
    expect(service.toasts()).toHaveLength(0);
  });

  it('chama onCommit ao fechar com X ou expirar o timer', () => {
    const onUndo = vi.fn();
    const onCommit = vi.fn();

    service.showUndo('Hábito excluído', onUndo, { onCommit, icon: 'trash' });
    const id = service.toasts()[0]!.id;

    service.dismiss(id, 'close');

    expect(onCommit).toHaveBeenCalledOnce();
    expect(onUndo).not.toHaveBeenCalled();

    service.showUndo('Outro hábito excluído', onUndo, { onCommit });

    vi.advanceTimersByTime(6000);
    finishToastExit();

    expect(onCommit).toHaveBeenCalledTimes(2);
    expect(service.toasts()).toHaveLength(0);
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('limita a fila visível e commita toasts removidos por overflow', () => {
    const commits: string[] = [];

    for (let index = 0; index < 4; index++) {
      service.showUndo(`Toast ${index}`, vi.fn(), {
        onCommit: () => commits.push(`Toast ${index}`),
      });
    }

    expect(service.toasts()).toHaveLength(3);
    expect(service.toasts().map((toast) => toast.message)).toEqual([
      'Toast 1',
      'Toast 2',
      'Toast 3',
    ]);
    expect(commits).toEqual(['Toast 0']);
  });
});
