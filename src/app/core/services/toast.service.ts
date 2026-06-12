import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'undo';

export type ToastIcon = 'check' | 'archive' | 'trash' | 'refresh';

export type ToastDismissReason = 'close' | 'undo' | 'expire';

export const TOAST_ICON_CLASS: Record<ToastIcon, string> = {
  check: 'bi-check-lg',
  archive: 'bi-archive',
  trash: 'bi-trash',
  refresh: 'bi-arrow-counterclockwise',
};

export const TOAST_DEFAULT_DURATION_MS: Record<ToastType, number> = {
  success: 3000,
  undo: 6000,
};

export interface ShowToastOptions {
  message: string;
  type?: ToastType;
  icon?: ToastIcon;
  durationMs?: number;
  undoLabel?: string;
  onUndo?: () => void;
  onCommit?: () => void;
}

export interface ShowUndoOptions {
  onCommit?: () => void;
  durationMs?: number;
  icon?: ToastIcon;
}

export interface ActiveToast {
  id: string;
  message: string;
  type: ToastType;
  icon: ToastIcon;
  durationMs: number;
  undoLabel: string;
  onUndo?: () => void;
  onCommit?: () => void;
  exiting?: boolean;
}

const MAX_VISIBLE_TOASTS = 3;
export const TOAST_EXIT_ANIMATION_MS = 220;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = signal<ActiveToast[]>([]);

  show(options: ShowToastOptions): string {
    const type = options.type ?? 'success';
    const durationMs = options.durationMs ?? TOAST_DEFAULT_DURATION_MS[type];
    const id = crypto.randomUUID();

    const toast: ActiveToast = {
      id,
      message: options.message,
      type,
      icon: options.icon ?? (type === 'success' ? 'check' : 'archive'),
      durationMs,
      undoLabel: options.undoLabel ?? 'Desfazer',
      onUndo: options.onUndo,
      onCommit: options.onCommit,
    };

    this.toasts.update((list) => {
      const next = [...list, toast];
      const overflow = next.length - MAX_VISIBLE_TOASTS;

      if (overflow > 0) {
        for (const removed of next.slice(0, overflow)) {
          this.clearTimer(removed.id);
          removed.onCommit?.();
        }

        return next.slice(-MAX_VISIBLE_TOASTS);
      }

      return next;
    });

    const timer = setTimeout(() => this.dismiss(id, 'expire'), durationMs);
    this.timers.set(id, timer);

    return id;
  }

  showSuccess(
    message: string,
    icon: ToastIcon = 'check',
    durationMs = TOAST_DEFAULT_DURATION_MS.success,
  ): string {
    return this.show({ message, type: 'success', icon, durationMs });
  }

  showUndo(
    message: string,
    onUndo: () => void,
    options?: ShowUndoOptions,
  ): string {
    return this.show({
      message,
      type: 'undo',
      icon: options?.icon ?? 'archive',
      durationMs: options?.durationMs,
      onUndo,
      onCommit: options?.onCommit,
    });
  }

  dismiss(id: string, reason: ToastDismissReason): void {
    const toast = this.toasts().find((item) => item.id === id);

    if (!toast || toast.exiting) {
      return;
    }

    this.clearTimer(id);

    if (reason === 'undo') {
      toast.onUndo?.();
    } else if (reason === 'close' || reason === 'expire') {
      toast.onCommit?.();
    }

    this.toasts.update((list) =>
      list.map((item) => (item.id === id ? { ...item, exiting: true } : item)),
    );

    setTimeout(() => {
      this.toasts.update((list) => list.filter((item) => item.id !== id));
    }, TOAST_EXIT_ANIMATION_MS);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
