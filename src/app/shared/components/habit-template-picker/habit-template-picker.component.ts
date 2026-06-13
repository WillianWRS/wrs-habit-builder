import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HABIT_TEMPLATES } from '../../../core/constants/habit-templates.constants';
import {
  buildHabitNewLink,
  type HabitFormReturnUrl,
} from '../../../core/utils/habit-form-return-url.utils';

@Component({
  selector: 'app-habit-template-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="grid w-full gap-3">
      <p
        class="text-center text-xs font-semibold uppercase tracking-wide text-brand-light-text-secondary dark:text-brand-text-secondary"
      >
        Comece com um modelo
      </p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        @for (template of templates; track template.id) {
          <a
            [routerLink]="templateLink(template.id).route"
            [queryParams]="templateLink(template.id).queryParams"
            class="flex items-start gap-3 rounded-xl border border-brand-light-border bg-brand-light-bg/60 px-4 py-3 text-left transition-colors hover:border-brand-light-primary/50 hover:bg-brand-light-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:bg-brand-bg/50 dark:hover:border-brand-primary/50 dark:focus-visible:ring-brand-primary"
          >
            <span
              class="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-light-primary/10 text-brand-light-primary dark:bg-brand-primary/15 dark:text-brand-primary"
            >
              <i class="bi {{ template.icon }} text-lg" aria-hidden="true"></i>
            </span>
            <span class="min-w-0">
              <span
                class="block text-sm font-semibold text-brand-light-text-primary dark:text-brand-text-primary"
              >
                {{ template.label }}
              </span>
              <span
                class="mt-0.5 block text-xs text-brand-light-text-secondary dark:text-brand-text-secondary"
              >
                {{ template.description }}
              </span>
            </span>
          </a>
        }
      </div>
    </div>
  `,
})
export class HabitTemplatePickerComponent {
  readonly returnPath = input.required<HabitFormReturnUrl>();

  protected readonly templates = HABIT_TEMPLATES;

  protected templateLink(templateId: string) {
    return buildHabitNewLink(this.returnPath(), { template: templateId });
  }
}
