import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject } from '@angular/core';
import { HabitStorageService } from './habit-storage.service';
import { CurrentDayService } from './current-day.service';
import { ToastService } from './toast.service';
import { toDateKey } from '../utils/date.utils';

interface ScheduledReminder {
  timeoutId: ReturnType<typeof setTimeout>;
}

@Injectable({ providedIn: 'root' })
export class LocalNotificationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storage = inject(HabitStorageService);
  private readonly currentDay = inject(CurrentDayService);
  private readonly toast = inject(ToastService);

  private readonly scheduled = new Map<string, ScheduledReminder>();

  constructor() {
    effect(() => {
      this.currentDay.todayKey();
      this.storage.habitsReadonly();

      this.rescheduleForToday();
    });
  }

  requestPermission(): void {
    if (!isPlatformBrowser(this.platformId) || typeof Notification === 'undefined') {
      return;
    }

    if (Notification.permission === 'denied') {
      this.toast.show({
        message: 'Permissão de notificações negada. Reative no navegador.',
        icon: 'bell',
      });
      return;
    }

    if (Notification.permission === 'granted') {
      this.toast.showSuccess('Notificações locais ativas.', 'bell');
      this.rescheduleForToday();
      return;
    }

    void Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        this.toast.showSuccess('Notificações locais ativadas.', 'bell');
        this.rescheduleForToday();
        return;
      }

      this.toast.show({
        message: 'Permissão negada. Reative o sino nas configurações do Chrome.',
        icon: 'bell',
      });
    });
  }

  private rescheduleForToday(): void {
    if (!isPlatformBrowser(this.platformId) || typeof Notification === 'undefined') {
      return;
    }

    this.clearAllTimers();

    if (Notification.permission !== 'granted') {
      return;
    }

    const now = Date.now();
    const today = this.currentDay.today();
    const todayKey = toDateKey(today);
    const todayHabits = this.storage.getTodayHabits(today);

    for (const habit of todayHabits) {
      const minutes = parseTimeToMinutes(habit.time);

      if (minutes === null) {
        continue;
      }

      const triggerAt = new Date(today);
      triggerAt.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      triggerAt.setHours(triggerAt.getHours() - 1);
      const fireAt = triggerAt.getTime();

      if (fireAt <= now) {
        continue;
      }

      const scheduleId = `${habit.id}|${todayKey}|${habit.time}`;
      const timeoutId = setTimeout(() => {
        this.scheduled.delete(scheduleId);
        this.fireNotification(habit.name);
      }, fireAt - now);

      this.scheduled.set(scheduleId, { timeoutId });
    }
  }

  private fireNotification(habitName: string): void {
    if (!isPlatformBrowser(this.platformId) || typeof Notification === 'undefined') {
      return;
    }

    const notification = new Notification('Lembrete do hábito', {
      body: `Daqui 1h: ${habitName}`,
      icon: '/habit-builder-icon.png',
      tag: 'habit-reminder',
    });

    notification.onclick = () => {
      window.focus();
      window.location.assign('/today');
      notification.close();
    };
  }

  private clearAllTimers(): void {
    for (const entry of this.scheduled.values()) {
      clearTimeout(entry.timeoutId);
    }

    this.scheduled.clear();
  }
}

function parseTimeToMinutes(raw: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(raw.trim());

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}
