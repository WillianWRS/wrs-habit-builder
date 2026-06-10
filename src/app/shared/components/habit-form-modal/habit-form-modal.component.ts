import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../core/constants/weekday-schedule.constants';
import { ALL_WEEKDAYS } from '../../../core/models/habit.model';
import { createDefaultWeekdayGoals } from '../../../core/models/habit-weekday-goal.model';
import type { Weekday } from '../../../core/models/weekday.model';
import { HabitFormModalService } from '../../../core/services/habit-form-modal.service';
import { HabitStorageService } from '../../../core/services/habit-storage.service';
import {
  DEFAULT_NEW_HABIT_MOTIVATION,
  DEFAULT_NEW_HABIT_TRIGGER,
} from '../../../core/utils/habit-trigger-motivation.utils';
import { HabitCardPreviewComponent } from '../habit-card-preview/habit-card-preview.component';
import type { HabitCardPreviewFormState } from '../habit-card-preview/habit-card-preview.model';
import { WeekdayScheduleComponent } from '../weekday-schedule/weekday-schedule.component';

const MINIMUM_ACTION_MAX = 140;

@Component({
  selector: 'app-habit-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, WeekdayScheduleComponent, HabitCardPreviewComponent],
  styles: `
    .habit-form-checkbox {
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      cursor: pointer;
      border-radius: 0.375rem;
      border: 2px solid var(--brand-light-border);
      background-color: transparent;
      transition:
        background-color 150ms ease,
        border-color 150ms ease,
        box-shadow 150ms ease;
    }

    .habit-form-checkbox:checked {
      border-color: var(--accent-light);
      background-color: var(--accent-light);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 8.2 6.4 11 12.5 4.8' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-size: 0.875rem 0.875rem;
      background-position: center;
      background-repeat: no-repeat;
    }

    .habit-form-checkbox:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px rgb(var(--accent-rgb-light) / 0.28);
    }

    :host-context(.dark) .habit-form-checkbox {
      border-color: var(--brand-border);
    }

    :host-context(.dark) .habit-form-checkbox:checked {
      border-color: var(--accent-dark);
      background-color: var(--accent-dark);
    }

    :host-context(.dark) .habit-form-checkbox:focus-visible {
      box-shadow: 0 0 0 2px rgb(var(--accent-rgb-dark) / 0.32);
    }

    .weekday-input-group {
      display: flex;
      min-width: 0;
      overflow: hidden;
      border: 1px solid var(--brand-light-border);
      border-radius: 0.5rem;
      background-color: var(--brand-light-bg);
      transition:
        border-color 150ms ease,
        box-shadow 150ms ease;
    }

    .weekday-input-group:focus-within {
      border-color: var(--accent-light);
      box-shadow: 0 0 0 1px var(--accent-light);
    }

    .weekday-input-group__label {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      gap: 0.25rem;
      align-self: stretch;
      border-right: 1px solid var(--brand-light-border);
      padding: 0.375rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--brand-light-text-secondary);
    }

    .weekday-input-group__label-icon {
      font-size: 0.6875rem;
      line-height: 1;
      color: var(--brand-light-text-secondary);
    }

    .weekday-input-group__control {
      min-width: 0;
      flex: 1;
      border: 0;
      background: transparent;
      padding: 0.375rem 0.625rem;
      font-size: 0.875rem;
      color: var(--brand-light-text-primary);
      outline: none;
    }

    .weekday-input-group__control[type='time'] {
      appearance: none;
      -webkit-appearance: none;
    }

    .weekday-input-group__control[type='time']::-webkit-calendar-picker-indicator,
    .habit-form-time-control::-webkit-calendar-picker-indicator {
      display: none;
      -webkit-appearance: none;
    }

    .habit-form-time-control {
      appearance: none;
      -webkit-appearance: none;
    }

    :host-context(.dark) .weekday-input-group {
      border-color: var(--brand-border);
      background-color: var(--brand-bg);
    }

    :host-context(.dark) .weekday-input-group:focus-within {
      border-color: var(--accent-dark);
      box-shadow: 0 0 0 1px var(--accent-dark);
    }

    :host-context(.dark) .weekday-input-group__label {
      border-right-color: var(--brand-border);
      color: var(--brand-text-secondary);
    }

    :host-context(.dark) .weekday-input-group__control {
      color: var(--brand-text-primary);
    }

    :host-context(.dark) .weekday-input-group__label-icon {
      color: var(--brand-text-secondary);
    }

    .habit-form-label-icon {
      font-size: 0.75rem;
      line-height: 1;
      color: var(--brand-light-text-secondary);
    }

    :host-context(.dark) .habit-form-label-icon {
      color: var(--brand-text-secondary);
    }

    .slot-input-group__icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      align-self: stretch;
      border-right: 1px solid var(--brand-light-border);
      padding: 0.375rem 0.625rem;
      font-size: 0.75rem;
      line-height: 1;
      color: var(--brand-light-text-secondary);
    }

    :host-context(.dark) .slot-input-group__icon {
      border-right-color: var(--brand-border);
      color: var(--brand-text-secondary);
    }

    .slot-control-btn {
      display: inline-flex;
      height: 2rem;
      width: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: 1px solid var(--brand-light-border);
      background-color: var(--brand-light-bg);
      font-size: 1.125rem;
      line-height: 1;
      color: var(--brand-light-text-secondary);
      transition:
        border-color 150ms ease,
        color 150ms ease,
        background-color 150ms ease;
    }

    .slot-control-btn:hover {
      border-color: var(--accent-light);
      color: var(--brand-light-text-primary);
    }

    :host-context(.dark) .slot-control-btn {
      border-color: var(--brand-border);
      background-color: var(--brand-bg);
      color: var(--brand-text-secondary);
    }

    :host-context(.dark) .slot-control-btn:hover {
      border-color: var(--accent-dark);
      color: var(--brand-text-primary);
    }
  `,
  template: `
    @if (modal.isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 pb-8 pt-20 backdrop-blur-sm md:px-6 md:pt-24"
        role="presentation"
        (click)="onBackdropClick($event)"
      >
        <div
          class="mx-auto flex w-full max-w-5xl gap-6 lg:px-8"
          role="presentation"
        >
          <div
            class="hidden w-[7.5rem] shrink-0 md:block"
            aria-hidden="true"
          ></div>

          <div
            class="min-w-0 flex-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="habit-form-title"
            (click)="$event.stopPropagation()"
          >
            <form
              class="rounded-2xl border border-brand-light-border bg-brand-light-surface shadow-xl dark:border-brand-border dark:bg-brand-surface"
              [formGroup]="form"
              (ngSubmit)="submit()"
            >
              <div
                class="flex items-center justify-between border-b border-brand-light-border px-5 py-4 dark:border-brand-border md:px-6"
              >
                <h2
                  id="habit-form-title"
                  class="font-display text-xl font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
                >
                  {{ modalTitle() }}
                </h2>
                <button
                  type="button"
                  class="rounded-lg p-2 text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
                  aria-label="Fechar"
                  (click)="close()"
                >
                  <i class="bi bi-x-lg text-sm" aria-hidden="true"></i>
                </button>
              </div>

              <div class="space-y-5 px-5 py-5 md:px-6">
                <div>
                  <label
                    for="habit-name"
                    class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    <i class="bi bi-card-text habit-form-label-icon" aria-hidden="true"></i>
                    Nome
                  </label>
                  <input
                    id="habit-name"
                    type="text"
                    formControlName="name"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Treinar musculação"
                  />
                  @if (showError('name', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe o nome do hábito.</p>
                  }
                </div>

                <div>
                  <p
                    class="mb-1.5 text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    Dias da semana
                  </p>
                  <app-weekday-schedule [(selectedDays)]="scheduleDays" />
                </div>

                <label class="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    formControlName="metasDinamicas"
                    class="habit-form-checkbox"
                  />
                  <span class="text-sm text-brand-light-text-primary dark:text-brand-text-primary">
                    Metas dinâmicas por dia
                  </span>
                </label>

                @if (!metasDinamicasActive()) {
                  <div class="space-y-5">
                    <div>
                      <label
                        for="habit-meta-geral"
                        class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                      >
                        Meta geral
                      </label>
                      <input
                        id="habit-meta-geral"
                        type="text"
                        formControlName="metaGeral"
                        autocomplete="off"
                        class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                        placeholder="Ex.: 30 minutos de leitura"
                      />
                    </div>

                    <div class="flex items-start gap-3">
                      <div class="min-w-0 flex-[8]">
                        <div class="mb-1.5 flex items-center justify-between gap-3">
                          <label
                            for="habit-minimum-action"
                            class="text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                          >
                            Ação mínima geral
                          </label>
                          <span class="text-xs text-brand-light-text-secondary dark:text-brand-text-secondary">
                            {{ minimumActionLength() }}/{{ minimumActionMax }}
                          </span>
                        </div>
                        <input
                          id="habit-minimum-action"
                          type="text"
                          formControlName="minimumAction"
                          maxlength="140"
                          class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                          placeholder="Ex.: Fazer 1 série de qualquer exercício"
                        />
                        @if (showError('minimumAction', 'required')) {
                          <p class="mt-1 text-xs text-red-500">Informe a ação mínima.</p>
                        }
                        @if (showError('minimumAction', 'maxlength')) {
                          <p class="mt-1 text-xs text-red-500">
                            Máximo de {{ minimumActionMax }} caracteres.
                          </p>
                        }
                      </div>

                      <div class="min-w-0 flex-[2]">
                        <label
                          for="habit-reminder"
                          class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                        >
                          Horário geral
                        </label>
                        <input
                          id="habit-reminder"
                          type="time"
                          formControlName="optionalReminder"
                          class="habit-form-time-control w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                        />
                        @if (showError('optionalReminder', 'required')) {
                          <p class="mt-1 text-xs text-red-500">Informe o horário.</p>
                        }
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="space-y-4">
                    <p
                      class="text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                    >
                      Configuração por dia
                    </p>
                    @for (day of visibleWeekdayItems(); track day.weekday) {
                      <div
                        class="overflow-hidden rounded-lg border border-brand-light-border dark:border-brand-border"
                      >
                        <div
                          class="border-b border-brand-light-border bg-brand-light-bg px-4 py-2.5 text-center dark:border-brand-border dark:bg-brand-bg"
                        >
                          <p
                            class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
                          >
                            {{ day.fullLabel }}
                          </p>
                        </div>

                        <div class="space-y-2 p-3">
                          <div class="weekday-input-group">
                            <label
                              [for]="'habit-meta-day-' + day.weekday"
                              class="weekday-input-group__label"
                            >
                              <i class="bi bi-bullseye weekday-input-group__label-icon" aria-hidden="true"></i>
                              Meta
                            </label>
                            <input
                              [id]="'habit-meta-day-' + day.weekday"
                              type="text"
                              autocomplete="off"
                              class="weekday-input-group__control"
                              [formControl]="weekdayGoalMetaControl(weekdayGoalIndex(day.weekday))"
                              [placeholder]="'Meta de ' + day.fullLabel.toLowerCase()"
                            />
                          </div>

                          <div class="flex items-start gap-2">
                            <div class="weekday-input-group min-w-0 flex-[8]">
                              <label
                                [for]="'habit-minimum-day-' + day.weekday"
                                class="weekday-input-group__label"
                              >
                                <i class="bi bi-arrow-down-circle weekday-input-group__label-icon" aria-hidden="true"></i>
                                Mín.
                              </label>
                              <input
                                [id]="'habit-minimum-day-' + day.weekday"
                                type="text"
                                maxlength="140"
                                autocomplete="off"
                                class="weekday-input-group__control"
                                [formControl]="weekdayGoalMinimumControl(weekdayGoalIndex(day.weekday))"
                                [placeholder]="'Mínimo de ' + day.fullLabel.toLowerCase()"
                              />
                            </div>

                            <div class="weekday-input-group min-w-0 flex-[2]">
                              <label
                                [for]="'habit-reminder-day-' + day.weekday"
                                class="weekday-input-group__label"
                              >
                                <i class="bi bi-clock weekday-input-group__label-icon" aria-hidden="true"></i>
                                Hora
                              </label>
                              <input
                                [id]="'habit-reminder-day-' + day.weekday"
                                type="time"
                                class="weekday-input-group__control"
                                [formControl]="weekdayGoalReminderControl(weekdayGoalIndex(day.weekday))"
                              />
                            </div>
                          </div>

                          @if (
                            showWeekdayGoalError(weekdayGoalIndex(day.weekday), 'minimumAction', 'required') ||
                            showWeekdayGoalError(weekdayGoalIndex(day.weekday), 'minimumAction', 'maxlength') ||
                            showWeekdayGoalError(weekdayGoalIndex(day.weekday), 'optionalReminder', 'required')
                          ) {
                            <div class="space-y-0.5">
                              @if (showWeekdayGoalError(weekdayGoalIndex(day.weekday), 'minimumAction', 'required')) {
                                <p class="text-xs text-red-500">Informe a ação mínima.</p>
                              }
                              @if (showWeekdayGoalError(weekdayGoalIndex(day.weekday), 'minimumAction', 'maxlength')) {
                                <p class="text-xs text-red-500">
                                  Máximo de {{ minimumActionMax }} caracteres.
                                </p>
                              }
                              @if (showWeekdayGoalError(weekdayGoalIndex(day.weekday), 'optionalReminder', 'required')) {
                                <p class="text-xs text-red-500">Informe o horário.</p>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }

                <div>
                  <label
                    for="habit-category"
                    class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
                  >
                    <i class="bi bi-bookmark habit-form-label-icon" aria-hidden="true"></i>
                    Categoria
                  </label>
                  <input
                    id="habit-category"
                    type="text"
                    formControlName="category"
                    autocomplete="off"
                    class="w-full rounded-lg border border-brand-light-border bg-brand-light-bg px-3 py-2 text-sm text-brand-light-text-primary outline-none transition-colors focus:border-brand-light-primary focus:ring-1 focus:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg dark:text-brand-text-primary dark:focus:border-brand-primary dark:focus:ring-brand-primary"
                    placeholder="Ex.: Corpo"
                  />
                  @if (showError('category', 'required')) {
                    <p class="mt-1 text-xs text-red-500">Informe a categoria.</p>
                  }
                </div>

                <div
                  class="overflow-hidden rounded-lg border border-brand-light-border dark:border-brand-border"
                >
                  <div
                    class="border-b border-brand-light-border bg-brand-light-bg px-4 py-2.5 text-center dark:border-brand-border dark:bg-brand-bg"
                  >
                    <p
                      class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
                    >
                      Tarefas gatilho
                    </p>
                  </div>

                  <div class="space-y-2 p-3">
                    @if (form.controls.trigger1Visible.value) {
                      <div class="weekday-input-group">
                        <span class="slot-input-group__icon" aria-hidden="true">
                          <i class="bi bi-lightning-charge"></i>
                        </span>
                        <input
                          id="habit-trigger1"
                          type="text"
                          formControlName="trigger1"
                          autocomplete="off"
                          class="weekday-input-group__control"
                          placeholder="Ex.: Ao vestir o tênis de treino"
                        />
                      </div>
                      @if (showError('trigger1', 'required')) {
                        <p class="text-xs text-red-500">Informe o gatilho.</p>
                      }
                    }

                    @if (form.controls.trigger2Visible.value) {
                      <div class="weekday-input-group">
                        <span class="slot-input-group__icon" aria-hidden="true">
                          <i class="bi bi-lightning-charge"></i>
                        </span>
                        <input
                          id="habit-trigger2"
                          type="text"
                          formControlName="trigger2"
                          autocomplete="off"
                          class="weekday-input-group__control"
                          placeholder="Ex.: Depois do alongamento"
                        />
                      </div>
                      @if (showError('trigger2', 'required')) {
                        <p class="text-xs text-red-500">Informe o gatilho.</p>
                      }
                    }

                    @if (form.controls.trigger3Visible.value) {
                      <div class="weekday-input-group">
                        <span class="slot-input-group__icon" aria-hidden="true">
                          <i class="bi bi-lightning-charge"></i>
                        </span>
                        <input
                          id="habit-trigger3"
                          type="text"
                          formControlName="trigger3"
                          autocomplete="off"
                          class="weekday-input-group__control"
                          placeholder="Ex.: Ao abrir o app de treino"
                        />
                      </div>
                      @if (showError('trigger3', 'required')) {
                        <p class="text-xs text-red-500">Informe o gatilho.</p>
                      }
                    }

                    @if (canAddTrigger() || canRemoveTrigger()) {
                      <div class="flex items-center justify-center gap-2 pt-1">
                        @if (canRemoveTrigger()) {
                          <button
                            type="button"
                            class="slot-control-btn"
                            aria-label="Ocultar gatilho"
                            (click)="removeTriggerSlot()"
                          >
                            −
                          </button>
                        }
                        @if (canAddTrigger()) {
                          <button
                            type="button"
                            class="slot-control-btn"
                            aria-label="Adicionar gatilho"
                            (click)="addTriggerSlot()"
                          >
                            +
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>

                <div
                  class="overflow-hidden rounded-lg border border-brand-light-border dark:border-brand-border"
                >
                  <div
                    class="border-b border-brand-light-border bg-brand-light-bg px-4 py-2.5 text-center dark:border-brand-border dark:bg-brand-bg"
                  >
                    <p
                      class="text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
                    >
                      Recompensas deste hábito
                    </p>
                  </div>

                  <div class="space-y-2 p-3">
                    @if (form.controls.motivation1Visible.value) {
                      <div class="weekday-input-group">
                        <span class="slot-input-group__icon" aria-hidden="true">
                          <i class="bi bi-trophy"></i>
                        </span>
                        <input
                          id="habit-motivation1"
                          type="text"
                          formControlName="motivation1"
                          autocomplete="off"
                          class="weekday-input-group__control"
                          placeholder="Ex.: Corpo mais forte"
                        />
                      </div>
                      @if (showError('motivation1', 'required')) {
                        <p class="text-xs text-red-500">Informe a recompensa.</p>
                      }
                    }

                    @if (form.controls.motivation2Visible.value) {
                      <div class="weekday-input-group">
                        <span class="slot-input-group__icon" aria-hidden="true">
                          <i class="bi bi-trophy"></i>
                        </span>
                        <input
                          id="habit-motivation2"
                          type="text"
                          formControlName="motivation2"
                          autocomplete="off"
                          class="weekday-input-group__control"
                          placeholder="Ex.: Disciplina diária"
                        />
                      </div>
                      @if (showError('motivation2', 'required')) {
                        <p class="text-xs text-red-500">Informe a recompensa.</p>
                      }
                    }

                    @if (form.controls.motivation3Visible.value) {
                      <div class="weekday-input-group">
                        <span class="slot-input-group__icon" aria-hidden="true">
                          <i class="bi bi-trophy"></i>
                        </span>
                        <input
                          id="habit-motivation3"
                          type="text"
                          formControlName="motivation3"
                          autocomplete="off"
                          class="weekday-input-group__control"
                          placeholder="Ex.: Mais energia no dia"
                        />
                      </div>
                      @if (showError('motivation3', 'required')) {
                        <p class="text-xs text-red-500">Informe a recompensa.</p>
                      }
                    }

                    @if (canAddMotivation() || canRemoveMotivation()) {
                      <div class="flex items-center justify-center gap-2 pt-1">
                        @if (canRemoveMotivation()) {
                          <button
                            type="button"
                            class="slot-control-btn"
                            aria-label="Ocultar recompensa"
                            (click)="removeMotivationSlot()"
                          >
                            −
                          </button>
                        }
                        @if (canAddMotivation()) {
                          <button
                            type="button"
                            class="slot-control-btn"
                            aria-label="Adicionar recompensa"
                            (click)="addMotivationSlot()"
                          >
                            +
                          </button>
                        }
                      </div>
                    }
                  </div>
                </div>

                <label class="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    formControlName="showOnToday"
                    class="habit-form-checkbox"
                  />
                  <span class="text-sm text-brand-light-text-primary dark:text-brand-text-primary">
                    Exibir na tela Hoje
                  </span>
                </label>

                <div class="space-y-3 pt-1">
                  <p
                    class="text-center text-sm font-semibold text-brand-light-primary dark:text-brand-primary"
                  >
                    Pré-visualização
                  </p>
                  <app-habit-card-preview [formState]="previewFormState()" />
                </div>
              </div>

              <div
                class="flex justify-end gap-3 border-t border-brand-light-border px-5 py-4 dark:border-brand-border md:px-6"
              >
                <button
                  type="button"
                  class="rounded-lg border border-brand-light-border px-4 py-2 text-sm font-medium text-brand-light-text-secondary transition-colors hover:bg-brand-light-bg hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:bg-brand-bg dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
                  (click)="close()"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="rounded-lg bg-brand-light-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary dark:focus-visible:ring-offset-brand-bg"
                  [disabled]="form.invalid"
                >
                  {{ submitLabel() }}
                </button>
              </div>
            </form>
          </div>

          <div
            class="hidden w-[4.5rem] shrink-0 md:block"
            aria-hidden="true"
          ></div>
        </div>
      </div>
    }
  `,
})
export class HabitFormModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly storage = inject(HabitStorageService);

  protected readonly modal = inject(HabitFormModalService);
  protected readonly minimumActionMax = MINIMUM_ACTION_MAX;
  protected readonly scheduleDays = signal<Weekday[]>([...ALL_WEEKDAYS]);
  protected readonly metasDinamicasActive = signal(false);
  private readonly modalSessionKey = signal<string | null>(null);
  private readonly formPreviewVersion = signal(0);

  protected readonly previewFormState = computed((): HabitCardPreviewFormState => {
    this.formPreviewVersion();
    this.scheduleDays();
    this.metasDinamicasActive();

    const value = this.form.getRawValue();

    return {
      name: value.name,
      category: value.category,
      scheduleDays: this.scheduleDays(),
      metasDinamicas: value.metasDinamicas,
      metaGeral: value.metaGeral,
      minimumAction: value.minimumAction,
      optionalReminder: value.optionalReminder,
      weekdayGoals: value.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta,
        minimumAction: entry.minimumAction,
        optionalReminder: entry.optionalReminder,
      })),
      trigger1: value.trigger1,
      trigger2: value.trigger2,
      trigger3: value.trigger3,
      trigger1Visible: value.trigger1Visible,
      trigger2Visible: value.trigger2Visible,
      trigger3Visible: value.trigger3Visible,
      motivation1: value.motivation1,
      motivation2: value.motivation2,
      motivation3: value.motivation3,
      motivation1Visible: value.motivation1Visible,
      motivation2Visible: value.motivation2Visible,
      motivation3Visible: value.motivation3Visible,
    };
  });

  protected readonly visibleWeekdayItems = computed(() => {
    const selected = new Set(this.scheduleDays());

    return WEEKDAY_SCHEDULE_ITEMS.filter((day) => selected.has(day.weekday));
  });

  protected readonly isEditing = computed(() => this.modal.editingHabitId() !== null);

  protected readonly modalTitle = computed(() =>
    this.isEditing() ? 'Editar hábito' : 'Novo hábito',
  );

  protected readonly submitLabel = computed(() =>
    this.isEditing() ? 'Salvar alterações' : 'Salvar hábito',
  );

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    metaGeral: [''],
    metasDinamicas: [false],
    weekdayGoals: this.fb.array(
      createDefaultWeekdayGoals().map((entry) =>
        this.fb.group({
          weekday: [entry.weekday],
          meta: [''],
          minimumAction: [''],
          optionalReminder: [''],
        }),
      ),
    ),
    category: ['', [Validators.required, Validators.minLength(1)]],
    trigger1: ['', [Validators.required, Validators.minLength(1)]],
    trigger2: [''],
    trigger3: [''],
    trigger1Visible: [true],
    trigger2Visible: [false],
    trigger3Visible: [false],
    motivation1: ['', [Validators.required, Validators.minLength(1)]],
    motivation2: [''],
    motivation3: [''],
    motivation1Visible: [true],
    motivation2Visible: [false],
    motivation3Visible: [false],
    minimumAction: [
      '',
      [Validators.required, Validators.maxLength(MINIMUM_ACTION_MAX)],
    ],
    optionalReminder: ['', Validators.required],
    showOnToday: [true],
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.formPreviewVersion.update((version) => version + 1);
    });

    this.form.controls.metasDinamicas.valueChanges.subscribe((enabled) => {
      this.metasDinamicasActive.set(enabled);
      this.syncDynamicValidators(enabled);
    });

    effect((onCleanup) => {
      if (!this.modal.isOpen()) {
        return;
      }

      document.body.style.overflow = 'hidden';
      onCleanup(() => {
        document.body.style.overflow = '';
      });
    });

    effect(() => {
      const isOpen = this.modal.isOpen();

      if (!isOpen) {
        this.modalSessionKey.set(null);
        return;
      }

      const editId = this.modal.editingHabitId();
      const sessionKey = editId ?? '__create__';

      if (this.modalSessionKey() === sessionKey) {
        return;
      }

      this.modalSessionKey.set(sessionKey);

      if (editId) {
        const habit = this.storage.getHabitById(editId);

        if (habit) {
          this.patchFormFromHabit(habit);
        }

        return;
      }

      this.resetForm();
    });

    effect(() => {
      if (!this.metasDinamicasActive()) {
        return;
      }

      this.scheduleDays();

      untracked(() => {
        this.syncDynamicValidators(true);
      });
    });
  }

  protected minimumActionLength(): number {
    return this.form.controls.minimumAction.value.length;
  }

  protected weekdayGoalMetaControl(index: number) {
    return this.form.controls.weekdayGoals.at(index).controls.meta;
  }

  protected weekdayGoalMinimumControl(index: number) {
    return this.form.controls.weekdayGoals.at(index).controls.minimumAction;
  }

  protected weekdayGoalReminderControl(index: number) {
    return this.form.controls.weekdayGoals.at(index).controls.optionalReminder;
  }

  protected weekdayGoalIndex(weekday: Weekday): number {
    return ALL_WEEKDAYS.indexOf(weekday);
  }

  protected showError(
    controlName: keyof typeof this.form.controls,
    errorCode: string,
  ): boolean {
    const control = this.form.controls[controlName];

    return control.touched && control.hasError(errorCode);
  }

  protected canAddTrigger(): boolean {
    return this.countVisibleTriggerSlots() < 3;
  }

  protected canRemoveTrigger(): boolean {
    return this.countVisibleTriggerSlots() > 1;
  }

  protected canAddMotivation(): boolean {
    return this.countVisibleMotivationSlots() < 3;
  }

  protected canRemoveMotivation(): boolean {
    return this.countVisibleMotivationSlots() > 1;
  }

  protected addTriggerSlot(): void {
    const value = this.form.getRawValue();

    if (!value.trigger2Visible) {
      this.form.patchValue({ trigger2Visible: true });
    } else if (!value.trigger3Visible) {
      this.form.patchValue({ trigger3Visible: true });
    }

    this.syncTriggerMotivationValidators();
  }

  protected removeTriggerSlot(): void {
    const value = this.form.getRawValue();

    if (value.trigger3Visible) {
      this.form.patchValue({ trigger3Visible: false });
    } else if (value.trigger2Visible) {
      this.form.patchValue({ trigger2Visible: false });
    }

    this.syncTriggerMotivationValidators();
  }

  protected addMotivationSlot(): void {
    const value = this.form.getRawValue();

    if (!value.motivation2Visible) {
      this.form.patchValue({ motivation2Visible: true });
    } else if (!value.motivation3Visible) {
      this.form.patchValue({ motivation3Visible: true });
    }

    this.syncTriggerMotivationValidators();
  }

  protected removeMotivationSlot(): void {
    const value = this.form.getRawValue();

    if (value.motivation3Visible) {
      this.form.patchValue({ motivation3Visible: false });
    } else if (value.motivation2Visible) {
      this.form.patchValue({ motivation2Visible: false });
    }

    this.syncTriggerMotivationValidators();
  }

  protected showWeekdayGoalError(
    index: number,
    controlName: 'meta' | 'minimumAction' | 'optionalReminder',
    errorCode: string,
  ): boolean {
    const control =
      this.form.controls.weekdayGoals.at(index).controls[controlName];

    return control.touched && control.hasError(errorCode);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected close(): void {
    this.modal.close();
    this.resetForm();
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      name: value.name,
      metaGeral: value.metaGeral,
      metasDinamicas: value.metasDinamicas,
      weekdayGoals: value.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta,
        minimumAction: entry.minimumAction,
        optionalReminder: entry.optionalReminder,
      })),
      category: value.category,
      trigger1: value.trigger1,
      trigger2: value.trigger2,
      trigger3: value.trigger3,
      trigger1Visible: value.trigger1Visible,
      trigger2Visible: value.trigger2Visible,
      trigger3Visible: value.trigger3Visible,
      motivation1: value.motivation1,
      motivation2: value.motivation2,
      motivation3: value.motivation3,
      motivation1Visible: value.motivation1Visible,
      motivation2Visible: value.motivation2Visible,
      motivation3Visible: value.motivation3Visible,
      minimumAction: value.minimumAction,
      scheduleDays: this.scheduleDays(),
      optionalReminder: value.optionalReminder,
      showOnToday: value.showOnToday,
    };

    const editId = this.modal.editingHabitId();

    if (editId) {
      this.storage.updateHabit(editId, payload);
    } else {
      this.storage.createHabit(payload);
    }

    this.close();
  }

  private resetForm(): void {
    this.scheduleDays.set([...ALL_WEEKDAYS]);
    this.metasDinamicasActive.set(false);

    this.form.reset({
      name: '',
      metaGeral: '',
      metasDinamicas: false,
      category: '',
      trigger1: DEFAULT_NEW_HABIT_TRIGGER,
      trigger2: '',
      trigger3: '',
      trigger1Visible: true,
      trigger2Visible: false,
      trigger3Visible: false,
      motivation1: DEFAULT_NEW_HABIT_MOTIVATION,
      motivation2: '',
      motivation3: '',
      motivation1Visible: true,
      motivation2Visible: false,
      motivation3Visible: false,
      minimumAction: '',
      optionalReminder: '',
      showOnToday: true,
    });

    this.form.controls.weekdayGoals.controls.forEach((group, index) => {
      group.patchValue({
        weekday: ALL_WEEKDAYS[index],
        meta: '',
        minimumAction: '',
        optionalReminder: '',
      });
    });

    this.syncDynamicValidators(false);
    this.syncTriggerMotivationValidators();
    this.formPreviewVersion.update((version) => version + 1);
  }

  private patchFormFromHabit(habit: {
    name: string;
    metaGeral: string;
    metasDinamicas: boolean;
    weekdayGoals: Array<{
      weekday: Weekday;
      meta: string;
      minimumAction: string;
      optionalReminder: string;
    }>;
    scheduleDays: Weekday[];
    category: string;
    trigger1: string;
    trigger2: string;
    trigger3: string;
    trigger1Visible: boolean;
    trigger2Visible: boolean;
    trigger3Visible: boolean;
    motivation1: string;
    motivation2: string;
    motivation3: string;
    motivation1Visible: boolean;
    motivation2Visible: boolean;
    motivation3Visible: boolean;
    minimumAction: string;
    optionalReminder: string;
    showOnToday: boolean;
  }): void {
    this.scheduleDays.set([...habit.scheduleDays]);
    this.metasDinamicasActive.set(habit.metasDinamicas);

    this.form.reset({
      name: habit.name,
      metaGeral: habit.metaGeral,
      metasDinamicas: habit.metasDinamicas,
      category: habit.category,
      trigger1: habit.trigger1,
      trigger2: habit.trigger2,
      trigger3: habit.trigger3,
      trigger1Visible: habit.trigger1Visible,
      trigger2Visible: habit.trigger2Visible,
      trigger3Visible: habit.trigger3Visible,
      motivation1: habit.motivation1,
      motivation2: habit.motivation2,
      motivation3: habit.motivation3,
      motivation1Visible: habit.motivation1Visible,
      motivation2Visible: habit.motivation2Visible,
      motivation3Visible: habit.motivation3Visible,
      minimumAction: habit.minimumAction,
      optionalReminder: habit.optionalReminder,
      showOnToday: habit.showOnToday,
    });

    habit.weekdayGoals.forEach((entry, index) => {
      const group = this.form.controls.weekdayGoals.at(index);

      if (group) {
        group.patchValue({
          weekday: entry.weekday,
          meta: entry.meta,
          minimumAction: entry.minimumAction,
          optionalReminder: entry.optionalReminder,
        });
      }
    });

    this.syncDynamicValidators(habit.metasDinamicas);
    this.syncTriggerMotivationValidators();
    this.formPreviewVersion.update((version) => version + 1);
  }

  private countVisibleTriggerSlots(): number {
    const value = this.form.getRawValue();

    return [value.trigger1Visible, value.trigger2Visible, value.trigger3Visible].filter(
      Boolean,
    ).length;
  }

  private countVisibleMotivationSlots(): number {
    const value = this.form.getRawValue();

    return [
      value.motivation1Visible,
      value.motivation2Visible,
      value.motivation3Visible,
    ].filter(Boolean).length;
  }

  private syncTriggerMotivationValidators(): void {
    const slots = [
      {
        control: this.form.controls.trigger1,
        visible: this.form.controls.trigger1Visible.value,
      },
      {
        control: this.form.controls.trigger2,
        visible: this.form.controls.trigger2Visible.value,
      },
      {
        control: this.form.controls.trigger3,
        visible: this.form.controls.trigger3Visible.value,
      },
      {
        control: this.form.controls.motivation1,
        visible: this.form.controls.motivation1Visible.value,
      },
      {
        control: this.form.controls.motivation2,
        visible: this.form.controls.motivation2Visible.value,
      },
      {
        control: this.form.controls.motivation3,
        visible: this.form.controls.motivation3Visible.value,
      },
    ];

    for (const slot of slots) {
      if (slot.visible) {
        slot.control.setValidators([Validators.required, Validators.minLength(1)]);
      } else {
        slot.control.clearValidators();
      }

      slot.control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private syncDynamicValidators(enabled: boolean): void {
    const generalMinimum = this.form.controls.minimumAction;
    const generalReminder = this.form.controls.optionalReminder;

    if (enabled) {
      generalMinimum.clearValidators();
      generalReminder.clearValidators();

      const selectedDays = new Set(this.scheduleDays());

      this.form.controls.weekdayGoals.controls.forEach((group, index) => {
        const weekday = ALL_WEEKDAYS[index];
        const isSelected = selectedDays.has(weekday);

        if (isSelected) {
          group.controls.minimumAction.setValidators([
            Validators.required,
            Validators.maxLength(MINIMUM_ACTION_MAX),
          ]);
          group.controls.optionalReminder.setValidators([Validators.required]);
        } else {
          group.controls.minimumAction.clearValidators();
          group.controls.optionalReminder.clearValidators();
        }
      });
    } else {
      generalMinimum.setValidators([
        Validators.required,
        Validators.maxLength(MINIMUM_ACTION_MAX),
      ]);
      generalReminder.setValidators([Validators.required]);

      this.form.controls.weekdayGoals.controls.forEach((group) => {
        group.controls.minimumAction.clearValidators();
        group.controls.optionalReminder.clearValidators();
      });
    }

    generalMinimum.updateValueAndValidity({ emitEvent: false });
    generalReminder.updateValueAndValidity({ emitEvent: false });

    this.form.controls.weekdayGoals.controls.forEach((group) => {
      group.controls.minimumAction.updateValueAndValidity({ emitEvent: false });
      group.controls.optionalReminder.updateValueAndValidity({ emitEvent: false });
    });
  }
}
