export function formatForecastDate(date: string, locale = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(`${date}T12:00:00`))
}

export function formatUpdatedAt(date: string, locale = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(date))
}
