import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import type { CountryId } from '../../../entities/country'

type GeoJsonPolygon = { type: 'Polygon'; coordinates: number[][][] }
type GeoJsonMultiPolygon = { type: 'MultiPolygon'; coordinates: number[][][][] }
type GeoJsonFeature = {
  geometry: GeoJsonPolygon | GeoJsonMultiPolygon | null
  properties: { ISO_A2: string; NAME: string }
}

type GlobePolygon = {
  holes: number[][][]
  outerRing: number[][]
}

type NormalizedGlobeCountry = {
  center: { latitude: number; longitude: number }
  id: string
  name: string
  polygons: GlobePolygon[]
}

const CURATED_COUNTRY_CENTERS: Record<string, { latitude: number; longitude: number }> = {
  TR: { latitude: 39.1, longitude: 35.2 },
}

function normalizeGlobeCountries(features: GeoJsonFeature[]): NormalizedGlobeCountry[] {
  const countriesById = new Map<string, Omit<NormalizedGlobeCountry, 'center'> & {
    center?: NormalizedGlobeCountry['center']
  }>()

  for (const feature of features) {
    const id = feature.properties.ISO_A2

    if (!feature.geometry || !id || id === '-99') {
      continue
    }

    const polygons = getFeaturePolygons(feature)

    if (polygons.length === 0) {
      continue
    }

    const existing = countriesById.get(id)
    if (existing) {
      existing.polygons.push(...polygons)
    } else {
      countriesById.set(id, {
        id,
        name: feature.properties.NAME,
        polygons,
      })
    }
  }

  return Array.from(countriesById.values())
    .map((country) => ({
      ...country,
      center: CURATED_COUNTRY_CENTERS[country.id] ?? computeCountryCenter(country.polygons),
    }))
    .sort((a, b) => {
      if (a.id === 'TR') return -1
      if (b.id === 'TR') return 1
      return a.name.localeCompare(b.name)
    })
}

function getFeaturePolygons(feature: GeoJsonFeature): GlobePolygon[] {
  const geom = feature.geometry
  if (!geom) return []

  const rawPolygons: number[][][][] =
    geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates

  return rawPolygons
    .filter((polygon) => polygon[0]?.length >= 4)
    .map((polygon) => ({
      outerRing: polygon[0],
      holes: polygon.slice(1).filter((ring) => ring.length >= 4),
    }))
}

function computeCountryCenter(polygons: GlobePolygon[]) {
  const largestPolygon = polygons.reduce((largest, polygon) => {
    return Math.abs(ringSignedArea(polygon.outerRing)) > Math.abs(ringSignedArea(largest.outerRing))
      ? polygon
      : largest
  }, polygons[0])

  return ringCentroid(largestPolygon.outerRing)
}

function ringSignedArea(ring: number[][]) {
  let area = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1]
  }
  return area / 2
}

function ringCentroid(ring: number[][]) {
  let areaFactor = 0
  let centroidLon = 0
  let centroidLat = 0

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lonA, latA] = ring[j]
    const [lonB, latB] = ring[i]
    const cross = lonA * latB - lonB * latA
    areaFactor += cross
    centroidLon += (lonA + lonB) * cross
    centroidLat += (latA + latB) * cross
  }

  if (Math.abs(areaFactor) < 0.000001) {
    let sumLon = 0
    let sumLat = 0
    for (const [lon, lat] of ring) {
      sumLon += lon
      sumLat += lat
    }
    return {
      latitude: sumLat / ring.length,
      longitude: sumLon / ring.length,
    }
  }

  return {
    latitude: centroidLat / (3 * areaFactor),
    longitude: centroidLon / (3 * areaFactor),
  }
}

type CountryGlobeEntryProps = {
  selectedCountryId: CountryId
  onSelectCountry: (countryId: CountryId) => void
  onEnterCountry: () => void
}

export function CountryGlobeEntry({
  selectedCountryId,
  onSelectCountry,
  onEnterCountry,
}: CountryGlobeEntryProps) {
  const { t } = useTranslation()
  const [isEntering, setIsEntering] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [geoCountries, setGeoCountries] = useState<NormalizedGlobeCountry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [panelOpen, setPanelOpen] = useState(true)
  const comingSoonTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const focusTriggerRef = useRef<{ lat: number; lon: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/countries-110m.geojson')
      .then((r) => r.json())
      .then((geojson: { features: GeoJsonFeature[] }) => {
        setGeoCountries(normalizeGlobeCountries(geojson.features))
      })
      .catch(() => {})
  }, [])

  const selectedGeoCountry = geoCountries.find((c) => c.id === selectedCountryId)
  const isTurkey = selectedCountryId === 'TR'

  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return geoCountries
    return geoCountries.filter((c) => c.name.toLowerCase().includes(q))
  }, [geoCountries, searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  // Keyboard navigation for dropdown
  useEffect(() => {
    if (!dropdownOpen) { setHighlightedIndex(-1); return }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDropdownOpen(false); setSearchQuery('') }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, filteredCountries.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, 0)) }
      else if (e.key === 'Enter' && highlightedIndex >= 0) { selectCountry(filteredCountries[highlightedIndex].id) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dropdownOpen, filteredCountries, highlightedIndex])

  const openDropdown = () => {
    setDropdownOpen(true)
    setSearchQuery('')
    window.setTimeout(() => searchInputRef.current?.focus(), 30)
  }

  const selectCountry = (id: string) => {
    handleCountrySelect(id)
    setDropdownOpen(false)
    setSearchQuery('')
  }

  const enterCountry = () => {
    onSelectCountry('TR')
    setIsEntering(true)
    window.setTimeout(onEnterCountry, 1650)
  }

  const handleCountrySelect = (id: string) => {
    onSelectCountry(id)
    const country = geoCountries.find((c) => c.id === id)
    if (country) {
      focusTriggerRef.current = { lat: country.center.latitude, lon: country.center.longitude }
    }
  }

  const handleGlobeClick = (iso2: string) => {
    if (iso2 === 'TR') {
      enterCountry()
    } else {
      onSelectCountry(iso2)
      setShowComingSoon(true)
      clearTimeout(comingSoonTimerRef.current)
      comingSoonTimerRef.current = setTimeout(() => setShowComingSoon(false), 2500)
    }
  }

  return (
    <div
      className="relative bg-[#0b0e14]"
      style={{ minHeight: 'calc(100dvh - 4rem)' }}
    >
      {/* Globe — own overflow-hidden wrapper to clip scale animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={[
            'absolute inset-0 transition duration-700 ease-out',
            isEntering ? 'scale-[1.06]' : 'scale-100',
          ].join(' ')}
        >
          <RealisticGlobe
            countries={geoCountries}
            focusTriggerRef={focusTriggerRef}
            isEntering={isEntering}
            onClickCountry={handleGlobeClick}
          />
        </div>
      </div>

      {/* Coming-soon toast */}
      {showComingSoon && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[7rem] z-50 flex justify-center px-4 md:bottom-8">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-5 py-3 shadow-[var(--color-panel-shadow)] backdrop-blur-xl">
            <p className="text-sm font-semibold text-[var(--color-text)]">{t('globe.countryComingSoon')}</p>
            <p className="mt-0.5 text-center text-xs text-[var(--color-text-muted)]">
              {t('globe.countryComingSoonDetail')}
            </p>
          </div>
        </div>
      )}

      {/* Panel toggle tab — always visible, slides with panel */}
      <button
        type="button"
        aria-label={t(panelOpen ? 'globe.collapsePanel' : 'globe.expandPanel')}
        onClick={() => setPanelOpen((v) => !v)}
        className={[
          'absolute top-1/2 z-30 -translate-y-1/2',
          'hidden h-12 w-8 items-center justify-center md:flex',
          'rounded-l-xl border border-r-0',
          'border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl',
          'text-[var(--color-text-muted)] transition-[right] duration-300 ease-in-out',
          'hover:text-[var(--color-text)]',
          panelOpen ? 'right-[300px] sm:right-[360px]' : 'right-0',
        ].join(' ')}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          {panelOpen ? (
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </button>

      {/* Floating panel */}
      <aside
        className={[
          'absolute bottom-0 left-0 right-0 z-20 flex max-h-[min(56dvh,30rem)] flex-col',
          'w-full rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--color-panel-shadow)]',
          'md:left-auto md:top-0 md:max-h-none md:w-[360px] md:rounded-none md:border-l md:border-t-0 md:bg-[var(--color-surface)]/95 md:backdrop-blur-2xl',
          'transition-transform duration-300 ease-in-out',
          panelOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-0 md:translate-x-full',
        ].join(' ')}
      >
        <button
          type="button"
          aria-label={t(panelOpen ? 'globe.collapsePanel' : 'globe.expandPanel')}
          onClick={() => setPanelOpen((v) => !v)}
          className="flex shrink-0 flex-col items-center px-5 pb-2 pt-3 text-[var(--color-text-muted)] md:hidden"
        >
          <span className="h-1 w-11 rounded-full bg-[var(--color-border-strong)]" />
          <span className="sr-only">
            {panelOpen ? t('globe.collapsePanel') : t('globe.expandPanel')}
          </span>
        </button>

        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-4 md:hidden">
          <div className="min-w-0">
            <p className="truncate text-xl font-bold leading-tight tracking-tight text-[var(--color-text)]">
              {selectedGeoCountry?.name ?? t('globe.turkeyName')}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--color-accent)]">
              {isTurkey ? t('globe.ankaraFocus') : t('globe.countryComingSoon')}
            </p>
          </div>
          <button
            className={[
              'h-10 shrink-0 rounded-lg px-4 text-xs font-bold transition',
              isTurkey
                ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20 active:scale-[0.98]'
                : 'cursor-not-allowed border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] opacity-50',
            ].join(' ')}
            disabled={!isTurkey}
            type="button"
            onClick={isTurkey ? enterCountry : undefined}
          >
            {isTurkey ? t('globe.enterMapShort') : t('globe.countryComingSoon')}
          </button>
        </div>

        <div
          className={[
            'flex-1 flex-col overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-0 md:px-7 md:py-8',
            panelOpen ? 'flex' : 'hidden md:flex',
          ].join(' ')}
        >
        {/* Section label */}
        <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] md:block">
          {t('globe.countryCommand')}
        </p>

        {/* Country name */}
        <h2 className="mt-4 hidden truncate text-2xl font-bold tracking-tight text-[var(--color-text)] md:block">
          {selectedGeoCountry?.name ?? t('globe.turkeyName')}
        </h2>
        <p className="mt-1.5 hidden text-sm font-medium text-[var(--color-accent)] md:block">
          {isTurkey ? t('globe.ankaraFocus') : t('globe.countryComingSoon')}
        </p>

        {/* Divider */}
        <div className="hidden h-px bg-[var(--color-border)] md:mt-6 md:block" />

        {/* Country selector */}
        <div className="mt-2 md:mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
            {t('globe.countrySelect')}
          </p>
          <div className="relative mt-3" ref={dropdownRef}>
            {/* Trigger */}
            <button
              className="flex h-11 w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-soft)]"
              type="button"
              onClick={openDropdown}
            >
              <span className="truncate">
                {selectedGeoCountry?.name ?? t('globe.turkeyName')}
              </span>
              <svg
                className="ml-2 h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--color-panel-shadow)]">
                {/* Search */}
                <div className="border-b border-[var(--color-border)] px-4 py-3">
                  <input
                    ref={searchInputRef}
                    className="w-full bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setHighlightedIndex(0)
                    }}
                  />
                </div>
                {/* List */}
                <div className="max-h-56 overflow-y-auto">
                  {filteredCountries.length === 0 ? (
                    <p className="px-4 py-3 text-xs text-[var(--color-text-muted)]">
                      {t('provinceSearch.empty')}
                    </p>
                  ) : (
                    filteredCountries.map((country, idx) => (
                      <button
                        key={country.id}
                        className={[
                          'flex w-full items-center px-4 py-2.5 text-left text-sm transition',
                          country.id === selectedCountryId
                            ? 'bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent)]'
                            : idx === highlightedIndex
                              ? 'bg-[var(--color-surface-muted)] text-[var(--color-text)]'
                              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]',
                        ].join(' ')}
                        type="button"
                        onClick={() => selectCountry(country.id)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        {country.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div className="mt-6">
          {isTurkey ? (
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <GlassInfoRow label={t('globe.selectableCountry')} value={t('globe.turkeyName')} />
              <GlassInfoRow label={t('globe.focusCapital')} value={t('globe.ankaraName')} />
              <GlassInfoRow label={t('globe.coverage')} value={t('globe.provinceNodes')} />
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-6 text-center">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                {t('globe.countryComingSoon')}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {t('globe.countryComingSoonDetail')}
              </p>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          className={[
            'mt-8 h-12 w-full rounded-xl text-sm font-bold transition',
            isTurkey
              ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20 hover:brightness-110 active:scale-[0.98]'
              : 'cursor-not-allowed border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] opacity-50',
          ].join(' ')}
          disabled={!isTurkey}
          type="button"
          onClick={isTurkey ? enterCountry : undefined}
        >
          {isTurkey ? t('globe.enterMap') : t('globe.countryComingSoon')}
        </button>

        {/* Attribution */}
        <p className="mt-5 text-[11px] leading-5 text-[var(--color-text-muted)]">
          {t('attribution.earthTexture')}
        </p>
        </div>
      </aside>
    </div>
  )
}

function RealisticGlobe({
  countries,
  focusTriggerRef,
  isEntering,
  onClickCountry,
}: {
  countries: NormalizedGlobeCountry[]
  focusTriggerRef: React.RefObject<{ lat: number; lon: number } | null>
  isEntering: boolean
  onClickCountry: (iso2: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isEnteringRef = useRef(isEntering)
  const focusStartedAtRef = useRef<number | undefined>(undefined)
  const onClickCountryRef = useRef(onClickCountry)

  useEffect(() => {
    onClickCountryRef.current = onClickCountry
  }, [onClickCountry])

  useEffect(() => {
    isEnteringRef.current = isEntering

    if (isEntering) {
      focusStartedAtRef.current = performance.now()
    }
  }, [isEntering])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0e14')

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    camera.position.set(0, 0.04, 6.1)

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: 'default',
    })
    renderer.setClearColor('#0b0e14', 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.15))
    renderer.domElement.className = 'absolute inset-0 h-full w-full'
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.9)
    const directionalLight = new THREE.DirectionalLight('#ffffff', 2.2)
    directionalLight.position.set(3.5, 2.5, 4)
    const cyanLight = new THREE.PointLight('#00f0ff', 3.5)
    cyanLight.position.set(-3, -1, 2)
    scene.add(ambientLight, directionalLight, cyanLight)

    const earthGroup = new THREE.Group()
    earthGroup.rotation.set(0.12, -0.76, 0)
    scene.add(earthGroup)

    const earthGeometry = new THREE.SphereGeometry(1.48, 48, 48)
    const atmosphereGeometry = new THREE.SphereGeometry(1.54, 32, 32)
    const texture = new THREE.TextureLoader().load('/earth-daymap.jpg')
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 2
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.02,
      roughness: 0.86,
    })
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      opacity: 0.075,
      side: THREE.BackSide,
      transparent: true,
    })
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)

    // spinGroup keeps mesh, borders, and labels rotating together
    const spinGroup = new THREE.Group()
    spinGroup.add(earthMesh, atmosphereMesh)
    earthGroup.add(spinGroup)

    // Borders — Line2 for real pixel-width control
    const lineGeometries: LineGeometry[] = []
    const borderMaterial = new LineMaterial({
      color: '#7accff',
      opacity: 0.75,
      transparent: true,
      linewidth: 1.5,
      worldUnits: false,
    })
    borderMaterial.resolution.set(container.clientWidth, container.clientHeight)

    // click-point in spinGroup local space (set on any country click)
    let focusTargetInSpin: THREE.Vector3 | null = null
    let isFocusing = false
    let autoRotateEnabled = true

    const startFocusAnimation = (hitPoint: THREE.Vector3) => {
      focusTargetInSpin = earthMesh.worldToLocal(hitPoint.clone()).normalize()
      isFocusing = true
      // Reset quaternion state so render loop reinitializes
      focusStartQuaternion = undefined
      focusEndQuaternion = undefined
      focusStartTime = undefined
    }

    for (const country of countries) {
      for (const polygon of country.polygons) {
        const rings = [polygon.outerRing, ...polygon.holes]
        for (const ring of rings) {
          const positions: number[] = []
          for (const [lon, lat] of ring) {
            const v = latLonToSphereVector(lat, lon).multiplyScalar(1.483)
            positions.push(v.x, v.y, v.z)
          }
          if (positions.length < 6) continue
          const lineGeo = new LineGeometry()
          lineGeo.setPositions(positions)
          const line = new Line2(lineGeo, borderMaterial)
          line.computeLineDistances()
          lineGeometries.push(lineGeo)
          spinGroup.add(line)
        }
      }
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.28
    controls.enableDamping = true
    controls.enablePan = false
    controls.maxDistance = 7.2
    controls.minDistance = 4.7
    controls.rotateSpeed = 0.42
    controls.zoomSpeed = 0.55

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      const isMobileViewport = width < 768

      camera.fov = isMobileViewport ? 42 : 30
      camera.aspect = width / Math.max(height, 1)
      if (!isMobileViewport) {
        camera.clearViewOffset()
      }
      camera.updateProjectionMatrix()

      controls.minDistance = isMobileViewport ? 7.2 : 4.7
      controls.maxDistance = isMobileViewport ? 9.4 : 7.2
      controls.zoomSpeed = isMobileViewport ? 0.45 : 0.55
      earthGroup.position.y = isMobileViewport ? 0.02 : 0

      if (!isFocusing && !isEnteringRef.current) {
        camera.position.setLength(isMobileViewport ? 8.4 : 6.1)
      }

      renderer.setSize(width, height, false)
      borderMaterial.resolution.set(width, height)
      controls.update()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    // Click detection — distinguish drag from click via mouse delta
    renderer.domElement.style.cursor = 'pointer'
    let mouseDownX = 0
    let mouseDownY = 0
    const raycaster = new THREE.Raycaster()
    const onMouseDown = (e: MouseEvent) => {
      mouseDownX = e.clientX
      mouseDownY = e.clientY
    }
    const onClick = (e: MouseEvent) => {
      const dx = e.clientX - mouseDownX
      const dy = e.clientY - mouseDownY
      if (Math.sqrt(dx * dx + dy * dy) > 5) return // drag, not a click

      const rect = renderer.domElement.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera)
      const hits = raycaster.intersectObject(earthMesh)
      if (hits.length === 0) return

      const local = earthMesh.worldToLocal(hits[0].point.clone())
      const [lat, lon] = vectorToLatLon(local)

      for (const country of countries) {
        for (const polygon of country.polygons) {
          if (pointInGlobePolygon([lon, lat], polygon)) {
            // Trigger focus animation for every country click
            startFocusAnimation(hits[0].point)
            autoRotateEnabled = false
            onClickCountryRef.current(country.id)
            return
          }
        }
      }
    }
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('click', onClick)

    let previousTime = performance.now()
    let animationFrameId = 0
    let isRunning = true
    let focusStartQuaternion: THREE.Quaternion | undefined
    let focusEndQuaternion: THREE.Quaternion | undefined
    let focusStartTime: number | undefined
    let focusStartCameraZ = 6.1
    const turkeySurfaceVector = latLonToSphereVector(39.1, 35.2).normalize()

    // Resume auto-rotate when user starts dragging
    controls.addEventListener('start', () => {
      if (!isEnteringRef.current) {
        autoRotateEnabled = true
        isFocusing = false
        focusStartQuaternion = undefined
        focusEndQuaternion = undefined
      }
    })

    const render = (time: number) => {
      if (!isRunning) return

      const delta = Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time

      // Handle programmatic focus from dropdown selection
      const focusReq = focusTriggerRef.current
      if (focusReq) {
        focusTriggerRef.current = null
        focusTargetInSpin = latLonToSphereVector(focusReq.lat, focusReq.lon).normalize()
        isFocusing = true
        focusStartQuaternion = undefined
        focusEndQuaternion = undefined
        focusStartTime = undefined
        autoRotateEnabled = false
      }

      if (isFocusing || isEnteringRef.current) {
        if (!focusStartQuaternion || !focusEndQuaternion) {
          // Use the ACTUAL camera direction (not a fixed (0,0,1))
          // so the focus works correctly after OrbitControls has rotated the camera
          const cameraDir = camera.position.clone().normalize()
          const frozenSpinY = spinGroup.rotation.y
          focusStartQuaternion = earthGroup.quaternion.clone()
          focusStartCameraZ = camera.position.length()
          const target = focusTargetInSpin ?? turkeySurfaceVector
          const targetInGroup = target.clone()
            .applyEuler(new THREE.Euler(0, frozenSpinY, 0))
            .normalize()
          focusEndQuaternion = new THREE.Quaternion().setFromUnitVectors(targetInGroup, cameraDir)
          focusStartTime = time
        }

        const startedAt = focusStartTime ?? focusStartedAtRef.current ?? time
        const progress = Math.min((time - startedAt) / 1350, 1)
        const eased = easeInOutCubic(progress)

        controls.autoRotate = false
        // Lock controls only during Turkey entering; keep enabled for country focus so user can drag to interrupt
        if (isEnteringRef.current) {
          controls.enabled = false
          // Zoom in further for Turkey page transition
          const startZ = focusStartCameraZ
          camera.position.setLength(THREE.MathUtils.lerp(startZ, 3.6, eased))
          camera.lookAt(0, 0, 0)
        }

        earthGroup.quaternion.slerpQuaternions(focusStartQuaternion, focusEndQuaternion, eased)

        if (progress >= 1 && !isEnteringRef.current) {
          isFocusing = false
          focusStartQuaternion = undefined
          focusEndQuaternion = undefined
        }
      } else if (autoRotateEnabled) {
        spinGroup.rotation.y += delta * 0.025
        controls.autoRotate = true
        controls.enabled = true
      } else {
        controls.autoRotate = false
      }
      controls.update()
      renderer.render(scene, camera)
      animationFrameId = window.requestAnimationFrame(render)
    }

    animationFrameId = window.requestAnimationFrame(render)

    return () => {
      isRunning = false
      window.cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('click', onClick)
      controls.dispose()
      earthGeometry.dispose()
      atmosphereGeometry.dispose()
      earthMaterial.dispose()
      atmosphereMaterial.dispose()
      borderMaterial.dispose()
      for (const geo of lineGeometries) geo.dispose()
      texture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [countries])

  return (
    <div
      className="absolute inset-0 bg-[#0b0e14]"
      ref={containerRef}
      style={{ backgroundColor: '#0b0e14' }}
    />
  )
}

function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2
}

function latLonToSphereVector(latitude: number, longitude: number) {
  const u = (longitude + 180) / 360
  const v = (90 - latitude) / 180
  const phi = u * Math.PI * 2
  const theta = v * Math.PI

  return new THREE.Vector3(
    -Math.cos(phi) * Math.sin(theta),
    Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
  )
}

function vectorToLatLon(v: THREE.Vector3): [number, number] {
  const n = v.clone().normalize()
  const lat = 90 - Math.acos(Math.max(-1, Math.min(1, n.y))) * (180 / Math.PI)
  let phi = Math.atan2(n.z, -n.x) // [-PI, PI]
  if (phi < 0) phi += 2 * Math.PI // map to [0, 2*PI]
  const lon = phi * (180 / Math.PI) - 180 // [-180, 180]
  return [lat, lon]
}

function pointInPolygon(point: [number, number], ring: number[][]): boolean {
  let inside = false
  const [px, py] = point
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = (yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function pointInGlobePolygon(point: [number, number], polygon: GlobePolygon) {
  if (!pointInPolygon(point, polygon.outerRing)) {
    return false
  }

  return !polygon.holes.some((hole) => pointInPolygon(point, hole))
}

function GlassInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="font-mono text-sm font-semibold text-[var(--color-text)]">{value}</span>
    </div>
  )
}
