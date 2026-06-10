export interface CompletionRestoreDay {
  dateKey: string;
  habitNames: readonly string[];
}

export interface CompletionRestorePatch {
  id: string;
  days: readonly CompletionRestoreDay[];
}

/** Conclusões informadas manualmente para restaurar histórico perdido. */
export const COMPLETION_RESTORE_PATCH: CompletionRestorePatch = {
  id: 'user-restore-2026-06-10',
  days: [
    {
      dateKey: '2026-06-09',
      habitNames: ['caminhada', 'muay thai', 'ingles', 'leitura'],
    },
    {
      dateKey: '2026-06-08',
      habitNames: ['musculação', 'caminhada'],
    },
  ],
};
