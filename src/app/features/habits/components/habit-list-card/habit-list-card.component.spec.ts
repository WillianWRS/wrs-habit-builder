import { describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitListCardComponent } from './habit-list-card.component';

describe('HabitListCardComponent', () => {
  let fixture: ComponentFixture<HabitListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitListCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitListCardComponent);
    fixture.componentRef.setInput('name', 'Leitura');
    fixture.componentRef.setInput('time', '');
    fixture.componentRef.setInput('category', 'Conhecimento');
    fixture.componentRef.setInput('marqueeItems', []);
    fixture.componentRef.setInput('minimumAction', 'Ler 1 página');
    fixture.detectChanges();
  });

  it('não emite openDetail ao clicar no card', () => {
    const openDetail = vi.fn();
    fixture.componentInstance.openDetail.subscribe(openDetail);

    const article = fixture.nativeElement.querySelector('article') as HTMLElement;
    article.click();

    expect(openDetail).not.toHaveBeenCalled();
  });

  it('emite openDetail ao clicar no botão Progresso', () => {
    const openDetail = vi.fn();
    fixture.componentInstance.openDetail.subscribe(openDetail);

    const viewButton = fixture.nativeElement.querySelector(
      'button[aria-label="Ver progresso de Leitura"]',
    ) as HTMLButtonElement;
    viewButton.click();

    expect(openDetail).toHaveBeenCalledTimes(1);
  });

  it('não emite openDetail ao clicar em botão de ação', () => {
    const openDetail = vi.fn();
    fixture.componentInstance.openDetail.subscribe(openDetail);

    const editButton = fixture.nativeElement.querySelector(
      'button[aria-label="Editar Leitura"]',
    ) as HTMLButtonElement;
    editButton.click();

    expect(openDetail).not.toHaveBeenCalled();
  });
});
