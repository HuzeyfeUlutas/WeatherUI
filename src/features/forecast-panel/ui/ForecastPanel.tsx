import type { Province } from '../../../entities/province'
import {
  getForecastDayByDate,
  type ProvinceForecast,
} from '../../../entities/weather'
import { formatUpdatedAt } from '../../../shared/lib/dateFormat'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { WeatherIcon } from '../../../shared/ui'
import { ForecastDayCard } from './ForecastDayCard'
import { useTranslation } from 'react-i18next'

type ForecastPanelProps = {
  forecast?: ProvinceForecast
  isError: boolean
  isLoading: boolean
  province: Province
  onRetry: () => void
  selectedDate?: string
}

export function ForecastPanel({
  forecast,
  isError,
  isLoading,
  province,
  onRetry,
  selectedDate,
}: ForecastPanelProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'tr-TR'
  const today = forecast?.days[0]
  const selectedDay = getForecastDayByDate(forecast, selectedDate)
  const isCurrentDay = Boolean(selectedDay && today?.date === selectedDay.date)
  const currentTemperature =
    isCurrentDay && forecast?.currentTemperature !== undefined
      ? forecast.currentTemperature
      : selectedDay?.temperatureMean
  const currentWeatherCode =
    isCurrentDay && forecast?.currentWeatherCode !== undefined
      ? forecast.currentWeatherCode
      : selectedDay?.weatherCode
  const apparentTemperature =
    isCurrentDay && forecast?.currentApparentTemperature !== undefined
      ? forecast.currentApparentTemperature
      : selectedDay?.apparentTemperatureMax
  const precipitationValue =
    isCurrentDay && forecast?.currentPrecipitation !== undefined
      ? formatPrecipitation(forecast.currentPrecipitation, t('forecast.millimeter'))
      : formatProbability(selectedDay?.precipitationProbabilityMax)
  const precipitationLabel = isCurrentDay
    ? t('forecast.precipitation')
    : t('forecast.precipitationProbability')
  const windSpeed =
    isCurrentDay && forecast?.currentWindSpeed !== undefined
      ? forecast.currentWindSpeed
      : selectedDay?.windSpeedMax
  const windDirection =
    isCurrentDay && forecast?.currentWindDirection !== undefined
      ? forecast.currentWindDirection
      : selectedDay?.windDirectionDominant
  const windGust =
    isCurrentDay && forecast?.currentWindGusts !== undefined
      ? forecast.currentWindGusts
      : selectedDay?.windGustsMax
  const relativeHumidity =
    isCurrentDay && forecast?.currentRelativeHumidity !== undefined
      ? forecast.currentRelativeHumidity
      : selectedDay?.relativeHumidityMean
  const temperatureLabel = isCurrentDay
    ? t('forecast.current')
    : t('forecast.selectedDay')

  return (
    <aside className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--color-panel-shadow)]">
      <div className="border-b border-[var(--color-border)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)]">
              {t('forecast.activeProvince')}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-[var(--color-text)]">
              {province.name}
            </h2>
          </div>

          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-accent-soft)] font-mono text-xs font-bold text-[var(--color-accent)]">
            {province.plateCode.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">
            {temperatureLabel}
          </p>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <p className="font-mono text-6xl font-light leading-none text-[var(--color-accent)]">
                {currentTemperature !== undefined
                  ? formatTemperature(currentTemperature)
                  : '--'}
              </p>
              <span className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                C
              </span>
            </div>
            <WeatherIcon
              className="shrink-0"
              weatherCode={currentWeatherCode}
            />
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          {selectedDay
            ? `${formatTemperature(selectedDay.temperatureMin)} ${t('forecast.min')} / ${formatTemperature(
                selectedDay.temperatureMax,
              )} ${t('forecast.max')}`
            : t('forecast.waiting')}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <WeatherMetricCard
            label={t('forecast.feelsLike')}
            value={
              apparentTemperature !== undefined
                ? formatTemperature(apparentTemperature)
                : '--'
            }
          />
          <WeatherMetricCard
            label={t('forecast.humidity')}
            value={formatProbability(relativeHumidity)}
          />
          <WeatherMetricCard
            label={precipitationLabel}
            value={precipitationValue}
          />
          <WeatherMetricCard
            label={t('forecast.wind')}
            meta={
              windDirection !== undefined
                ? formatWindDirection(windDirection, t)
                : undefined
            }
            value={formatWindSpeed(windSpeed, t('forecast.kmh'))}
          />
          <WeatherMetricCard
            className="col-span-2"
            label={t('forecast.windGust')}
            value={formatWindSpeed(windGust, t('forecast.kmh'))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
        <Metric
          label={t('forecast.updated')}
          value={forecast ? formatUpdatedAt(forecast.updatedAt, locale) : '--'}
        />
        <Metric label={t('forecast.projection')} value={t('forecast.projectionValue')} />
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

function WeatherMetricCard({
  className = '',
  label,
  meta,
  value,
}: {
  className?: string
  label: string
  meta?: string
  value: string
}) {
  return (
    <div
      className={[
        'min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3',
        className,
      ].join(' ')}
    >
      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className="truncate font-mono text-lg font-semibold text-[var(--color-text)]">
          {value}
        </p>
        {meta ? (
          <span className="shrink-0 text-xs font-semibold text-[var(--color-accent)]">
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-r border-[var(--color-border)] p-4 last:border-r-0">
      <p className="text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </div>
  )
}

function formatProbability(value?: number) {
  return value !== undefined ? `%${Math.round(value)}` : '--'
}

function formatPrecipitation(value: number | undefined, unit: string) {
  return value !== undefined ? `${roundMetric(value)} ${unit}` : '--'
}

function formatWindSpeed(value: number | undefined, unit: string) {
  return value !== undefined ? `${roundMetric(value)} ${unit}` : '--'
}

function formatWindDirection(
  degrees: number,
  t: ReturnType<typeof useTranslation>['t'],
) {
  const directions = [
    'forecast.directionNorth',
    'forecast.directionNorthEast',
    'forecast.directionEast',
    'forecast.directionSouthEast',
    'forecast.directionSouth',
    'forecast.directionSouthWest',
    'forecast.directionWest',
    'forecast.directionNorthWest',
  ] as const
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % directions.length

  return `${t(directions[index])} ${Math.round(degrees)}°`
}

function roundMetric(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}
