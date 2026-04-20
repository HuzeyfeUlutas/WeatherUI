import { useTranslation } from 'react-i18next'
import type { ForecastDay } from '../../../entities/weather'

type ForecastDateSelectorProps = {
  days: ForecastDay[]
  selectedDate?: string
  onSelectDate: (date: string) => void
}

export function ForecastDateSelector({
  days,
  selectedDate,
  onSelectDate,
}: ForecastDateSelectorProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'tr-TR'

  if (days.length === 0) {
    return null
  }

  const activeDate = selectedDate ?? days[0]?.date

  return (
    <section
      aria-label={t('forecast.forecastDate')}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-sm"
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        {days.map((day, index) => {
          const isSelected = day.date === activeDate
          const date = new Date(`${day.date}T12:00:00`)
          const label =
            index === 0
              ? t('forecast.today')
              : index === 1
                ? t('forecast.tomorrow')
                : new Intl.DateTimeFormat(locale, {
                    weekday: 'short',
                  }).format(date)
          const dateLabel = new Intl.DateTimeFormat(locale, {
            day: 'numeric',
            month: 'short',
          }).format(date)

          return (
            <button
              aria-pressed={isSelected}
              className={[
                'min-w-[94px] rounded-md border px-3 py-2 text-left transition',
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]',
              ].join(' ')}
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              type="button"
            >
              <span className="block text-xs font-semibold">{label}</span>
              <span className="mt-1 block text-sm font-bold">{dateLabel}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
