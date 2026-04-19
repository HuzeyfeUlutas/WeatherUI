import { useMemo } from 'react'
import { PROVINCES, PROVINCES_BY_ID } from '../../../entities/province'
import {
  getTemperatureSummariesByProvinceId,
  indexForecastsByProvinceId,
} from '../../../entities/weather'
import { ForecastPanel } from '../../../features/forecast-panel'
import { ProvinceSearch } from '../../../features/province-search'
import {
  TemperatureLegend,
  TurkeyWeatherMap,
  useProvinceForecasts,
} from '../../../features/weather-map'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import { DataAttribution } from '../../../shared/ui'
import { useAppStore } from '../../../app/store/useAppStore'

export function WeatherDashboardPage() {
  const provinceIds = useMemo(
    () => PROVINCES.map((province) => province.id),
    [],
  )
  const provinceForecastsQuery = useProvinceForecasts(provinceIds)
  const hoveredProvinceId = useAppStore((state) => state.hoveredProvinceId)
  const selectedProvinceId = useAppStore((state) => state.selectedProvinceId)
  const setHoveredProvinceId = useAppStore(
    (state) => state.setHoveredProvinceId,
  )
  const setSelectedProvinceId = useAppStore(
    (state) => state.setSelectedProvinceId,
  )
  const selectedProvince = PROVINCES_BY_ID[selectedProvinceId]
  const temperaturesByProvinceId = useMemo(
    () => getTemperatureSummariesByProvinceId(provinceForecastsQuery.data ?? []),
    [provinceForecastsQuery.data],
  )
  const forecastsByProvinceId = useMemo(
    () => indexForecastsByProvinceId(provinceForecastsQuery.data ?? []),
    [provinceForecastsQuery.data],
  )
  const selectedTemperature = temperaturesByProvinceId[selectedProvinceId]
  const selectedForecast = forecastsByProvinceId[selectedProvinceId]
  const retryForecasts = () => {
    void provinceForecastsQuery.refetch()
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-3 py-5 md:px-6 lg:py-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300">
              WeatherUI
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white md:text-5xl">
              Türkiye hava tahmini haritası
            </h1>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Secili il
            </p>
            <p className="mt-1 text-xl font-semibold text-white">
              {selectedProvince.name}{' '}
              <span className="text-cyan-300">
                {selectedTemperature
                  ? formatTemperature(selectedTemperature.current)
                  : '--'}
              </span>
            </p>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg">
              <TurkeyWeatherMap
                hoveredProvinceId={hoveredProvinceId}
                isError={provinceForecastsQuery.isError}
                isLoading={provinceForecastsQuery.isLoading}
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
            />
          </div>
        </div>

        <footer className="border-t border-white/10 pt-4">
          <DataAttribution />
        </footer>
      </section>
    </main>
  )
}
