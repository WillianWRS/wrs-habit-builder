import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { HabitDetailPageComponent } from './habit-detail-page.component';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { CurrentDayService } from '../../../../core/services/current-day.service';

describe('HabitDetailPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitDetailPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'missing-habit' })),
            snapshot: { paramMap: convertToParamMap({ id: 'missing-habit' }) },
          },
        },
        {
          provide: HabitStorageService,
          useValue: {
            getHabitById: () => null,
            completionsReadonly: () => [],
            freezeUsedReadonly: () => [],
          },
        },
        {
          provide: CurrentDayService,
          useValue: {
            today: () => new Date('2026-06-13T12:00:00'),
            todayKey: () => '2026-06-13',
          },
        },
      ],
    }).compileComponents();
  });

  it('redireciona para /habits quando hábito não existe', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    TestBed.createComponent(HabitDetailPageComponent);
    TestBed.flushEffects();

    expect(navigateSpy).toHaveBeenCalledWith(['/habits']);
  });
});
