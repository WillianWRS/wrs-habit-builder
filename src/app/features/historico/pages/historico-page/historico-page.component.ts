import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { buildDayHistory } from '../../../../core/utils/day-history.utils';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { DayHistoryModalComponent } from '../../components/day-history-modal/day-history-modal.component';
import { MonthHeatmapComponent } from '../../components/month-heatmap/month-heatmap.component';

@Component({
  selector: 'app-historico-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent, MonthHeatmapComponent, DayHistoryModalComponent],
  template: `
    <app-nav activeTab="historico" />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-28 pt-6 md:max-w-2xl md:px-6 md:pb-10 md:pt-10 lg:max-w-3xl lg:px-8"
    >
      <header class="mb-6 md:mb-8">
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Histórico
        </h1>
        <p
          class="mt-2 max-w-2xl text-sm text-brand-light-text-secondary dark:text-brand-text-secondary"
        >
          Calendário mensal com a intensidade de hábitos concluídos por dia.
          Toque em um dia para ver o resumo.
        </p>
      </header>

      <app-month-heatmap
        [year]="visibleYear()"
        [month]="visibleMonth()"
        [habits]="storage.habitsReadonly()"
        [completions]="storage.completionsReadonly()"
        [todayKey]="currentDay.todayKey()"
        (monthChange)="onMonthChange($event)"
        (dayClick)="openDay($event)"
      />
    </main>

    @if (selectedSnapshot(); as snapshot) {
      <app-day-history-modal
        [snapshot]="snapshot"
        (dismissed)="closeDayModal()"
      />
    }
  `,
})
export class HistoricoPageComponent {
  protected readonly storage = inject(HabitStorageService);
  protected readonly currentDay = inject(CurrentDayService);

  protected readonly visibleYear = signal(this.currentDay.today().getFullYear());
  protected readonly visibleMonth = signal(this.currentDay.today().getMonth());
  protected readonly selectedDateKey = signal<string | null>(null);

  protected readonly selectedSnapshot = computed(() => {
    const dateKey = this.selectedDateKey();

    if (!dateKey) {
      return null;
    }

    return buildDayHistory(
      dateKey,
      this.storage.habitsReadonly(),
      this.storage.completionsReadonly(),
    );
  });

  protected onMonthChange(next: { year: number; month: number }): void {
    this.visibleYear.set(next.year);
    this.visibleMonth.set(next.month);
  }

  protected openDay(dateKey: string): void {
    this.selectedDateKey.set(dateKey);
  }

  protected closeDayModal(): void {
    this.selectedDateKey.set(null);
  }
}
