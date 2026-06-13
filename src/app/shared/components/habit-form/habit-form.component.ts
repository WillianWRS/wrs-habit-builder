import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map } from 'rxjs';
import { WEEKDAY_SCHEDULE_ITEMS } from '../../../core/constants/weekday-schedule.constants';
import {
  getHabitTemplate,
  type HabitTemplateId,
} from '../../../core/constants/habit-templates.constants';
import { ALL_WEEKDAYS, type Habit } from '../../../core/models/habit.model';
import { MAX_HABIT_SLOTS } from '../../../core/models/habit-slot.model';
import { createDefaultWeekdayGoals } from '../../../core/models/habit-weekday-goal.model';
import type { Weekday } from '../../../core/models/weekday.model';
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
import { ModalFocusTrapDirective } from '../../directives/modal-focus-trap.directive';
import {
  captureHabitFormSnapshot,
  isHabitFormSnapshotDirty,
  type HabitFormSnapshot,
} from './habit-form-snapshot.utils';

const MINIMUM_ACTION_MAX = 140;

@Component({
  selector: 'app-habit-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    WeekdayScheduleComponent,
    HabitCardPreviewComponent,
    TriggerSlotsFieldsetComponent,
    ModalFocusTrapDirective,
  ],
  templateUrl: './habit-form.component.html',
  styleUrl: './habit-form.component.scss',
})
export class HabitFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly storage = inject(HabitStorageService);
  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);

  private readonly nameInput =
    viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly habitId = input<string | null>(null);
  readonly templateId = input<HabitTemplateId | null>(null);

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly minimumActionMax = MINIMUM_ACTION_MAX;
  protected readonly scheduleDays = signal<Weekday[]>([...ALL_WEEKDAYS]);
  protected readonly dynamicGoalsActive = signal(false);
  protected readonly refineExpanded = signal(false);
  private readonly formSessionKey = signal<string | null>(null);
  private readonly baselineSnapshot = signal<HabitFormSnapshot | null>(null);
  protected readonly showDiscardConfirm = signal(false);

  private leaveResolver: ((value: boolean) => void) | null = null;

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
    category: ['', [Validators.minLength(1)]],
    triggers: this.fb.array([this.createSlotGroup(DEFAULT_NEW_HABIT_TRIGGER, false)]),
    motivations: this.fb.array([
      this.createSlotGroup(DEFAULT_NEW_HABIT_MOTIVATION, false),
    ]),
    minimumAction: ['', [Validators.maxLength(MINIMUM_ACTION_MAX)]],
    time: [''],
    showOnToday: [true],
  });

  private readonly formValues = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly previewFormState = computed((): HabitCardPreviewFormState => {
    const value = this.formValues();
    const scheduleDays = this.scheduleDays();

    const triggers = mapVisibleFormSlotsToStorage(
      value.triggers.map((slot) => ({ text: slot.text, visible: true })),
    );
    const motivations = mapVisibleFormSlotsToStorage(
      value.motivations.map((slot) => ({ text: slot.text, visible: true })),
    );

    return {
      name: value.name,
      category: value.category,
      scheduleDays,
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

  protected readonly isEditing = computed(() => this.habitId() !== null);

  protected readonly showRefineSection = computed(
    () => this.isEditing() || this.refineExpanded(),
  );

  protected readonly formTitle = computed(() =>
    this.isEditing() ? 'Editar hábito' : 'Novo hábito',
  );

  protected readonly submitLabel = computed(() =>
    this.isEditing() ? 'Salvar alterações' : 'Salvar hábito',
  );

  constructor() {
    this.form.controls.dynamicGoals.valueChanges.subscribe((enabled) => {
      this.dynamicGoalsActive.set(enabled);
      this.syncDynamicValidators(enabled);
    });

    effect(() => {
      const editId = this.habitId();
      const template = this.templateId();
      const sessionKey = editId ?? `__create__:${template ?? 'blank'}`;

      if (this.formSessionKey() === sessionKey) {
        return;
      }

      this.formSessionKey.set(sessionKey);

      if (editId) {
        const habit = this.storage.getHabitById(editId);

        if (habit) {
          this.patchFormFromHabit(habit);
        }

        return;
      }

      this.resetForm(template);
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

  confirmLeave(): Promise<boolean> {
    if (!this.isFormDirty()) {
      return Promise.resolve(true);
    }

    this.showDiscardConfirm.set(true);

    return new Promise((resolve) => {
      this.leaveResolver = resolve;
    });
  }

  protected toggleRefineSection(): void {
    this.refineExpanded.update((expanded) => !expanded);
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

    this.form.controls.triggers.push(this.createSlotGroup('', this.isEditing()));
  }

  protected removeTriggerSlot(): void {
    if (!this.canRemoveTrigger()) {
      return;
    }

    this.form.controls.triggers.removeAt(this.form.controls.triggers.length - 1);
  }

  protected addMotivationSlot(): void {
    if (!this.canAddMotivation()) {
      return;
    }

    this.form.controls.motivations.push(this.createSlotGroup('', this.isEditing()));
  }

  protected removeMotivationSlot(): void {
    if (!this.canRemoveMotivation()) {
      return;
    }

    this.form.controls.motivations.removeAt(this.form.controls.motivations.length - 1);
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

  async requestCancel(): Promise<void> {
    const canLeave = await this.confirmLeave();

    if (!canLeave) {
      return;
    }

    this.cancelled.emit();
  }

  protected confirmDiscard(): void {
    this.showDiscardConfirm.set(false);
    this.leaveResolver?.(true);
    this.leaveResolver = null;
  }

  protected cancelDiscard(): void {
    this.showDiscardConfirm.set(false);
    this.leaveResolver?.(false);
    this.leaveResolver = null;
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const payload = this.isEditing()
      ? {
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
        }
      : this.buildCreatePayload(value);

    const editId = this.habitId();

    if (editId) {
      this.storage.updateHabit(editId, payload);
      this.toast.showSuccess('Alterações salvas');
    } else {
      this.storage.createHabit(payload);
      this.toast.showSuccess('Hábito criado');
    }

    this.updateBaseline();
    this.saved.emit();
  }

  private isFormDirty(): boolean {
    const baseline = this.baselineSnapshot();

    if (!baseline) {
      return false;
    }

    const current = captureHabitFormSnapshot(
      this.scheduleDays(),
      this.form.getRawValue(),
    );

    return isHabitFormSnapshotDirty(baseline, current);
  }

  private updateBaseline(): void {
    this.baselineSnapshot.set(
      captureHabitFormSnapshot(this.scheduleDays(), this.form.getRawValue()),
    );
    this.form.markAsPristine();
  }

  private resetForm(templateId: HabitTemplateId | null = null): void {
    this.scheduleDays.set([...ALL_WEEKDAYS]);
    this.dynamicGoalsActive.set(false);
    this.refineExpanded.set(false);

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

    if (templateId) {
      this.applyTemplate(templateId);
    }

    this.syncDynamicValidators(false);
    this.syncValidatorsMode();
    this.updateBaseline();
    this.focusPrimaryField();
  }

  private applyTemplate(templateId: HabitTemplateId): void {
    const template = getHabitTemplate(templateId);

    this.scheduleDays.set([...template.scheduleDays]);
    this.refineExpanded.set(true);

    this.form.patchValue({
      name: template.name,
      generalGoal: template.generalGoal,
      category: template.category,
      minimumAction: template.minimumAction,
      showOnToday: true,
    });

    this.setSlotFormArray(this.form.controls.triggers, [
      { text: template.trigger, visible: true },
    ]);
    this.setSlotFormArray(this.form.controls.motivations, [
      { text: template.motivation, visible: true },
    ]);
  }

  private buildCreatePayload(
    value: ReturnType<typeof this.form.getRawValue>,
  ) {
    const name = value.name.trim();
    const category = value.category.trim() || 'Geral';
    const minimumAction =
      value.minimumAction.trim() || name || 'Fazer o hábito';
    const triggerTexts = value.triggers
      .map((slot) => slot.text.trim())
      .filter(Boolean);
    const motivationTexts = value.motivations
      .map((slot) => slot.text.trim())
      .filter(Boolean);

    return {
      name,
      generalGoal: value.generalGoal,
      dynamicGoals: value.dynamicGoals,
      weekdayGoals: value.weekdayGoals.map((entry) => ({
        weekday: entry.weekday,
        meta: entry.meta,
        minimumAction: entry.minimumAction,
        time: entry.time,
      })),
      category,
      triggers: mapVisibleFormSlotsToStorage(
        (triggerTexts.length > 0 ? triggerTexts : [DEFAULT_NEW_HABIT_TRIGGER]).map(
          (text) => ({ text, visible: true }),
        ),
      ),
      motivations: mapVisibleFormSlotsToStorage(
        (motivationTexts.length > 0
          ? motivationTexts
          : [DEFAULT_NEW_HABIT_MOTIVATION]
        ).map((text) => ({ text, visible: true })),
      ),
      minimumAction,
      scheduleDays: this.scheduleDays(),
      time: value.time,
      showOnToday: value.showOnToday,
    };
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
    this.syncValidatorsMode();
    this.updateBaseline();
    this.focusPrimaryField();
  }

  private focusPrimaryField(): void {
    afterNextRender(
      () => {
        const input =
          this.nameInput()?.nativeElement ??
          document.getElementById('habit-name');

        input?.focus();
      },
      { injector: this.injector },
    );
  }

  private createSlotGroup(text: string, required = true) {
    return this.fb.group({
      text: required
        ? [text, [Validators.required, Validators.minLength(1)]]
        : [text, [Validators.maxLength(140)]],
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
      array.push(this.createSlotGroup(slot.text, this.isEditing()));
    }
  }

  private syncValidatorsMode(): void {
    const editing = this.isEditing();

    if (editing) {
      this.form.controls.category.setValidators([
        Validators.required,
        Validators.minLength(1),
      ]);
    } else {
      this.form.controls.category.clearValidators();
    }

    this.form.controls.category.updateValueAndValidity({ emitEvent: false });
    this.syncDynamicValidators(this.dynamicGoalsActive());

    const applySlotValidators = (
      array: typeof this.form.controls.triggers,
    ) => {
      array.controls.forEach((group) => {
        if (editing) {
          group.controls.text.setValidators([
            Validators.required,
            Validators.minLength(1),
          ]);
        } else {
          group.controls.text.setValidators([Validators.maxLength(140)]);
        }

        group.controls.text.updateValueAndValidity({ emitEvent: false });
      });
    };

    applySlotValidators(this.form.controls.triggers);
    applySlotValidators(this.form.controls.motivations);
  }

  private syncDynamicValidators(enabled: boolean): void {
    const generalMinimum = this.form.controls.minimumAction;
    const editing = this.isEditing();

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
    } else if (editing) {
      generalMinimum.setValidators([
        Validators.required,
        Validators.maxLength(MINIMUM_ACTION_MAX),
      ]);

      this.form.controls.weekdayGoals.controls.forEach((group) => {
        group.controls.minimumAction.clearValidators();
      });
    } else {
      generalMinimum.setValidators([Validators.maxLength(MINIMUM_ACTION_MAX)]);

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
