import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  formatMarqueeLabel,
  type MarqueeItem,
} from '../../../../core/utils/habit-trigger-motivation.utils';

type MarqueeSpeed = 'default' | 'fast' | 'paused';

const MARQUEE_SPEED_CYCLE: Record<MarqueeSpeed, MarqueeSpeed> = {
  default: 'fast',
  fast: 'paused',
  paused: 'default',
};

const MARQUEE_FAST_PLAYBACK_RATE = 28 / 9;

@Component({
  selector: 'app-habit-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './habit-marquee.component.html',
  styleUrl: './habit-marquee.component.scss',
})
export class HabitMarqueeComponent {
  private readonly marqueeTrack =
    viewChild<ElementRef<HTMLElement>>('marqueeTrack');

  readonly items = input.required<MarqueeItem[]>();

  protected readonly marqueeSpeed = signal<MarqueeSpeed>('default');

  protected readonly marqueeLabel = computed(() =>
    formatMarqueeLabel(this.items()),
  );

  protected readonly marqueeAriaLabel = computed(() => {
    const speedHint =
      this.marqueeSpeed() === 'fast'
        ? 'Velocidade rápida.'
        : this.marqueeSpeed() === 'paused'
          ? 'Pausado.'
          : 'Velocidade normal.';

    return `${this.marqueeLabel()} Toque para alterar a velocidade. ${speedHint}`;
  });

  protected cycleMarqueeSpeed(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const next = MARQUEE_SPEED_CYCLE[this.marqueeSpeed()];
    this.marqueeSpeed.set(next);
    this.applyMarqueeSpeed(next);
  }

  private applyMarqueeSpeed(speed: MarqueeSpeed): void {
    const track = this.marqueeTrack()?.nativeElement;
    if (!track) {
      return;
    }

    const animation = track.getAnimations()[0];
    if (!animation) {
      return;
    }

    switch (speed) {
      case 'fast':
        animation.playbackRate = MARQUEE_FAST_PLAYBACK_RATE;
        animation.play();
        break;
      case 'paused':
        animation.pause();
        break;
      default:
        animation.playbackRate = 1;
        animation.play();
        break;
    }
  }
}
