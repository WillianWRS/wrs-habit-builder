export const HABIT_LIST_FLIP_MS = 400;

export function captureListItemPositions(
  container: HTMLElement,
): Map<string, DOMRect> {
  const positions = new Map<string, DOMRect>();

  container.querySelectorAll<HTMLElement>('[data-habit-id]').forEach((element) => {
    const id = element.dataset['habitId'];

    if (id) {
      positions.set(id, element.getBoundingClientRect());
    }
  });

  return positions;
}

export function flipListItems(
  container: HTMLElement,
  previousPositions: Map<string, DOMRect>,
  durationMs = HABIT_LIST_FLIP_MS,
): void {
  container.querySelectorAll<HTMLElement>('[data-habit-id]').forEach((element) => {
    const id = element.dataset['habitId'];
    const previous = id ? previousPositions.get(id) : undefined;

    if (!previous) {
      return;
    }

    const next = element.getBoundingClientRect();
    const deltaY = previous.top - next.top;

    if (Math.abs(deltaY) < 1) {
      return;
    }

    element.style.transform = `translateY(${deltaY}px)`;
    element.style.transition = 'transform 0s';

    requestAnimationFrame(() => {
      element.style.transition = `transform ${durationMs}ms ease`;
      element.style.transform = '';
    });

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform') {
        return;
      }

      element.style.transition = '';
      element.removeEventListener('transitionend', onTransitionEnd);
    };

    element.addEventListener('transitionend', onTransitionEnd);
  });
}

export function shouldAnimateHabitList(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
