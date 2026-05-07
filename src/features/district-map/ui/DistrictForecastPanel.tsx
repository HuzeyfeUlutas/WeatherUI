import { useTranslation } from 'react-i18next'
import type { District } from '../../../entities/district'
import {
  getForecastDayByDate,
  type DistrictForecast,
} from '../../../entities/weather'
import { formatUpdatedAt } from '../../../shared/lib/dateFormat'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { WeatherIcon } from '../../../shared/ui'
import { ForecastDayCard } from '../../forecast-panel/ui/ForecastDayCard'

type DistrictForecastPanelProps = {
  district: District
  forecast?: DistrictForecast
  isError: boolean
  isLoading: boolean
  onRetry: () => void
  selectedDate?: string
}

export function DistrictForecastPanel({
  district,
  forecast,
  isError,
  isLoading,
  onRetry,
  selectedDate,
}: DistrictForecastPanelProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'tr-TR'
  const selectedDay = getForecastDayByDate(forecast, selectedDate)
  const today = forecast?.days[0]
  const isCurrentDay = Boolean(selectedDay && today?.date === selectedDay.date)
  const currentTemperature =
    isCurrentDay && forecast?.currentTemperature !== undefined
      ? forecast.currentTemperature
      : selectedDay?.temperatureMean
  const currentWeatherCode =
    isCurrentDay && forecast?.currentWeatherCode !== undefined
      ? forecast.currentWeatherCode
      : selectedDay?.weatherCode
  const windSpeed =
    isCurrentDay && forecast?.currentWindSpeed !== undefined
      ? forecast.currentWindSpeed
      : selectedDay?.windSpeedMax
  const humidity =
    isCurrentDay && forecast?.currentRelativeHumidity !== undefined
      ? forecast.currentRelativeHumidity
      : selectedDay?.relativeHumidityMean

  return (
    <aside className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--color-panel-shadow)]">
      <div className="border-b border-[var(--color-border)] p-6">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          {t('districtMap.activeDistrict')}
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-normal text-[var(--color-text)]">
              {district.name}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {t('districtMap.ankaraDistricts')}
            </p>
          </div>
          <WeatherIcon
            className="shrink-0"
            weatherCode={currentWeatherCode}
          />
        </div>

        <div className="mt-6 flex items-baseline gap-2">
          <p className="font-mono text-6xl font-light leading-none text-[var(--color-accent)]">
            {currentTemperature !== undefined
              ? formatTemperature(currentTemperature)
              : '--'}
          </p>
          <span className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            C
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <MiniMetric
            label={t('forecast.humidity')}
            value={humidity !== undefined ? `%${Math.round(humidity)}` : '--'}
          />
          <MiniMetric
            label={t('forecast.wind')}
            value={
              windSpeed !== undefined
                ? `${Math.round(windSpeed)} ${t('forecast.kmh')}`
                : '--'
            }
          />
          <MiniMetric
            label={t('forecast.updated')}
            value={forecast ? formatUpdatedAt(forecast.updatedAt, locale) : '--'}
          />
          <MiniMetric label={t('forecast.projection')} value={t('forecast.projectionValue')} />
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">
            {t('forecast.fiveDayProjection')}
          </p>
          {isLoading ? (
            <span className="text-xs text-[var(--color-accent)]">{t('forecast.loading')}</span>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                className="h-14 animate-pulse rounded-md bg-[var(--color-surface-muted)]"
                key={index}
              />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="mt-5 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] p-4">
            <p className="text-sm font-semibold text-[var(--color-danger)]">
              {t('forecast.errorTitle')}
            </p>
            <button
              className="mt-3 rounded-md bg-[var(--color-danger)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              onClick={onRetry}
              type="button"
            >
              {t('forecast.retry')}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && forecast ? (
          <ul className="mt-4">
            {forecast.days.map((day) => (
              <ForecastDayCard
                day={day}
                isSelected={day.date === selectedDay?.date}
                key={day.date}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </aside>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </div>
  )
}
