import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div
      class="min-h-dvh bg-brand-light-bg text-brand-light-text-primary dark:bg-brand-bg dark:text-brand-text-primary"
    >
      <header
        class="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 md:px-8"
      >
        <img
          src="/habit-builder.png"
          alt="Habit Builder"
          class="h-11 w-auto rounded-[18%] object-contain"
          width="120"
          height="48"
        />
        <a
          routerLink="/today"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-light-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary"
        >
          Abrir app
          <i class="bi bi-arrow-right" aria-hidden="true"></i>
        </a>
      </header>

      <main class="mx-auto max-w-5xl px-4 pb-16 md:px-8">
        <section class="py-10 text-center md:py-16">
          <p
            class="text-sm font-semibold uppercase tracking-wide text-brand-light-primary dark:text-brand-primary"
          >
            Local-first · Sem conta
          </p>
          <h1
            class="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight md:text-5xl"
          >
            Consistência gentil para hábitos que importam
          </h1>
          <p
            class="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-light-text-secondary dark:text-brand-text-secondary md:text-lg"
          >
            Marque o dia, acompanhe adesão e proteja sua sequência — sem culpa,
            sem punição, com seus dados no seu dispositivo.
          </p>
          <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              routerLink="/today"
              class="inline-flex min-w-[12rem] items-center justify-center gap-2 rounded-xl bg-brand-light-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:bg-brand-primary dark:text-brand-bg dark:focus-visible:ring-brand-primary"
            >
              Começar agora
            </a>
            <a
              routerLink="/privacy"
              class="inline-flex min-w-[12rem] items-center justify-center rounded-xl border border-brand-light-border px-6 py-3 text-sm font-medium text-brand-light-text-secondary transition-colors hover:border-brand-light-primary/40 hover:text-brand-light-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light-primary dark:border-brand-border dark:text-brand-text-secondary dark:hover:border-brand-primary/40 dark:hover:text-brand-text-primary dark:focus-visible:ring-brand-primary"
            >
              Privacidade
            </a>
          </div>
        </section>

        <section
          class="grid gap-6 md:grid-cols-3"
          aria-label="Destaques do app"
        >
          <article
            class="rounded-2xl border border-brand-light-border bg-brand-light-surface p-6 dark:border-brand-border dark:bg-brand-surface"
          >
            <i
              class="bi bi-calendar-check text-2xl text-brand-light-primary dark:text-brand-primary"
              aria-hidden="true"
            ></i>
            <h2 class="mt-4 font-display text-lg font-semibold">Hoje em 1 toque</h2>
            <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
              Veja só o que importa hoje e marque hábitos sem atrito.
            </p>
          </article>

          <article
            class="rounded-2xl border border-brand-light-border bg-brand-light-surface p-6 dark:border-brand-border dark:bg-brand-surface"
          >
            <i
              class="bi bi-graph-up-arrow text-2xl text-brand-light-primary dark:text-brand-primary"
              aria-hidden="true"
            ></i>
            <h2 class="mt-4 font-display text-lg font-semibold">Adesão, não perfeição</h2>
            <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
              Métricas gentis de 7 e 30 dias — consistência acima de streak punitiva.
            </p>
          </article>

          <article
            class="rounded-2xl border border-brand-light-border bg-brand-light-surface p-6 dark:border-brand-border dark:bg-brand-surface"
          >
            <i
              class="bi bi-shield-check text-2xl text-brand-light-primary dark:text-brand-primary"
              aria-hidden="true"
            ></i>
            <h2 class="mt-4 font-display text-lg font-semibold">Seus dados, seu device</h2>
            <p class="mt-2 text-sm text-brand-light-text-secondary dark:text-brand-text-secondary">
              IndexedDB local, export JSON quando quiser. Zero login.
            </p>
          </article>
        </section>

        <section class="mt-12 grid gap-4 md:grid-cols-2" aria-label="Capturas de tela">
          <figure
            class="overflow-hidden rounded-2xl border border-brand-light-border dark:border-brand-border"
          >
            <img
              src="/habit-builder.png"
              alt="Tela Hoje do Habit Builder"
              class="w-full object-cover"
              loading="lazy"
            />
            <figcaption
              class="border-t border-brand-light-border bg-brand-light-surface px-4 py-3 text-sm text-brand-light-text-secondary dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-secondary"
            >
              Tela Hoje — marque hábitos rapidamente
            </figcaption>
          </figure>
          <figure
            class="overflow-hidden rounded-2xl border border-brand-light-border dark:border-brand-border"
          >
            <img
              src="/habit-builder-icon.png"
              alt="Ícone do Habit Builder"
              class="mx-auto w-48 object-contain p-8"
              loading="lazy"
            />
            <figcaption
              class="border-t border-brand-light-border bg-brand-light-surface px-4 py-3 text-sm text-brand-light-text-secondary dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-secondary"
            >
              Instale no celular como PWA
            </figcaption>
          </figure>
        </section>
      </main>

      <footer
        class="border-t border-brand-light-border px-4 py-8 text-center text-sm text-brand-light-text-secondary dark:border-brand-border dark:text-brand-text-secondary"
      >
        <p>Habit Builder · 100% free no beta</p>
        <p class="mt-2">
          <a
            routerLink="/privacy"
            class="underline underline-offset-2 hover:text-brand-light-text-primary dark:hover:text-brand-text-primary"
          >
            Política de privacidade
          </a>
        </p>
      </footer>
    </div>
  `,
})
export class LandingPageComponent {}
