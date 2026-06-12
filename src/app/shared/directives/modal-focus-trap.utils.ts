export const MODAL_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(MODAL_FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.tabIndex !== -1 &&
      isElementVisible(element),
  );
}

function isElementVisible(element: HTMLElement): boolean {
  if (element.hasAttribute('hidden')) {
    return false;
  }

  if (element.getClientRects().length > 0) {
    return true;
  }

  const style = getComputedStyle(element);

  return style.display !== 'none' && style.visibility !== 'hidden';
}

export function focusFirstElement(
  root: HTMLElement,
  initialFocusSelector?: string,
): void {
  if (initialFocusSelector) {
    const preferred = root.querySelector<HTMLElement>(initialFocusSelector);

    if (preferred && isFocusableElement(preferred, root)) {
      preferred.focus();
      return;
    }
  }

  const focusable = getFocusableElements(root);

  if (focusable.length > 0) {
    focusable[0].focus();
    return;
  }

  if (root.tabIndex < 0) {
    root.tabIndex = -1;
  }

  root.focus();
}

function isFocusableElement(element: HTMLElement, root: HTMLElement): boolean {
  if (!root.contains(element)) {
    return false;
  }

  return getFocusableElements(root).includes(element);
}

export function handleModalTabKey(event: KeyboardEvent, root: HTMLElement): void {
  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements(root);

  if (focusable.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || (active && !root.contains(active))) {
      event.preventDefault();
      last.focus();
    }

    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function restoreFocusToElement(element: HTMLElement | null): void {
  if (!element || typeof element.focus !== 'function') {
    return;
  }

  if (!document.contains(element)) {
    return;
  }

  element.focus();
}
