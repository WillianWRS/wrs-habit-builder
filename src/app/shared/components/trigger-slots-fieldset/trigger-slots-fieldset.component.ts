import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import {
  ControlContainer,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

type SlotFormGroup = FormGroup<{ text: FormControl<string> }>;

@Component({
  selector: 'app-trigger-slots-fieldset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './trigger-slots-fieldset.component.html',
  styleUrl: './trigger-slots-fieldset.component.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class TriggerSlotsFieldsetComponent {
  private readonly controlContainer = inject(ControlContainer);

  readonly title = input.required<string>();
  readonly iconClass = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly requiredErrorMessage = input.required<string>();
  readonly addAriaLabel = input.required<string>();
  readonly removeAriaLabel = input.required<string>();
  readonly canAdd = input.required<boolean>();
  readonly canRemove = input.required<boolean>();

  readonly addSlot = output<void>();
  readonly removeSlot = output<void>();

  protected get formArray(): FormArray<SlotFormGroup> {
    return this.controlContainer.control as FormArray<SlotFormGroup>;
  }

  protected showError(index: number): boolean {
    const control = this.formArray.at(index).controls.text;

    return control.touched && control.hasError('required');
  }
}
