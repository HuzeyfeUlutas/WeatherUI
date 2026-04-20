import { lazy, Suspense, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PROVINCES, PROVINCES_BY_ID } from '../../../entities/province'
import {
  getTemperatureSummariesByProvinceId,
  indexForecastsByProvinceId,
} from '../../../entities/weather'
import { ForecastDateSelector } from '../../../features/forecast-date-selector'
import { ForecastPanel } from '../../../features/forecast-panel'
import { ProvinceSearch } from '../../../features/province-search'
import {
  TemperatureLegend,
  TurkeyWeatherMap,
  useProvinceForecasts,
} from '../../../features/weather-map'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { Shell } from '../../../shared/ui'
import { useAppStore } from '../../../app/store/useAppStore'

const CountryGlobeEntry = lazy(() =>
  import('../../../features/country-globe').then((module) => ({
    default: module.CountryGlobeEntry,
  })),
)

export function WeatherDashboardPage() {
  const { t } = useTranslation()
  const provinceIds = useMemo(
    () => PROVINCES.map((province) => province.id),
    [],
  )
  const provinceForecastsQuery = useProvinceForecasts(provinceIds)
  const activeView = useAppStore((state) => state.activeView)
  const hoveredProvinceId = useAppStore((state) => state.hoveredProvinceId)
  const selectedCountryId = useAppStore((state) => state.selectedCountryId)
  const selectedForecastDate = useAppStore(
    (state) => state.selectedForecastDate,
  )
  const selectedProvinceId = useAppStore((state) => state.selectedProvinceId)
  const setActiveView = useAppStore((state) => state.setActiveView)
  const setHoveredProvinceId = useAppStore(
    (state) => state.setHoveredProvinceId,
  )
  const setSelectedCountryId = useAppStore(
    (state) => state.setSelectedCountryId,
  )
  const setSelectedForecastDate = useAppStore(
    (state) => state.setSelectedForecastDate,
  )
  const setSelectedProvinceId = useAppStore(
    (state) => state.setSelectedProvinceId,
  )
  const selectedProvince = PROVINCES_BY_ID[selectedProvinceId]
  const forecastsByProvinceId = useMemo(
    () => indexForecastsByProvinceId(provinceForecastsQuery.data ?? []),
    [provinceForecastsQuery.data],
  )
  const selectedForecast = forecastsByProvinceId[selectedProvinceId]
  const forecastDateExists = selectedForecast?.days.some(
    (day) => day.date === selectedForecastDate,
  )
  const activeForecastDate = forecastDateExists
    ? selectedForecastDate
    : selectedForecast?.days[0]?.date
  const isCurrentForecastDate =
    Boolean(activeForecastDate) &&
    activeForecastDate === selectedForecast?.days[0]?.date
  const dateContextLabel = isCurrentForecastDate
    ? t('forecast.current')
    : t('forecast.selectedDay')
  const temperaturesByProvinceId = useMemo(
    () =>
      getTemperatureSummariesByProvinceId(
        provinceForecastsQuery.data ?? [],
        activeForecastDate,
      ),
    [provinceForecastsQuery.data, activeForecastDate],
  )
  const selectedTemperature = temperaturesByProvinceId[selectedProvinceId]
  const retryForecasts = () => {
    void provinceForecastsQuery.refetch()
  }

  useEffect(() => {
    const firstDate = selectedForecast?.days[0]?.date
    const hasSelectedDate = selectedForecast?.days.some(
      (day) => day.date === selectedForecastDate,
    )

    if (firstDate && !hasSelectedDate) {
      setSelectedForecastDate(firstDate)
    }
  }, [selectedForecast?.days, selectedForecastDate, setSelectedForecastDate])

  if (activeView === 'globe') {
    return (
      <Shell
        activeSection="global"
        immersive
        title={t('app.globeTitle')}
      >
        <Suspense
          fallback={
            <div className="grid min-h-[620px] place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <p className="text-sm font-medium text-[var(--color-accent)]">
                {t('app.globeFallback')}
              </p>
            </div>
          }
        >
          <CountryGlobeEntry
            onEnterCountry={() => setActiveView('country-map')}
            onSelectCountry={setSelectedCountryId}
            selectedCountryId={selectedCountryId}
          />
        </Suspense>
      </Shell>
    )
  }

  return (
    <Shell
      actions={
        <button
          className="hidden rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] md:block"
          onClick={() => setActiveView('globe')}
          type="button"
        >
          {t('app.backToGlobe')}
        </button>
      }
      activeSection="regional"
      title={t('app.mapTitle')}
      footerMeta={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <ForecastDateSelector
            days={selectedForecast?.days ?? []}
            onSelectDate={setSelectedForecastDate}
            selectedDate={activeForecastDate}
          />
          <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-right shadow-sm">
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              {t('app.activeRegion')}
            </p>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {selectedProvince.name}{' '}
              <span className="text-[var(--color-accent)]">
                {selectedTemperature
                  ? formatTemperature(selectedTemperature.current)
                  : '--'}
              </span>
            </p>
          </div>
        </div>
      }
    >
      <div className="grid flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--color-panel-shadow)]">
            <TurkeyWeatherMap
              dateContextLabel={dateContextLabel}
              hoveredProvinceId={hoveredProvinceId}
              isError={provinceForecastsQuery.isError}
              onHoverProvince={setHoveredProvinceId}
              onRetry={retryForecasts}
              onSelectProvince={setSelectedProvinceId}
              selectedProvinceId={selectedProvinceId}
              temperaturesByProvinceId={temperaturesByProvinceId}
            />
          </div>

          <TemperatureLegend />
        </div>

        <div className="space-y-4">
            <ProvinceSearch
              onSelectProvince={setSelectedProvinceId}
              provinces={PROVINCES}
              selectedProvinceId={selectedProvinceId}
            />

            <ForecastPanel
              forecast={selectedForecast}
              isError={provinceForecastsQuery.isError}
              isLoading={provinceForecastsQuery.isLoading}
              onRetry={retryForecasts}
              province={selectedProvince}
              selectedDate={activeForecastDate}
            />
        </div>
      </div>
    </Shell>
  )
}
