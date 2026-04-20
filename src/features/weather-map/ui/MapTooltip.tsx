import type { Province } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { WeatherIcon } from '../../../shared/ui'
import { useTranslation } from 'react-i18next'

type MapTooltipProps = {
  dateContextLabel: string
  province: Province
  temperature?: WeatherTemperatureSummary
}

export function MapTooltip({
  dateContextLabel,
  province,
  temperature,
}: MapTooltipProps) {
  const { t } = useTranslation()

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 min-w-52 rounded-lg border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-4 py-3 text-left shadow-[var(--color-panel-shadow)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">
            {t('forecast.activeProvince')}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
            {province.name}
          </p>
        </div>
        <WeatherIcon
          className="mt-0.5 scale-90"
          weatherCode={temperature?.currentWeatherCode}
        />
      </div>
      {temperature ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {dateContextLabel} {formatTemperature(temperature.current)} ·{' '}
          {t('forecast.min')} {formatTemperature(temperature.min)} /{' '}
          {t('forecast.max')} {formatTemperature(temperature.max)}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {t('map.temperatureLoading')}
        </p>
      )}
    </div>
  )
}
