import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { HabitStorageService } from './core/services/habit-storage.service';
import { MemoryStorageBackend } from './core/storage/memory-storage.backend';
import { STORAGE_BACKEND } from './core/storage/storage-backend.model';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: STORAGE_BACKEND, useClass: MemoryStorageBackend },
        {
          provide: APP_INITIALIZER,
          useFactory: (storage: HabitStorageService) => () => storage.initialize(),
          deps: [HabitStorageService],
          multi: true,
        },
      ],
    }).compileComponents();
  });

  it('renderiza router-outlet e modal de formulário de hábito', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('app-habit-form-modal')).not.toBeNull();
    expect(element.querySelector('app-toast')).not.toBeNull();
  });
});
