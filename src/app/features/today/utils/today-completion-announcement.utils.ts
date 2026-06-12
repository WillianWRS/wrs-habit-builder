export function formatHabitCompletionAnnouncement(
  habitName: string,
  completed: boolean,
  doneCount: number,
  totalCount: number,
): string {
  const action = completed ? 'marcada' : 'desmarcada';

  return `${habitName} ${action}, ${doneCount} de ${totalCount} concluídos`;
}
