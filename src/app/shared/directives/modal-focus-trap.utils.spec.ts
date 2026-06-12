import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  focusFirstElement,
  getFocusableElements,
  handleModalTabKey,
  restoreFocusToElement,
} from './modal-focus-trap.utils';

describe('modal-focus-trap.utils', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('lista apenas elementos visíveis e focáveis', () => {
    container.innerHTML = `
      <button type="button" id="first">Primeiro</button>
      <button type="button" hidden id="hidden">Oculto</button>
      <input type="hidden" id="hidden-input" />
      <button type="button" disabled id="disabled">Desabilitado</button>
      <button type="button" id="last">Último</button>
    `;

    const focusable = getFocusableElements(container);

    expect(focusable.map((element) => element.id)).toEqual(['first', 'last']);
  });

  it('foca o seletor preferido quando informado', () => {
    container.innerHTML = `
      <button type="button" id="close">Fechar</button>
      <input type="text" id="name" />
    `;

    focusFirstElement(container, '#name');

    expect(document.activeElement?.id).toBe('name');
  });

  it('foca o primeiro elemento interativo ao abrir', () => {
    container.innerHTML = `
      <button type="button" id="first">Primeiro</button>
      <button type="button" id="second">Segundo</button>
    `;

    focusFirstElement(container);

    expect(document.activeElement?.id).toBe('first');
  });

  it('cicla do último para o primeiro ao pressionar Tab', () => {
    container.innerHTML = `
      <button type="button" id="first">Primeiro</button>
      <button type="button" id="last">Último</button>
    `;

    const last = container.querySelector('#last') as HTMLButtonElement;
    last.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    handleModalTabKey(event, container);

    expect(preventDefault).toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('first');
  });

  it('restaura o foco no elemento anterior quando ainda está no DOM', () => {
    const trigger = document.createElement('button');
    trigger.id = 'trigger';
    document.body.appendChild(trigger);
    trigger.focus();

    restoreFocusToElement(trigger);

    expect(document.activeElement?.id).toBe('trigger');
    trigger.remove();
  });
});
