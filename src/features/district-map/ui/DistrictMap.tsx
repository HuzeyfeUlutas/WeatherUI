import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DISTRICTS_BY_ID,
  type DistrictId,
} from '../../../entities/district'
import type { Province } from '../../../entities/province'
import type { WeatherTemperatureSummary } from '../../../entities/weather'
import { getTemperatureBand } from '../../../shared/lib/temperatureScale'
import { formatTemperature } from '../../../shared/lib/temperatureScale'
import {
  DISTRICT_MAP_VIEW_BOX,
  districtFeatureToPath,
  getDistrictFeatureLabelPoint,
  getDistrictMapBounds,
  type DistrictMapFeature,
  type DistrictMapGeoJson,
} from '../lib/districtMapGeometry'

type DistrictMapProps = {
  hoveredDistrictId?: DistrictId
  isError: boolean
  onBackToProvinceMap: () => void
  onHoverDistrict: (districtId?: DistrictId) => void
  onRetry: () => void
  onSelectDistrict: (districtId: DistrictId) => void
  province: Province
  selectedDistrictId: DistrictId
  temperaturesByDistrictId: Record<DistrictId, WeatherTemperatureSummary>
}

export function DistrictMap({
  hoveredDistrictId,
  isError,
  onBackToProvinceMap,
  onHoverDistrict,
  onRetry,
  onSelectDistrict,
  province,
  selectedDistrictId,
  temperaturesByDistrictId,
}: DistrictMapProps) {
  const { t } = useTranslation()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragStartRef = useRef<{ panX: number; panY: number; x: number; y: number } | null>(null)
  const [allFeatures, setAllFeatures] = useState<DistrictMapFeature[]>([])
  const features = useMemo(
    () =>
      allFeatures.filter(
        (feature) => feature.properties.provinceId === province.id,
      ),
    [allFeatures, province.id],
  )
  const activeDistrictId = hoveredDistrictId ?? selectedDistrictId
  const activeDistrict = DISTRICTS_BY_ID[activeDistrictId]
  const activeTemperature = temperaturesByDistrictId[activeDistrictId]
  const bounds = useMemo(
    () => (features.length ? getDistrictMapBounds(features) : undefined),
    [features],
  )
  const visibleLabelIds = useMemo(() => {
    if (!bounds) return new Set<DistrictId>()

    const selectedOrHoveredIds = new Set(
      [selectedDistrictId, hoveredDistrictId].filter(Boolean) as DistrictId[],
    )
    const minDistance = zoom >= 2
      ? 18
      : zoom >= 1.5
        ? 28
        : 44
    const placed: { id: DistrictId; x: number; y: number }[] = []

    for (const feature of features) {
      const id = feature.properties.id
      const point = getDistrictFeatureLabelPoint(feature, bounds)

      if (
        selectedOrHoveredIds.has(id) ||
        placed.every((label) => {
          const dx = label.x - point.x
          const dy = label.y - point.y

          return Math.sqrt(dx * dx + dy * dy) >= minDistance
        })
      ) {
        placed.push({ id, x: point.x, y: point.y })
      }
    }

    return new Set(placed.map((label) => label.id))
  }, [bounds, features, hoveredDistrictId, selectedDistrictId, zoom])

  useEffect(() => {
    fetch('/districts/turkey-districts.geojson')
      .then((response) => response.json())
      .then((geojson: DistrictMapGeoJson) => setAllFeatures(geojson.features))
      .catch(() => setAllFeatures([]))
  }, [])

  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [province.id])

  const zoomIn = () => setZoom((value) => Math.min(2.8, Number((value + 0.25).toFixed(2))))
  const zoomOut = () => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))
  const resetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  const startDrag = (clientX: number, clientY: number) => {
    if (zoom <= 1) return
    dragStartRef.current = { panX: pan.x, panY: pan.y, x: clientX, y: clientY }
  }
  const updateDrag = (clientX: number, clientY: number) => {
    const dragStart = dragStartRef.current
    if (!dragStart) return
    setPan({
      x: dragStart.panX + (clientX - dragStart.x) / zoom,
      y: dragStart.panY + (clientY - dragStart.y) / zoom,
    })
  }
  const endDrag = () => {
    dragStartRef.current = null
  }

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-lg bg-[var(--color-map-sea)] p-2 md:p-3">
      <div className="absolute left-4 top-4 z-20 max-w-[calc(100%-8rem)] rounded-lg border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-4 py-3 text-left shadow-[var(--color-panel-shadow)] backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)]">
              {t('districtMap.activeDistrict')}
            </p>
            <p className="mt-1 text-base font-bold text-[var(--color-text)]">
              {activeDistrict?.name ?? province.name}
            </p>
          </div>
          <button
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            onClick={onBackToProvinceMap}
            type="button"
          >
            {t('districtMap.backToTurkey')}
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          {activeTemperature
            ? `${t('forecast.current')} ${formatTemperature(activeTemperature.current)} · ${t('forecast.min')} ${formatTemperature(activeTemperature.min)} / ${t('forecast.max')} ${formatTemperature(activeTemperature.max)}`
            : t('map.temperatureLoading')}
        </p>
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--color-panel-shadow)]">
        <button
          aria-label={t('districtMap.zoomOut')}
          className="grid h-10 w-10 place-items-center border-r border-[var(--color-border)] text-lg font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
          onClick={zoomOut}
          type="button"
        >
          -
        </button>
        <button
          className="h-10 min-w-14 border-r border-[var(--color-border)] px-3 text-xs font-bold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)]"
          onClick={resetZoom}
          type="button"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          aria-label={t('districtMap.zoomIn')}
          className="grid h-10 w-10 place-items-center text-lg font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface-muted)]"
          onClick={zoomIn}
          type="button"
        >
          +
        </button>
      </div>

      {isError ? (
        <div className="absolute right-4 top-4 z-30 max-w-sm rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] p-4 text-left shadow-[var(--color-panel-shadow)]">
          <p className="text-sm font-semibold text-[var(--color-danger)]">
            {t('map.forecastErrorTitle')}
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

      <div className="relative z-10 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
        <svg
          aria-label={t('districtMap.ariaLabel', { province: province.name })}
          className="h-auto min-w-[820px] w-full drop-shadow-[0_24px_45px_rgba(15,34,50,0.16)] md:min-w-0"
          onMouseDown={(event) => startDrag(event.clientX, event.clientY)}
          onMouseLeave={endDrag}
          onMouseMove={(event) => updateDrag(event.clientX, event.clientY)}
          onMouseUp={endDrag}
          onTouchEnd={endDrag}
          onTouchMove={(event) => {
            const touch = event.touches[0]
            if (touch) updateDrag(touch.clientX, touch.clientY)
          }}
          onTouchStart={(event) => {
            const touch = event.touches[0]
            if (touch) startDrag(touch.clientX, touch.clientY)
          }}
          role="img"
          viewBox={`${DISTRICT_MAP_VIEW_BOX.x} ${DISTRICT_MAP_VIEW_BOX.y} ${DISTRICT_MAP_VIEW_BOX.width} ${DISTRICT_MAP_VIEW_BOX.height}`}
        >
          {bounds ? (
            <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
              <g>
                {features.map((feature) => {
                  const district = DISTRICTS_BY_ID[feature.properties.id]
                  const temperature =
                    temperaturesByDistrictId[feature.properties.id]
                  const band = temperature
                    ? getTemperatureBand(temperature.current)
                    : undefined
                  const isSelected = selectedDistrictId === feature.properties.id
                  const isHovered = hoveredDistrictId === feature.properties.id

                  if (!district) return null
                  if (!visibleLabelIds.has(district.id)) return null

                  return (
                    <path
                      aria-label={`${district.name} ${temperature?.current ?? ''} ${t('map.degree')}`}
                      className="cursor-pointer transition duration-150 outline-none focus-visible:brightness-110"
                      d={districtFeatureToPath(feature, bounds)}
                      fill={band?.hexColor ?? '#334155'}
                      fillOpacity={isSelected ? 0.96 : isHovered ? 0.88 : 0.7}
                      fillRule="evenodd"
                      key={feature.properties.id}
                      onClick={() => onSelectDistrict(district.id)}
                      onFocus={() => onHoverDistrict(district.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelectDistrict(district.id)
                        }
                      }}
                      onMouseEnter={() => onHoverDistrict(district.id)}
                      onMouseLeave={() => onHoverDistrict(undefined)}
                      role="button"
                      stroke={
                        isSelected
                          ? 'var(--color-accent-strong)'
                          : isHovered
                            ? 'var(--color-accent)'
                            : 'var(--color-bg)'
                      }
                      strokeLinejoin="round"
                      strokeWidth={isSelected ? 2.8 : isHovered ? 1.7 : 0.75}
                      tabIndex={0}
                    />
                  )
                })}
              </g>
              <g className="pointer-events-auto">
                {features.map((feature) => {
                  const district = DISTRICTS_BY_ID[feature.properties.id]
                  const temperature =
                    temperaturesByDistrictId[feature.properties.id]
                  const point = getDistrictFeatureLabelPoint(feature, bounds)
                  const temperatureText = temperature
                    ? formatTemperature(temperature.current)
                    : '--'

                  if (!district) return null

                  return (
                    <g
                      className="cursor-pointer"
                      key={feature.properties.id}
                      onClick={() => onSelectDistrict(district.id)}
                      onMouseEnter={() => onHoverDistrict(district.id)}
                      onMouseLeave={() => onHoverDistrict(undefined)}
                      transform={`translate(${point.x} ${point.y})`}
                    >
                      <rect
                        fill={
                          selectedDistrictId === district.id
                            ? 'var(--color-accent)'
                            : 'var(--color-surface)'
                        }
                        height="16"
                        rx="8"
                        stroke="var(--color-border)"
                        width="28"
                        x="-14"
                        y="-8"
                      />
                      <text
                        dominantBaseline="middle"
                        fill={
                          selectedDistrictId === district.id
                            ? '#ffffff'
                            : 'var(--color-accent)'
                        }
                        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                        fontSize="8.6"
                        fontWeight="800"
                        textAnchor="middle"
                      >
                        {temperatureText}
                      </text>
                    </g>
                  )
                })}
              </g>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  )
}
