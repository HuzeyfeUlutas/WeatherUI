import type { ForecastDay } from '../../../entities/weather'
import { getWeatherConditionLabel } from '../../../entities/weather'
import { formatForecastDate } from '../../../shared/lib/dateFormat'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { useTranslation } from 'react-i18next'

type ForecastDayCardProps = {
  day: ForecastDay
  isSelected?: boolean
}

export function ForecastDayCard({ day, isSelected = false }: ForecastDayCardProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'tr-TR'

  return (
    <li
      className={[
        'grid grid-cols-[1fr_74px] items-center gap-4 border-b border-[var(--color-border)] py-3 last:border-b-0',
        isSelected ? 'rounded-md bg-[var(--color-accent-soft)] px-3' : '',
      ].join(' ')}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {formatForecastDate(day.date, locale)}
        </p>
        <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
          {getWeatherConditionLabel(day.weatherCode, t)}
        </p>
        <p className="mt-1 truncate text-[11px] text-[var(--color-text-muted)]">
          {t('forecast.precipitationProbability')}{' '}
          <span className="font-semibold text-[var(--color-text)]">
            {formatProbability(day.precipitationProbabilityMax)}
          </span>
          {' · '}
          {t('forecast.wind')}{' '}
          <span className="font-semibold text-[var(--color-text)]">
            {formatWindSpeed(day.windSpeedMax, t('forecast.kmh'))}
          </span>
        </p>
      </div>

      <div className="text-right">
        <p className="font-mono text-lg font-semibold text-[var(--color-accent)]">
          {formatTemperature(day.temperatureMean)}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {formatTemperature(day.temperatureMin)} /{' '}
          {formatTemperature(day.temperatureMax)}
        </p>
      </div>
    </li>
  )
}

function formatProbability(value?: number) {
  return value !== undefined ? `%${Math.round(value)}` : '--'
}

function formatWindSpeed(value: number | undefined, unit: string) {
  if (value === undefined) return '--'

  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${unit}`
}
