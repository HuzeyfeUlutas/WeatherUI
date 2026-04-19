export function formatForecastDate(date: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(`${date}T12:00:00`))
}

export function formatUpdatedAt(date: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(date))
}
