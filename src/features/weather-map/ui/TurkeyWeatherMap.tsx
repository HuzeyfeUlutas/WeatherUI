import { cities as turkeyMapCities } from 'turkey-map-react/lib/data'
import type { CityType } from 'turkey-map-react'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PROVINCES,
  PROVINCES_BY_ID,
  type Province,
  type ProvinceId,
} from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { pathToLabelPoint, TURKEY_MAP_VIEW_BOX } from '../lib/mapCoordinates'
import { MapTooltip } from './MapTooltip'
import { ProvinceMapPath } from './ProvinceMapPath'
import { TemperatureLabel } from './TemperatureLabel'

type TurkeyWeatherMapProps = {
  dateContextLabel: string
  hoveredProvinceId?: ProvinceId
  isError: boolean
  onRetry: () => void
  selectedProvinceId: ProvinceId
  temperaturesByProvinceId: Record<ProvinceId, WeatherTemperatureSummary>
  onHoverProvince: (provinceId?: ProvinceId) => void
  onSelectProvince: (provinceId: ProvinceId) => void
}

const mapCitiesByPlate = new Map(
  (turkeyMapCities as CityType[]).map((city) => [
    city.plateNumber.toString().padStart(2, '0'),
    city,
  ]),
)

function getPathForProvince(province: Province): string | undefined {
  return mapCitiesByPlate.get(province.id)?.path
}

export function TurkeyWeatherMap({
  dateContextLabel,
  hoveredProvinceId,
  isError,
  onRetry,
  selectedProvinceId,
  temperaturesByProvinceId,
  onHoverProvince,
  onSelectProvince,
}: TurkeyWeatherMapProps) {
  const { t } = useTranslation()
  const mapScrollRef = useRef<HTMLDivElement>(null)
  const activeProvinceId = hoveredProvinceId ?? selectedProvinceId
  const activeProvince = PROVINCES_BY_ID[activeProvinceId]
  const activeTemperature = temperaturesByProvinceId[activeProvinceId]
  const selectedLabelPoint = useMemo(() => {
    const selectedProvince = PROVINCES_BY_ID[selectedProvinceId]
    const path = selectedProvince ? getPathForProvince(selectedProvince) : undefined

    return path ? pathToLabelPoint(path) : undefined
  }, [selectedProvinceId])

  useEffect(() => {
    const container = mapScrollRef.current

    if (!container || !selectedLabelPoint) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      const svg = container.querySelector('svg')

      if (!svg || container.scrollWidth <= container.clientWidth) {
        return
      }

      const svgWidth = svg.getBoundingClientRect().width
      const xRatio =
        (selectedLabelPoint.x - TURKEY_MAP_VIEW_BOX.minX) /
        TURKEY_MAP_VIEW_BOX.width
      const selectedPixelX = xRatio * svgWidth
      const targetScrollLeft = selectedPixelX - container.clientWidth / 2
      const maxScrollLeft = container.scrollWidth - container.clientWidth

      container.scrollTo({
        behavior: 'smooth',
        left: Math.max(0, Math.min(targetScrollLeft, maxScrollLeft)),
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [selectedLabelPoint])

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-lg bg-[var(--color-map-sea)] p-2 md:p-3">
      <div className="pointer-events-none absolute inset-0 bg-[var(--color-map-sea)]" />
      {activeProvince ? (
        <MapTooltip
          dateContextLabel={dateContextLabel}
          province={activeProvince}
          temperature={activeTemperature}
        />
      ) : null}

      {isError ? (
        <div className="absolute right-4 top-4 z-20 max-w-sm rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] p-4 text-left shadow-[var(--color-panel-shadow)]">
          <p className="text-sm font-semibold text-[var(--color-danger)]">
            {t('map.forecastErrorTitle')}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
            {t('map.forecastErrorBody')}
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

      <div
        className="relative z-10 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]"
        ref={mapScrollRef}
      >
        <svg
          aria-label={t('map.ariaLabel')}
          className="h-auto min-w-[980px] w-full drop-shadow-[0_24px_45px_rgba(15,34,50,0.16)] md:min-w-0"
          role="img"
          viewBox={`${TURKEY_MAP_VIEW_BOX.minX} ${TURKEY_MAP_VIEW_BOX.minY} ${TURKEY_MAP_VIEW_BOX.width} ${TURKEY_MAP_VIEW_BOX.height}`}
        >
          <g>
            {PROVINCES.map((province) => {
              const path = getPathForProvince(province)
              const temperature = temperaturesByProvinceId[province.id]

              if (!path) {
                return null
              }

              return (
                <ProvinceMapPath
                  isHovered={hoveredProvinceId === province.id}
                  isSelected={selectedProvinceId === province.id}
                  key={province.id}
                  onFocus={onHoverProvince}
                  onMouseEnter={onHoverProvince}
                  onMouseLeave={() => onHoverProvince(undefined)}
                  onSelect={onSelectProvince}
                  path={path}
                  province={province}
                  temperature={temperature}
                />
              )
            })}
          </g>

          <g className="pointer-events-auto">
            {PROVINCES.map((province) => {
              const temperature = temperaturesByProvinceId[province.id]
              const path = getPathForProvince(province)

              if (!path) {
                return null
              }

              return (
                <TemperatureLabel
                  isSelected={selectedProvinceId === province.id}
                  key={province.id}
                  onHover={onHoverProvince}
                  onSelect={onSelectProvince}
                  point={pathToLabelPoint(path)}
                  province={province}
                  temperature={temperature}
                />
              )
            })}
          </g>
        </svg>
      </div>

      <div className="sr-only" aria-live="polite">
        {t('map.selectedProvince')} {PROVINCES_BY_ID[selectedProvinceId]?.name}
      </div>
    </div>
  )
}
