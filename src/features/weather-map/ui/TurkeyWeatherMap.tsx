import { cities as turkeyMapCities } from 'turkey-map-react/lib/data'
import type { CityType } from 'turkey-map-react'
import {
  PROVINCES,
  PROVINCES_BY_ID,
  type Province,
  type ProvinceId,
} from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { classNames } from '../../../shared/lib/classNames'
import { TURKEY_MAP_VIEW_BOX } from '../lib/mapCoordinates'
import { MapTooltip } from './MapTooltip'
import { ProvinceMapPath } from './ProvinceMapPath'
import { TemperatureLabel } from './TemperatureLabel'

type TurkeyWeatherMapProps = {
  hoveredProvinceId?: ProvinceId
  isError: boolean
  isLoading: boolean
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
  hoveredProvinceId,
  isError,
  isLoading,
  onRetry,
  selectedProvinceId,
  temperaturesByProvinceId,
  onHoverProvince,
  onSelectProvince,
}: TurkeyWeatherMapProps) {
  const activeProvinceId = hoveredProvinceId ?? selectedProvinceId
  const activeProvince = PROVINCES_BY_ID[activeProvinceId]
  const activeTemperature = temperaturesByProvinceId[activeProvinceId]

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-slate-900/80 p-2 shadow-2xl shadow-slate-950/40 md:p-3">
      {activeProvince ? (
        <MapTooltip province={activeProvince} temperature={activeTemperature} />
      ) : null}

      {isError ? (
        <div className="absolute right-4 top-4 z-20 max-w-sm rounded-lg border border-rose-300/30 bg-rose-950/90 p-4 text-left shadow-xl shadow-slate-950/30">
          <p className="text-sm font-semibold text-rose-100">
            Hava tahmini alinamadi
          </p>
          <p className="mt-1 text-xs leading-5 text-rose-100/80">
            Open-Meteo istegi basarisiz oldu. Harita calismaya devam ediyor.
          </p>
          <button
            className="mt-3 rounded-md bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-950 transition hover:bg-white"
            onClick={onRetry}
            type="button"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      <svg
        aria-label="Türkiye il bazlı sıcaklık haritası"
        className="h-auto min-w-[760px] w-full md:min-w-0"
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

            return (
              <TemperatureLabel
                isSelected={selectedProvinceId === province.id}
                key={province.id}
                onSelect={onSelectProvince}
                province={province}
                temperature={temperature}
              />
            )
          })}
        </g>
      </svg>

      <div className="sr-only" aria-live="polite">
        Secili il {PROVINCES_BY_ID[selectedProvinceId]?.name}
      </div>

      <div
        className={classNames(
          'absolute bottom-3 left-3 rounded-md border border-white/10 px-3 py-2 text-[11px] text-slate-300 backdrop-blur',
          'bg-slate-950/70',
        )}
      >
        {isLoading ? 'Tahminler yukleniyor' : 'Open-Meteo tahmin verisi'}
      </div>
    </div>
  )
}
