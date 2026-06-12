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
import { ALL_WEEKDAYS, type Habit } from '../../../core/models/habit.model';
import { MAX_HABIT_SLOTS } from '../../../core/models/habit-slot.model';
import { createDefaultWeekdayGoals } from '../../../core/models/habit-weekday-goal.model';
import type { Weekday } from '../../../core/models/weekday.model';
import { HabitFormModalService } from '../../../core/services/habit-form-modal.service';
import { HabitStorageService } from '../../../core/services/habit-storage.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  DEFAULT_NEW_HABIT_MOTIVATION,
  DEFAULT_NEW_HABIT_TRIGGER,
  mapStorageSlotsToVisibleForm,
  mapVisibleFormSlotsToStorage,
} from '../../../core/utils/habit-trigger-motivation.utils';
import { HabitCardPreviewComponent } from '../habit-card-preview/habit-card-preview.component';
import type { HabitCardPreviewFormState } from '../habit-card-preview/habit-card-preview.model';
import { TriggerSlotsFieldsetComponent } from '../trigger-slots-fieldset/trigger-slots-fieldset.component';
import { WeekdayScheduleComponent } from '../weekday-schedule/weekday-schedule.component';

const MINIMUM_ACTION_MAX = 140;

@Component({
  selector: 'app-habit-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    WeekdayScheduleComponent,
    HabitCardPreviewComponent,
    TriggerSlotsFieldsetComponent,
  ],
  templateUrl: './habit-form-modal.component.html',
  styleUrl: './habit-form-modal.component.scss',
})
export class HabitFormModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly storage = inject(HabitStorageService);
  private readonly toast = inject(ToastService);

  protected readonly modal = inject(HabitFormModalService);
  protected readonly minimumActionMax = MINIMUM_ACTION_MAX;
  protected readonly scheduleDays = signal<Weekday[]>([...ALL_WEEKDAYS]);
  protected readonly dynamicGoalsActive = signal(false);
  private readonly modalSessionKey = signal<string | null>(null);
  private readonly formPreviewVersion = signal(0);

  protected readonly previewFormState = computed((): HabitCardPreviewFormState => {
    this.formPreviewVersion();
    this.scheduleDays();
    this.dynamicGoalsActive();

    const value = this.form.getRawValue();
    const triggers = mapVisibleFormSlotsToStorage(
      value.triggers.map((slot) => ({ text: slot.text, visible: true })),
    );
    const motivations = mapVisibleFormSlotsToStorage(
      value.motivations.map((slot) => ({ text: slot.text, visible: true })),
    );

    return {
      name: value.name,
      category: value.category,
      scheduleDays: this.scheduleDays(),
      dynamicGoals: value.dynamicGoals,
      generalGoal: value.generalGoal,
      minimumAction: value.minimumAction,
      time: value.time,
      weekdayGoals: value.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta,
        minimumAction: entry.minimumAction,
        time: entry.time,
      })),
      triggers,
      motivations,
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
    generalGoal: [''],
    dynamicGoals: [false],
    weekdayGoals: this.fb.array(
      createDefaultWeekdayGoals().map((entry) =>
        this.fb.group({
          weekday: [entry.weekday],
          meta: [''],
          minimumAction: [''],
          time: [''],
        }),
      ),
    ),
    category: ['', [Validators.required, Validators.minLength(1)]],
    triggers: this.fb.array([this.createSlotGroup(DEFAULT_NEW_HABIT_TRIGGER)]),
    motivations: this.fb.array([this.createSlotGroup(DEFAULT_NEW_HABIT_MOTIVATION)]),
    minimumAction: [
      '',
      [Validators.required, Validators.maxLength(MINIMUM_ACTION_MAX)],
    ],
    time: [''],
    showOnToday: [true],
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.formPreviewVersion.update((version) => version + 1);
    });

    this.form.controls.dynamicGoals.valueChanges.subscribe((enabled) => {
      this.dynamicGoalsActive.set(enabled);
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
      if (!this.dynamicGoalsActive()) {
        return;
      }

      this.scheduleDays();

      untracked(() => {
        this.syncDynamicValidators(true);
      });
    });
  }

  protected weekdayGoalMetaControl(index: number) {
    return this.form.controls.weekdayGoals.at(index).controls.meta;
  }

  protected weekdayGoalMinimumControl(index: number) {
    return this.form.controls.weekdayGoals.at(index).controls.minimumAction;
  }

  protected weekdayGoalTimeControl(index: number) {
    return this.form.controls.weekdayGoals.at(index).controls.time;
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
    return this.form.controls.triggers.length < MAX_HABIT_SLOTS;
  }

  protected canRemoveTrigger(): boolean {
    return this.form.controls.triggers.length > 1;
  }

  protected canAddMotivation(): boolean {
    return this.form.controls.motivations.length < MAX_HABIT_SLOTS;
  }

  protected canRemoveMotivation(): boolean {
    return this.form.controls.motivations.length > 1;
  }

  protected addTriggerSlot(): void {
    if (!this.canAddTrigger()) {
      return;
    }

    this.form.controls.triggers.push(this.createSlotGroup(''));
    this.formPreviewVersion.update((version) => version + 1);
  }

  protected removeTriggerSlot(): void {
    if (!this.canRemoveTrigger()) {
      return;
    }

    this.form.controls.triggers.removeAt(this.form.controls.triggers.length - 1);
    this.formPreviewVersion.update((version) => version + 1);
  }

  protected addMotivationSlot(): void {
    if (!this.canAddMotivation()) {
      return;
    }

    this.form.controls.motivations.push(this.createSlotGroup(''));
    this.formPreviewVersion.update((version) => version + 1);
  }

  protected removeMotivationSlot(): void {
    if (!this.canRemoveMotivation()) {
      return;
    }

    this.form.controls.motivations.removeAt(this.form.controls.motivations.length - 1);
    this.formPreviewVersion.update((version) => version + 1);
  }

  protected showWeekdayGoalError(
    index: number,
    controlName: 'meta' | 'minimumAction',
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
      generalGoal: value.generalGoal,
      dynamicGoals: value.dynamicGoals,
      weekdayGoals: value.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta,
        minimumAction: entry.minimumAction,
        time: entry.time,
      })),
      category: value.category,
      triggers: mapVisibleFormSlotsToStorage(
        value.triggers.map((slot) => ({ text: slot.text, visible: true })),
      ),
      motivations: mapVisibleFormSlotsToStorage(
        value.motivations.map((slot) => ({ text: slot.text, visible: true })),
      ),
      minimumAction: value.minimumAction,
      scheduleDays: this.scheduleDays(),
      time: value.time,
      showOnToday: value.showOnToday,
    };

    const editId = this.modal.editingHabitId();

    if (editId) {
      this.storage.updateHabit(editId, payload);
      this.toast.showSuccess('Alterações salvas');
    } else {
      this.storage.createHabit(payload);
      this.toast.showSuccess('Hábito criado');
    }

    this.close();
  }

  private resetForm(): void {
    this.scheduleDays.set([...ALL_WEEKDAYS]);
    this.dynamicGoalsActive.set(false);

    this.form.reset({
      name: '',
      generalGoal: '',
      dynamicGoals: false,
      category: '',
      minimumAction: '',
      time: '',
      showOnToday: true,
    });

    this.setSlotFormArray(this.form.controls.triggers, [
      { text: DEFAULT_NEW_HABIT_TRIGGER, visible: true },
    ]);
    this.setSlotFormArray(this.form.controls.motivations, [
      { text: DEFAULT_NEW_HABIT_MOTIVATION, visible: true },
    ]);

    this.form.controls.weekdayGoals.controls.forEach((group, index) => {
      group.patchValue({
        weekday: ALL_WEEKDAYS[index],
        meta: '',
        minimumAction: '',
        time: '',
      });
    });

    this.syncDynamicValidators(false);
    this.formPreviewVersion.update((version) => version + 1);
  }

  private patchFormFromHabit(habit: Habit): void {
    this.scheduleDays.set([...habit.scheduleDays]);
    this.dynamicGoalsActive.set(habit.dynamicGoals);

    this.form.reset({
      name: habit.name,
      generalGoal: habit.generalGoal,
      dynamicGoals: habit.dynamicGoals,
      category: habit.category,
      minimumAction: habit.minimumAction,
      time: habit.time,
      showOnToday: habit.showOnToday,
    });

    this.setSlotFormArray(
      this.form.controls.triggers,
      mapStorageSlotsToVisibleForm(habit.triggers),
    );
    this.setSlotFormArray(
      this.form.controls.motivations,
      mapStorageSlotsToVisibleForm(habit.motivations),
    );

    habit.weekdayGoals.forEach((entry, index) => {
      const group = this.form.controls.weekdayGoals.at(index);

      if (group) {
        group.patchValue({
          weekday: entry.weekday,
          meta: entry.meta,
          minimumAction: entry.minimumAction,
          time: entry.time,
        });
      }
    });

    this.syncDynamicValidators(habit.dynamicGoals);
    this.formPreviewVersion.update((version) => version + 1);
  }

  private createSlotGroup(text: string) {
    return this.fb.group({
      text: [text, [Validators.required, Validators.minLength(1)]],
    });
  }

  private setSlotFormArray(
    array: typeof this.form.controls.triggers,
    slots: { text: string; visible: boolean }[],
  ): void {
    while (array.length > 0) {
      array.removeAt(0);
    }

    for (const slot of slots) {
      array.push(this.createSlotGroup(slot.text));
    }
  }

  private syncDynamicValidators(enabled: boolean): void {
    const generalMinimum = this.form.controls.minimumAction;

    if (enabled) {
      generalMinimum.clearValidators();

      const selectedDays = new Set(this.scheduleDays());

      this.form.controls.weekdayGoals.controls.forEach((group, index) => {
        const weekday = ALL_WEEKDAYS[index];
        const isSelected = selectedDays.has(weekday);

        if (isSelected) {
          group.controls.minimumAction.setValidators([
            Validators.required,
            Validators.maxLength(MINIMUM_ACTION_MAX),
          ]);
        } else {
          group.controls.minimumAction.clearValidators();
        }
      });
    } else {
      generalMinimum.setValidators([
        Validators.required,
        Validators.maxLength(MINIMUM_ACTION_MAX),
      ]);

      this.form.controls.weekdayGoals.controls.forEach((group) => {
        group.controls.minimumAction.clearValidators();
      });
    }

    generalMinimum.updateValueAndValidity({ emitEvent: false });

    this.form.controls.weekdayGoals.controls.forEach((group) => {
      group.controls.minimumAction.updateValueAndValidity({ emitEvent: false });
    });
  }
}
