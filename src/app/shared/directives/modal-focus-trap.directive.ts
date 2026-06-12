import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  input,
  Injector,
  OnDestroy,
} from '@angular/core';
import {
  focusFirstElement,
  handleModalTabKey,
  restoreFocusToElement,
} from './modal-focus-trap.utils';

@Directive({
  selector: '[appModalFocusTrap]',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class ModalFocusTrapDirective implements OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly previouslyFocused = document.activeElement as HTMLElement | null;
  private restored = false;

  /** Seletor CSS do elemento que deve receber foco ao abrir (ex.: #habit-name). */
  readonly initialFocusSelector = input<string>();

  constructor() {
    afterNextRender(
      () => {
        focusFirstElement(this.element.nativeElement, this.initialFocusSelector());
      },
      { injector: this.injector },
    );
  }

  ngOnDestroy(): void {
    if (this.restored) {
      return;
    }

    this.restored = true;
    restoreFocusToElement(this.previouslyFocused);
  }

  protected onKeydown(event: KeyboardEvent): void {
    handleModalTabKey(event, this.element.nativeElement);
  }
}
