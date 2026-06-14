import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AppNavComponent } from '../../../../shared/components/app-nav/app-nav.component';
import { HabitStorageService } from '../../../../core/services/habit-storage.service';
import { CurrentDayService } from '../../../../core/services/current-day.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  ensureSharePhotoLayerFontsLoaded,
  renderSharePhotoLayer,
  resolveSharePhotoPreviewOptions,
  SHARE_PHOTO_INLINE_POSITION_OPTIONS,
  SHARE_PHOTO_LABEL_LAYOUT_OPTIONS,
  SHARE_PHOTO_LAYOUT_OPTIONS,
  toLeftEquivalentPosition,
  type SharePhotoLabelLayout,
  type SharePhotoLayoutPosition,
} from '../../utils/share-photo-layer.utils';

const LOGO_PATH = '/habit-builder-icon.png';

@Component({
  selector: 'app-share-photo-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppNavComponent],
  styleUrl: './share-photo-page.component.scss',
  template: `
    <app-nav />

    <main
      class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-28 pt-6 md:px-6 md:pb-10 md:pt-10 lg:px-8"
    >
      <header class="mb-6 md:mb-8">
        <h1
          class="font-display text-2xl font-semibold text-brand-light-text-primary md:text-3xl dark:text-brand-text-primary"
        >
          Adicionar foto
        </h1>
        <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
          Gere uma imagem JPEG com seu progresso de hoje para compartilhar.
        </p>
      </header>

      <section
        class="space-y-5 rounded-2xl border border-brand-light-border bg-brand-light-surface p-4 dark:border-brand-border dark:bg-brand-surface md:p-5"
      >
        <div>
          <label
            for="share-photo-habit"
            class="mb-1.5 block text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
          >
            Hábito
          </label>
          <div class="relative">
            <select
              id="share-photo-habit"
              class="share-photo-field share-photo-select"
              [value]="selectedHabitId()"
              (change)="selectedHabitId.set($any($event.target).value)"
            >
              @for (habit of todayHabits(); track habit.id) {
                <option [value]="habit.id" [selected]="selectedHabitId() === habit.id">
                  {{ habit.name }}
                </option>
              }
            </select>
            <i
              class="bi bi-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-light-primary dark:text-brand-primary"
              aria-hidden="true"
            ></i>
          </div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-between rounded-xl border border-brand-light-border bg-brand-light-surface px-4 py-3 text-left text-sm font-medium text-brand-light-text-primary transition-colors hover:border-brand-light-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-primary dark:hover:border-brand-primary/40 dark:focus-visible:ring-brand-primary"
          [attr.aria-expanded]="showCustomizeSection()"
          aria-controls="share-photo-customize-section"
          (click)="toggleCustomizeSection()"
        >
          <span class="inline-flex items-center gap-2">
            <i
              class="bi bi-sliders text-brand-light-primary dark:text-brand-primary"
              aria-hidden="true"
            ></i>
            Personalizar
          </span>
          <i
            class="share-photo-customize-toggle__chevron bi bi-chevron-down text-xs"
            [class.rotate-180]="showCustomizeSection()"
            aria-hidden="true"
          ></i>
        </button>

        <div
          id="share-photo-customize-section"
          class="share-photo-customize-panel"
          [class.share-photo-customize-panel--open]="showCustomizeSection()"
          [attr.aria-hidden]="!showCustomizeSection()"
        >
          <div class="share-photo-customize-panel__inner">
            <div class="share-photo-customize-panel__content space-y-5">
            <div>
              <p
                class="mb-1.5 text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
              >
                Posição do rótulo
              </p>
              <div
                class="share-photo-layout-grid"
                [class.share-photo-layout-grid--inline]="selectedLabelLayout() === 'inline'"
                role="listbox"
                aria-label="Posição do rótulo"
              >
                @for (option of positionOptions(); track option.id) {
                  <button
                    type="button"
                    class="share-photo-layout-card"
                    role="option"
                    [class.share-photo-layout-card--selected]="selectedLayout() === option.id"
                    [attr.aria-selected]="selectedLayout() === option.id"
                    [attr.tabindex]="showCustomizeSection() ? 0 : -1"
                    (click)="selectLayout(option.id)"
                  >
                    <div class="share-photo-layout-card__frame">
                      <div
                        class="share-photo-layout-card__placeholder"
                        [attr.data-position]="option.id"
                        aria-hidden="true"
                      ></div>
                    </div>
                    <span class="share-photo-layout-card__label">{{ option.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div>
              <p
                class="mb-1.5 text-sm font-medium text-brand-light-text-primary dark:text-brand-text-primary"
              >
                Layout do rótulo
              </p>
              <div
                class="share-photo-label-layout-grid"
                role="listbox"
                aria-label="Layout do rótulo"
              >
                @for (option of labelLayoutOptions; track option.id) {
                  <button
                    type="button"
                    class="share-photo-label-layout-card"
                    role="option"
                    [class.share-photo-label-layout-card--selected]="
                      selectedLabelLayout() === option.id
                    "
                    [attr.aria-selected]="selectedLabelLayout() === option.id"
                    [attr.tabindex]="showCustomizeSection() ? 0 : -1"
                    (click)="selectLabelLayout(option.id)"
                  >
                    @if (option.premium) {
                      <span class="share-photo-label-layout-card__badge">Premium</span>
                    }
                    <div class="share-photo-label-layout-card__frame">
                      @if (option.id === 'stacked') {
                        <div
                          class="share-photo-label-preview share-photo-label-preview--stacked"
                          aria-hidden="true"
                        >
                          <span class="share-photo-label-preview__dia">Dia</span>
                          <span class="share-photo-label-preview__count">3</span>
                          <span class="share-photo-label-preview__name">Ler</span>
                          <span class="share-photo-label-preview__meta">20 páginas</span>
                          <span class="share-photo-label-preview__icon"></span>
                        </div>
                      } @else {
                        <div
                          class="share-photo-label-preview share-photo-label-preview--inline"
                          aria-hidden="true"
                        >
                          <span class="share-photo-label-preview__icon"></span>
                          <span class="share-photo-label-preview__inline-text">
                            Ler · 20 páginas · Dia 3
                          </span>
                        </div>
                      }
                    </div>
                    <span class="share-photo-label-layout-card__label">{{ option.label }}</span>
                  </button>
                }
              </div>
            </div>

            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                class="share-photo-checkbox"
                [checked]="gradientShadingEnabled()"
                [attr.tabindex]="showCustomizeSection() ? 0 : -1"
                (change)="toggleGradientShading($any($event.target).checked)"
              />
              <span class="text-sm text-brand-light-text-primary dark:text-brand-text-primary">
                Sombreamento gradiente
              </span>
            </label>

            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                class="share-photo-checkbox"
                [checked]="showMetaEnabled()"
                [attr.tabindex]="showCustomizeSection() ? 0 : -1"
                (change)="toggleShowMeta($any($event.target).checked)"
              />
              <span class="text-sm text-brand-light-text-primary dark:text-brand-text-primary">
                Exibir meta
              </span>
            </label>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <label class="share-photo-action">
            <i class="bi bi-image" aria-hidden="true"></i>
            Galeria
            <input
              type="file"
              accept="image/*"
              class="hidden"
              (change)="onFileSelected($event)"
            />
          </label>

          @if (hasCamera()) {
            <label class="share-photo-action">
              <i class="bi bi-camera" aria-hidden="true"></i>
              Câmera
              <input
                type="file"
                accept="image/*"
                capture="environment"
                class="hidden"
                (change)="onFileSelected($event)"
              />
            </label>
          } @else {
            <button
              type="button"
              class="share-photo-action"
              disabled
              title="Nenhuma câmera detectada neste dispositivo"
            >
              <i class="bi bi-camera" aria-hidden="true"></i>
              Câmera
            </button>
          }

          <div class="share-photo-export-actions">
            <button
              type="button"
              class="share-photo-export-btn share-photo-export-btn--outline"
              [disabled]="!previewUrl() || !selectedHabit()"
              aria-label="Compartilhar layer de foto"
              (click)="shareLayer()"
            >
              <i class="bi bi-share" aria-hidden="true"></i>
              <span class="share-photo-export-btn__label">Compartilhar</span>
            </button>

            <button
              type="button"
              class="share-photo-export-btn share-photo-export-btn--primary"
              [disabled]="!previewUrl() || !selectedHabit()"
              aria-label="Salvar layer de foto"
              (click)="downloadJpeg()"
            >
              <i class="bi bi-download" aria-hidden="true"></i>
              <span class="share-photo-export-btn__label">Salvar</span>
            </button>
          </div>
        </div>

        @if (!previewUrl()) {
          <p class="text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
            Selecione uma imagem para começar.
          </p>
        } @else {
          <div
            class="share-photo-preview overflow-hidden rounded-xl border border-brand-light-border dark:border-brand-border"
          >
            <img
              [src]="previewUrl()"
              alt="Preview com layer de foto"
              class="share-photo-preview__image w-full"
            />
          </div>
        }
      </section>
    </main>
  `,
})
export class SharePhotoPageComponent implements OnInit {
  private readonly storage = inject(HabitStorageService);
  private readonly currentDay = inject(CurrentDayService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  private readonly queryHabitId = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('habitId') ?? '')),
    { initialValue: '' },
  );

  protected readonly labelLayoutOptions = SHARE_PHOTO_LABEL_LAYOUT_OPTIONS;
  protected readonly positionOptions = computed(() =>
    this.selectedLabelLayout() === 'inline'
      ? SHARE_PHOTO_INLINE_POSITION_OPTIONS
      : SHARE_PHOTO_LAYOUT_OPTIONS,
  );
  protected readonly todayHabits = computed(() => this.storage.todayHabitCards());
  protected readonly selectedHabitId = signal('');
  protected readonly selectedLayout = signal<SharePhotoLayoutPosition>('bottom-left');
  protected readonly selectedLabelLayout = signal<SharePhotoLabelLayout>('stacked');
  protected readonly showCustomizeSection = signal(false);
  protected readonly gradientShadingEnabled = signal(true);
  protected readonly showMetaEnabled = signal(true);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly hasCamera = signal(false);
  private readonly sourceImage = signal<HTMLImageElement | null>(null);
  private readonly logoImage = signal<HTMLImageElement | null>(null);
  private readonly fontsReady = signal(false);

  protected readonly selectedHabit = computed(() =>
    this.todayHabits().find((habit) => habit.id === this.selectedHabitId()) ?? null,
  );

  constructor() {
    effect(() => {
      const habits = this.todayHabits();
      const queryId = this.queryHabitId();

      if (habits.length === 0) {
        this.selectedHabitId.set('');
        return;
      }

      if (queryId && habits.some((habit) => habit.id === queryId)) {
        this.selectedHabitId.set(queryId);
        return;
      }

      const currentId = this.selectedHabitId();
      const currentValid = habits.some((habit) => habit.id === currentId);

      if (!currentValid) {
        this.selectedHabitId.set(habits[0]!.id);
      }
    });

    effect(() => {
      this.selectedHabit();
      this.selectedLayout();
      this.selectedLabelLayout();
      this.gradientShadingEnabled();
      this.showMetaEnabled();
      this.sourceImage();
      this.logoImage();
      this.fontsReady();

      void this.renderPreview();
    });
  }

  ngOnInit(): void {
    void this.detectCamera();
    this.loadLogo();
    void this.loadLayerFonts();
  }

  protected toggleCustomizeSection(): void {
    this.showCustomizeSection.update((open) => !open);
  }

  protected selectLayout(position: SharePhotoLayoutPosition): void {
    this.selectedLayout.set(position);
  }

  protected selectLabelLayout(layout: SharePhotoLabelLayout): void {
    if (layout === 'inline') {
      this.selectedLayout.update((current) => toLeftEquivalentPosition(current));
    }

    this.selectedLabelLayout.set(layout);
  }

  protected toggleGradientShading(enabled: boolean): void {
    this.gradientShadingEnabled.set(enabled);
  }

  protected toggleShowMeta(enabled: boolean): void {
    this.showMetaEnabled.set(enabled);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        this.sourceImage.set(image);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected downloadJpeg(): void {
    const dataUrl = this.buildLayerExportDataUrl();

    if (!dataUrl) {
      return;
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = this.layerExportFileName();
    a.click();
  }

  protected async shareLayer(): Promise<void> {
    const dataUrl = this.buildLayerExportDataUrl();
    const habit = this.selectedHabit();

    if (!dataUrl || !habit) {
      return;
    }

    const file = await this.dataUrlToJpegFile(dataUrl);

    if (this.canShareFiles([file])) {
      try {
        await navigator.share({
          files: [file],
          title: `Progresso — ${habit.name}`,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    this.downloadJpeg();
    this.toast.showSuccess('Compartilhamento indisponível. Imagem salva.', 'check');
  }

  private buildLayerExportDataUrl(): string | null {
    const image = this.sourceImage();
    const habit = this.selectedHabit();
    const logo = this.logoImage();

    if (!image || !habit) {
      return null;
    }

    return renderSharePhotoLayer(image, habit, logo, this.selectedLayout(), {
      gradientShading: this.gradientShadingEnabled(),
      showMeta: this.showMetaEnabled(),
      labelLayout: this.selectedLabelLayout(),
      jpegQuality: 0.92,
    });
  }

  private layerExportFileName(): string {
    return `habit-builder-layer-${this.currentDay.todayKey()}.jpg`;
  }

  private async dataUrlToJpegFile(dataUrl: string): Promise<File> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new File([blob], this.layerExportFileName(), { type: 'image/jpeg' });
  }

  private canShareFiles(files: File[]): boolean {
    return typeof navigator.share === 'function' && navigator.canShare?.({ files }) === true;
  }

  private async loadLayerFonts(): Promise<void> {
    await ensureSharePhotoLayerFontsLoaded();
    this.fontsReady.set(true);
  }

  private isDesktopViewport(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  }

  private async renderPreview(): Promise<void> {
    if (!this.fontsReady()) {
      return;
    }

    const image = this.sourceImage();
    const habit = this.selectedHabit();
    const logo = this.logoImage();

    if (!image || !habit) {
      this.previewUrl.set(null);
      return;
    }

    await ensureSharePhotoLayerFontsLoaded();

    this.previewUrl.set(
      renderSharePhotoLayer(
        image,
        habit,
        logo,
        this.selectedLayout(),
        resolveSharePhotoPreviewOptions(
          this.isDesktopViewport(),
          this.gradientShadingEnabled(),
          this.showMetaEnabled(),
          this.selectedLabelLayout(),
        ),
      ),
    );
  }

  private async detectCamera(): Promise<void> {
    if (!navigator.mediaDevices?.enumerateDevices) {
      this.hasCamera.set(false);
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.hasCamera.set(devices.some((device) => device.kind === 'videoinput'));
    } catch {
      this.hasCamera.set(false);
    }
  }

  private loadLogo(): void {
    const logo = new Image();
    logo.onload = () => this.logoImage.set(logo);
    logo.onerror = () => this.logoImage.set(null);
    logo.src = LOGO_PATH;
  }
}
