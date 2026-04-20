import { useEffect, useRef, useState } from 'react'
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

type GeoCountry = {
  id: string
  name: string
  center: { latitude: number; longitude: number }
}

function computeCentroid(feature: GeoJsonFeature): { latitude: number; longitude: number } {
  const geom = feature.geometry
  if (!geom) return { latitude: 0, longitude: 0 }
  const polys: number[][][][] =
    geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates
  const mainPoly = polys.reduce((a, b) => (a[0].length > b[0].length ? a : b))
  const ring = mainPoly[0]
  let sumLon = 0, sumLat = 0
  for (const [lon, lat] of ring) {
    sumLon += lon
    sumLat += lat
  }
  return {
    latitude: sumLat / ring.length,
    longitude: sumLon / ring.length,
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
  const [geoCountries, setGeoCountries] = useState<GeoCountry[]>([])
  const comingSoonTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const focusTriggerRef = useRef<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    fetch('/countries-110m.geojson')
      .then((r) => r.json())
      .then((geojson: { features: GeoJsonFeature[] }) => {
        const loaded: GeoCountry[] = geojson.features
          .filter((f) => f.geometry && f.properties.ISO_A2 && f.properties.ISO_A2 !== '-99')
          .map((f) => ({
            id: f.properties.ISO_A2,
            name: f.properties.NAME,
            center: computeCentroid(f),
          }))
          .sort((a, b) => {
            if (a.id === 'TR') return -1
            if (b.id === 'TR') return 1
            return a.name.localeCompare(b.name)
          })
        setGeoCountries(loaded)
      })
      .catch(() => {})
  }, [])

  const selectedGeoCountry = geoCountries.find((c) => c.id === selectedCountryId)
  const isTurkey = selectedCountryId === 'TR'

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
    <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <section
        className="relative min-h-[calc(100vh-11rem)] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[#101820] shadow-[var(--color-panel-shadow)]"
        style={{ backgroundColor: '#10131a' }}
      >
        <div
          className={[
            'absolute inset-0 transition duration-700 ease-out',
            isEntering
              ? 'scale-[1.08] opacity-100 blur-0'
              : 'scale-100 opacity-100 blur-0',
          ].join(' ')}
        >
          <RealisticGlobe
            focusTriggerRef={focusTriggerRef}
            isEntering={isEntering}
            onClickCountry={handleGlobeClick}
          />
        </div>

        <div
          className={[
            'pointer-events-none absolute inset-0 z-40 grid place-items-center bg-black/50 transition duration-700',
            isEntering ? 'opacity-0' : 'opacity-0',
          ].join(' ')}
        >
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 text-center shadow-[var(--color-panel-shadow)]">
            <p className="text-sm font-semibold text-[var(--color-accent)]">
              {t('globe.approachingMap')}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {t('globe.preparingLayer')}
            </p>
          </div>
        </div>

        {showComingSoon && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-50 flex justify-center">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 shadow-[var(--color-panel-shadow)]">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {t('globe.countryComingSoon')}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {t('globe.countryComingSoonDetail')}
              </p>
            </div>
          </div>
        )}
      </section>

      <aside className="relative z-20 ml-auto w-full max-w-[380px] self-stretch rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-7 py-7 shadow-[var(--color-panel-shadow)]">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          {t('globe.countryCommand')}
        </p>
        <h3 className="mt-3 text-3xl font-bold text-[var(--color-text)]">
          {selectedGeoCountry?.name ?? t('globe.turkeyName')}
        </h3>
        <p className="mt-1 text-sm font-medium text-[var(--color-accent)]">
          {isTurkey ? t('globe.ankaraFocus') : t('globe.countryComingSoon')}
        </p>

        <div className="mt-9">
          <label
            className="text-xs font-semibold text-[var(--color-text-muted)]"
            htmlFor="country-search"
          >
            {t('globe.countrySelect')}
          </label>
          <div className="relative mt-4">
            <select
              className="h-12 w-full appearance-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 pr-12 text-sm font-semibold text-[var(--color-text)] outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
              id="country-search"
              value={selectedCountryId}
              onChange={(e) => handleCountrySelect(e.target.value)}
            >
              {geoCountries.length === 0 ? (
                <option value="TR">{t('globe.loadingCountries')}</option>
              ) : (
                geoCountries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))
              )}
            </select>
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              ▾
            </span>
          </div>
        </div>

        <div className="mt-9 py-6">
          {isTurkey ? (
            <div className="space-y-5">
              <InfoRow label={t('globe.selectableCountry')} value={t('globe.turkeyName')} />
              <InfoRow label={t('globe.focusCapital')} value={t('globe.ankaraName')} />
              <InfoRow label={t('globe.coverage')} value={t('globe.provinceNodes')} />
            </div>
          ) : (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 text-center">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                {t('globe.countryComingSoon')}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {t('globe.countryComingSoonDetail')}
              </p>
            </div>
          )}
        </div>

        <button
          className={
            isTurkey
              ? 'mt-9 h-12 w-full rounded-md bg-[var(--color-accent)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]'
              : 'mt-9 h-12 w-full cursor-not-allowed rounded-md border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text-muted)] opacity-60'
          }
          disabled={!isTurkey}
          onClick={isTurkey ? enterCountry : undefined}
          type="button"
        >
          {isTurkey ? t('globe.enterMap') : t('globe.countryComingSoon')}
        </button>

        <p className="mt-6 text-xs leading-5 text-[var(--color-text-muted)]">
          {t('attribution.earthTexture')}
        </p>
      </aside>
    </div>
  )
}

function RealisticGlobe({
  focusTriggerRef,
  isEntering,
  onClickCountry,
}: {
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

    const loadedFeatures: GeoJsonFeature[] = []
    let borderMounted = true
    fetch('/countries-110m.geojson')
      .then((res) => res.json())
      .then((geojson: { features: GeoJsonFeature[] }) => {
        if (!borderMounted) return
        for (const feature of geojson.features) {
          loadedFeatures.push(feature)
          const geom = feature.geometry
          if (!geom) continue
          const rings: number[][][] =
            geom.type === 'Polygon'
              ? geom.coordinates
              : geom.type === 'MultiPolygon'
                ? geom.coordinates.flat(1)
                : []
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

          // Country borders rendered above; skip labels (removed per UX decision)
        }
      })
      .catch(() => { /* borders are decorative – fail silently */ })

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

      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      borderMaterial.resolution.set(width, height)
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

      for (const feature of loadedFeatures) {
        const geom = feature.geometry
        if (!geom) continue
        const polys: number[][][][] =
          geom.type === 'Polygon'
            ? [geom.coordinates]
            : geom.coordinates
        for (const poly of polys) {
          if (pointInPolygon([lon, lat], poly[0])) {
            // Trigger focus animation for every country click
            startFocusAnimation(hits[0].point)
            autoRotateEnabled = false
            onClickCountryRef.current(feature.properties.ISO_A2)
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
      borderMounted = false
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
  }, [])

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span className="text-right font-mono text-sm font-semibold text-[var(--color-text)]">
        {value}
      </span>
    </div>
  )
}
