import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { COUNTRIES, type CountryId } from '../../../entities/country'

type CountryGlobeEntryProps = {
  selectedCountryId: CountryId
  onSelectCountry: (countryId: CountryId) => void
  onEnterCountry: () => void
}

type CountrySearchForm = {
  countryId: CountryId
}

export function CountryGlobeEntry({
  selectedCountryId,
  onSelectCountry,
  onEnterCountry,
}: CountryGlobeEntryProps) {
  const { t } = useTranslation()
  const [isEntering, setIsEntering] = useState(false)
  const { register } = useForm<CountrySearchForm>({
    defaultValues: {
      countryId: selectedCountryId,
    },
  })
  const selectedCountry =
    COUNTRIES.find((country) => country.id === selectedCountryId) ?? COUNTRIES[0]

  const enterCountry = () => {
    onSelectCountry('TR')
    setIsEntering(true)
    window.setTimeout(onEnterCountry, 1650)
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
          <RealisticGlobe isEntering={isEntering} />
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
      </section>

      <aside className="relative z-20 ml-auto w-full max-w-[380px] self-stretch rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-7 py-7 shadow-[var(--color-panel-shadow)]">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">
          {t('globe.countryCommand')}
        </p>
        <h3 className="mt-3 text-3xl font-bold text-[var(--color-text)]">
          {selectedCountry.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-[var(--color-accent)]">
          {t(selectedCountry.regionLabelKey)}
        </p>

        <form className="mt-9">
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
            {...register('countryId', {
              onChange: (event) => onSelectCountry(event.target.value),
            })}
          >
            {COUNTRIES.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              ▾
            </span>
          </div>
        </form>

        <div className="mt-9 space-y-5 py-6">
          <InfoRow label={t('globe.selectableCountry')} value="Türkiye" />
          <InfoRow label={t('globe.focusCapital')} value="Ankara" />
          <InfoRow label={t('globe.coverage')} value={t('globe.provinceNodes')} />
        </div>

        <button
          className="mt-9 h-12 w-full rounded-md bg-[var(--color-accent)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          onClick={enterCountry}
          type="button"
        >
          {t('globe.enterMap')}
        </button>

        <p className="mt-6 text-xs leading-5 text-[var(--color-text-muted)]">
          {t('attribution.earthTexture')}
        </p>
      </aside>
    </div>
  )
}

function RealisticGlobe({ isEntering }: { isEntering: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isEnteringRef = useRef(isEntering)
  const focusStartedAtRef = useRef<number | undefined>(undefined)

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
    earthGroup.add(earthMesh, atmosphereMesh)

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
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    let previousTime = performance.now()
    let animationFrameId = 0
    let isRunning = true
    let focusStartQuaternion: THREE.Quaternion | undefined
    let focusEndQuaternion: THREE.Quaternion | undefined
    let focusStartTime: number | undefined
    const cameraFacingVector = new THREE.Vector3(0, 0, 1)
    const turkeySurfaceVector = latLonToSphereVector(39.1, 35.2).normalize()
    const render = (time: number) => {
      if (!isRunning) {
        return
      }

      const delta = Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time
      if (isEnteringRef.current) {
        if (!focusStartQuaternion || !focusEndQuaternion) {
          focusStartQuaternion = earthGroup.quaternion.clone()
          focusEndQuaternion = new THREE.Quaternion().setFromUnitVectors(
            turkeySurfaceVector,
            cameraFacingVector,
          )
          focusStartTime = time
        }

        const startedAt = focusStartTime ?? focusStartedAtRef.current ?? time
        const progress = Math.min((time - startedAt) / 1350, 1)
        const eased = easeInOutCubic(progress)

        controls.autoRotate = false
        controls.enabled = false
        earthGroup.quaternion.slerpQuaternions(
          focusStartQuaternion,
          focusEndQuaternion,
          eased,
        )
        earthMesh.rotation.y = THREE.MathUtils.lerp(earthMesh.rotation.y, 0, eased)
        camera.position.z = THREE.MathUtils.lerp(6.1, 4.65, eased)
        camera.position.y = THREE.MathUtils.lerp(0.04, 0.1, eased)
        camera.lookAt(0, 0, 0)
      } else {
        earthMesh.rotation.y += delta * 0.025
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
      controls.dispose()
      earthGeometry.dispose()
      atmosphereGeometry.dispose()
      earthMaterial.dispose()
      atmosphereMaterial.dispose()
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
